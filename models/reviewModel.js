const mongoose = require('mongoose');

// ! Parent Referencing
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: { type: Number, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now() },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must belong to a tour!'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must belong to a user!'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtual: true },
  },
);

// * Populating the two parent references
reviewSchema.pre(/^find/, function (next) {
  // ? commented code works fine to populate all the data, but in our specific implementation we want to restrict it to a few fields because there's too much nested information sent to the client. very inefficient.
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });
  // next();
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
