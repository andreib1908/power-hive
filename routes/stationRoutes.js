const express = require('express');
const stationController = require('../controllers/stationController');
const authController = require('../controllers/authController');
const rentalRouter = require('./rentalRoutes');

const router = express.Router();

// * Nested Route
router.use('/:stationID/rentals', rentalRouter);

router
  .route('/')
  .get(stationController.getAllStations)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    stationController.createStation,
  );

router
  .route('/:id')
  .get(stationController.getStation)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    stationController.updateStation,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    stationController.deleteStation,
  );

module.exports = router;
