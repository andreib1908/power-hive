const Rental = require('../models/rentalModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Bank = require('../models/bankModel');
const User = require('../models/userModel');
const Station = require('../models/stationModel');
const PastRental = require('../models/rentalPastModel');
const sendEmail = require('../utils/email');

exports.getAllRentals = factory.getAll(Rental);

exports.getRental = factory.getOne(Rental);

exports.createRental = factory.createOne(Rental);

exports.updateRental = factory.updateOne(Rental);

exports.deleteRental = factory.deleteOne(Rental);

exports.setRentalUserIds = (req, res, next) => {
  if (!req.body.user && req.user) req.body.user = req.user.id;
  next();
};

// * START RENTAL
// * POST: {{URL}}api/v1/banks/:bankID/rentals/startRental
// ? HEADER PARAMS:
// ? BODY PARAMS: 'bankID', 'userID', 'stationID'
exports.startRental = catchAsync(async (req, res, next) => {
  console.log(req.body);
  // 1) Get the power bank and user
  const bank = await Bank.findById(req.body.bankID);

  const user = await User.findById(req.user.id);

  if (!bank) return next(new AppError('No power bank found with that ID', 404));
  if (bank.isRented)
    return next(new AppError('This power bank is already rented.', 400));

  // 2) Store current station ID before setting it to null
  // Also handle station updating of freePowerBankNr
  const stationId = bank.station;
  const station = await Station.findById(stationId);
  if (!station)
    return next(
      new AppError(
        'No power station found associated with that power bank ID',
        404,
      ),
    );

  station.freePowerBankNr -= 1;
  await station.save();

  // 3) Update Power Bank state
  bank.isRented = true;
  bank.user = user._id;
  bank.station = null;
  bank.returnedAt = null;
  bank.socketNr = null;
  await bank.save(); // Save updates to the PowerBank

  // 4) Create a Rental
  const rental = await Rental.create({
    user: user._id,
    bank: bank._id,
    station: stationId, // optional, useful for location metadata
    rentStartTime: Date.now(), // optional since default handles this
  });

  const message = `
===========================
  ✅ PowerHive Rental Confirmed
===========================

Hello ${user.name || 'PowerHive user'},

Thank you for confirming your payment and renting with PowerHive! 🐝⚡

🆔 Your Rental ID: ${rental._id}

📌 Please keep this Rental ID safe. You’ll need it when returning your power bank.

📅 Rental Start Time: ${new Date(rental.rentStartTime).toLocaleString('en-GB')}
📍 Rented From Station: ${station.name} (${station.location})

⚠️ Please return the power bank at any PowerHive station within **24 hours** of rental time to avoid a €100 fine.

Need help? Just reply to this email.

Thanks for choosing PowerHive — portable power, anywhere.

Buzz buzz,  
The PowerHive Team 🐝
`;

  await sendEmail({
    email: user.email,
    subject: 'RENTAL CONFIRM - PowerHive',
    message,
  });

  res.status(201).json({
    status: 'success',
    data: {
      rental,
    },
  });
});

// * RETURN RENTAL
// * PATCH: {{URL}}api/v1/rentals/:rentailID/return
// ? HEADER PARAMS: none
// ? BODY PARAMS: 'rentalID', 'stationID', 'socketNr'
// We find the bank by using the rentalID.
exports.returnRental = catchAsync(async (req, res, next) => {
  // eslint-disable-next-line prefer-destructuring
  const rentalID = req.body.rentalID;

  // 1) Find the rental
  const rental = await Rental.findById(rentalID).populate('user');
  // eslint-disable-next-line prefer-destructuring
  const user = rental.user;

  if (!rental) return next(new AppError('No rental found with that ID.', 404));
  if (rental.rentEndTime)
    return next(new AppError('This rental has already been returned.', 400));

  // 2) Find the associated power bank
  const bank = await Bank.findById(rental.bank);
  if (!bank) return next(new AppError('Associated power bank not found.', 404));

  // 3) Determine the return station (you can pass it in req.body.station)
  const stationId = req.params.stationID || req.body.station;

  if (!stationId)
    return next(new AppError('Please specify a return station.', 400));

  const station = await Station.findById(stationId);
  if (!station) return next(new AppError('Return station not found.', 404));

  if (station.freePowerBankNr + 1 > station.maxPowerBankNr) {
    return next(
      new AppError('Station is full. Cannot return power bank here.', 400),
    );
  }

  // 4) Mark rental as returned
  rental.rentEndTime = Date.now();
  await rental.save();

  const message = `
===========================
  ✅ PowerHive Return Confirmed
===========================

Hello ${user.name},

We're happy to confirm that your power bank has been successfully returned. 🔋✅

🆔 Rental ID: ${rental._id}
📅 Return Time: ${new Date().toLocaleString('en-GB')}
📍 Returned To: ${station.name} (${station.location})
🔌 Socket Number: ${req.body.socketNr}

Thanks for keeping the hive buzzing!

If you have any questions, do not hesitate to reach us on our website!

Cheers,  
The PowerHive Team 🐝
`;
  await sendEmail({
    email: user.email,
    subject: 'RETURN CONFIRM - PowerHive',
    message,
  });
  // 5) Archive the rental in PastRentals
  await PastRental.create(rental.toObject());
  await Rental.findByIdAndDelete(rental._id); // or rental.deleteOne()

  // 6) Update the power bank
  bank.isRented = false;
  bank.socketNr = req.body.socketNr;
  bank.user = null;
  bank.station = station._id;
  bank.returnedAt = Date.now();
  await bank.save();

  // 7) Update the station
  station.freePowerBankNr += 1;
  await station.save();

  // 8) Return response (rental object was already archived, but we can still send it)
  res.status(200).json({
    status: 'success',
    message: 'Power bank successfully returned.',
    data: {
      rental, // This object is now in PastRentals
      bank,
      station,
    },
  });
});
