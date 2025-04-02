const express = require('express');
const rentalController = require('../controllers/rentalController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect, authController.restrictTo('user', 'admin'));

router
  .route('/startRental')
  .post(
    authController.protect,
    rentalController.setRentalUserIds,
    rentalController.startRental,
  );

router
  .route('/return')
  .patch(rentalController.setRentalUserIds, rentalController.returnRental);

router.route('/').get(rentalController.getAllRentals);

router
  .route('/:id')
  .get(rentalController.getRental)
  .patch(rentalController.updateRental)
  .delete(rentalController.deleteRental);

module.exports = router;
