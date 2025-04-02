const mongoose = require('mongoose');
const AppError = require('../utils/appError');

const bankSchema = new mongoose.Schema({
  size: { type: String, enum: ['small', 'medium', 'large'], default: 'small' },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  station: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    default: null,
  },

  isRented: { type: Boolean, default: false },
  socketNr: { type: Number, default: null },

  returnedAt: { type: Date, default: null }, // Last return timestamp
});

// Prevents a power bank from being at a station and rented at the same time
bankSchema.pre('save', function (next) {
  if (this.user && this.station) {
    return next(
      new AppError(
        "A power bank can't be at a station and with a user at the same time!",
        401,
      ),
    );
  }
  next();
});

// Virtual field to compute time spent at a station
// bankSchema.virtual('timeSpentAtPS').get(function () {
//   if (!this.isRented && this.returnedAt) {
//     const now = new Date();
//     return (now - this.returnedAt) / (1000 * 60 * 60); // Hours
//   }
//   return null;
// });

// Index for fast lookups
//bankSchema.index({ stationID: 1, isRented: 1 });

// * Populating the two parent references
bankSchema.pre(/^find/, function (next) {
  // ? commented code works fine to populate all the data, but in our specific implementation we want to restrict it to a few fields because there's too much nested information sent to the client. very inefficient.
  this.populate({
    path: 'station',
  }).populate({
    path: 'user',
    select: 'name email',
  });
  next();
});

const Bank = mongoose.model('Bank', bankSchema);
module.exports = Bank;
