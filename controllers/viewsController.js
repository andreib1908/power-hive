/* eslint-disable prefer-const */
const Tour = require('../models/tourModel');

const Station = require('../models/stationModel');
const catchAsync = require('../utils/catchAsync');
const Bank = require('../models/bankModel');
const AppError = require('../utils/appError');
// * POWERHIVE

exports.getHomePage = (req, res) => {
  res.status(200).render('home', {
    title: 'Home',
  });
};

exports.getAboutPage = (req, res) => {
  res.status(200).render('about', {
    title: 'About Us',
  });
};

exports.getRentInfoPage = (req, res) => {
  res.status(200).render('rent-info', {
    title: 'Renting Info',
  });
};

exports.getMapPage = (req, res) => {
  res.status(200).render('map', {
    title: 'Map',
  });
};

exports.getPricingPage = (req, res) => {
  res.status(200).render('pricing', {
    title: 'Pricing',
  });
};
exports.getJoinPage = (req, res) => {
  res.status(200).render('join', {
    title: 'Join Us',
  });
};

exports.getSignupPage = (req, res) => {
  res.status(200).render('signup', {
    title: 'Sign Up',
  });
};

exports.getLoginRentPage = (req, res) => {
  res.status(200).render('login', {
    title: 'Log In',
    redirectTo: '/stations-rent',
  });
};

exports.getLoginReturnPage = (req, res) => {
  res.status(200).render('login', {
    title: 'Log In',
    redirectTo: '/stations-return',
  });
};

exports.getStationsPage = catchAsync(async (req, res) => {
  const { location } = req.query;

  let filter = {};
  if (location) {
    // Support one or multiple checkboxes
    filter.location = Array.isArray(location) ? { $in: location } : location;
  }

  const stations = await Station.find(filter).sort({ freePowerBankNr: -1 });

  res.status(200).render('stations', {
    title: 'Power Stations',
    stations,
  });
});
exports.getReturnForm = (req, res) => {
  // eslint-disable-next-line prefer-destructuring
  const stationID = req.params.stationID;

  res.status(200).render('return-form', {
    title: 'Return Power Bank',
    stationID,
  });
};

exports.getPaymentPage = (req, res) => {
  // eslint-disable-next-line prefer-destructuring
  const rentalID = req.query.rentalID;

  res.status(200).render('payment', {
    title: 'Payment',
    rentalID,
  });
};

// exports.getConfirmRentPage = catchAsync(async (req, res, next) => {
//   const { stationID } = req.params;
//   const { bankID, size } = req.query;

//   const bank = await Bank.findById(bankID);
//   const station = await Station.findById(stationID);

//   if (!bank || !station) {
//     return next(new AppError('Invalid power bank or station.', 400));
//   }

//   // eslint-disable-next-line no-nested-ternary
//   const price = size === 'small' ? 5 : size === 'medium' ? 7 : 10;

//   res.status(200).render('confirm-rent', {
//     title: 'Confirm Rent',
//     bank,
//     station,
//     size,
//     price,
//   });
// });

exports.getBankRentPage = catchAsync(async (req, res, next) => {
  const { stationID } = req.params;

  const station = await Station.findById(stationID);
  if (!station) return next(new AppError('Station not found', 404));

  // Find available banks by size
  const allBanks = await Bank.find({ station: stationID, isRented: false });

  const sizes = ['small', 'medium', 'large'];
  const availability = {};

  // eslint-disable-next-line no-restricted-syntax
  for (const size of sizes) {
    const sizeBanks = allBanks.filter((b) => b.size === size);
    availability[size] = {
      count: sizeBanks.length,
      earliestBank:
        sizeBanks.sort(
          (a, b) => new Date(a.returnedAt) - new Date(b.returnedAt),
        )[0] || null,
    };
  }

  res.status(200).render('bank-rent', {
    title: 'Select Power Bank',
    stationID,
    stationName: station.name,
    availability,
  });
});

exports.getConfirmRentPage = catchAsync(async (req, res, next) => {
  const { stationID } = req.params;
  const { bankID } = req.query;

  const station = await Station.findById(stationID);
  const bank = await Bank.findById(bankID);

  if (!station || !bank)
    return next(new AppError('Invalid station or bank ID.', 404));

  const currentDate = new Date();
  const dateStr = currentDate.toLocaleDateString('en-GB');
  const timeStr = currentDate.toLocaleTimeString('en-GB');

  const price =
    // eslint-disable-next-line no-nested-ternary
    bank.size === 'small' ? '€5' : bank.size === 'medium' ? '€7' : '€10';

  res.status(200).render('confirm-rent', {
    title: 'Confirm Rent',
    location: station.location,
    currentDate: dateStr,
    currentTime: timeStr,
    size: bank.size,
    price,
    bankID,
    stationID,
  });
});

// * NATOURS UDEMY

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();

  // 2) build template

  // 3) Render that template using tour data from 1
  res.status(200).render('overview', {
    title: 'All Tours',
    tours: tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) get the data, for the requested tour (need reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  // 2) Build template

  // 3) Render template using data from 1)
  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};
