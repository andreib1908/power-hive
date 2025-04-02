const express = require('express');
const bankController = require('../controllers/bankController');
const authController = require('../controllers/authController');

const router = express.Router();
const rentalRouter = require('./rentalRoutes');

// * Nested Route
router.use('/:bankID/rentals', rentalRouter);

router
  .route('/')
  .get(bankController.getAllBanks)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    bankController.createBank,
  );

router
  .route('/:id')
  .get(bankController.getBank)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    bankController.updateBank,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    bankController.deleteBank,
  );

module.exports = router;
