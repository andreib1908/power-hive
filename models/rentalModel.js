const mongoose = require('mongoose');
const PastRental = require('./rentalPastModel');

const rentalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bank',
    required: true,
  },
  station: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
  },
  rentStartTime: {
    type: Date,
    default: Date.now,
  },
  rentEndTime: {
    type: Date,
    default: null,
  },
});

// Ensure only one active rental per power bank
rentalSchema.index(
  { pBank: 1 },
  { unique: true, partialFilterExpression: { rentEndTime: null } },
);

rentalSchema.virtual('stationLocation').get(function () {
  const { location = 'Unknown' } = this.station || {};
  return location;
});

// * Populating the two parent references
rentalSchema.pre(/^find/, function (next) {
  // ? commented code works fine to populate all the data, but in our specific implementation we want to restrict it to a few fields because there's too much nested information sent to the client. very inefficient.
  this.populate({
    path: 'bank',
  })
    .populate({
      path: 'user',
      select: 'name email',
    })
    .populate({
      path: 'station',
    });
  next();
});

// Optimize queries on active rentals
rentalSchema.index({ rentStartTime: 1 });

const Rental = mongoose.model('Rental', rentalSchema);
module.exports = Rental;
