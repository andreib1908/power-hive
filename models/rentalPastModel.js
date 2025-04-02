const mongoose = require('mongoose');

const rentalPastSchema = new mongoose.Schema({
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

rentalPastSchema.virtual('stationLocation').get(function () {
  const { location = 'Unknown' } = this.station || {};
  return location;
});

// * Populating the two parent references
rentalPastSchema.pre(/^find/, function (next) {
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
rentalPastSchema.index({ rentStartTime: 1 });

const RentalPast = mongoose.model('PastRental', rentalPastSchema);
module.exports = RentalPast;
