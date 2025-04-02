const Review = require('../models/reviewModel');
//const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
  // the if statement is for nested routes (found at the bottom of tourRoutes file)
  if (!req.body.tour) req.body.tour = req.params.tourID;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

// GET all reviews
exports.getAllReviews = factory.getAll(Review);

// GET one review
exports.getReview = factory.getOne(Review);

// POST one review
exports.createReview = factory.createOne(Review);

// PATCH one review
exports.updateReview = factory.updateOne(Review);

// DELETE one review
exports.deleteReview = factory.deleteOne(Review);
