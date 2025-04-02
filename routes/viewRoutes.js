const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

// ! BEFORE LOGIN
router.get('/home', viewsController.getHomePage);
router.get('/about', viewsController.getAboutPage);
router.get('/rent-info', viewsController.getRentInfoPage);
router.get('/map', viewsController.getMapPage);
router.get('/pricing', viewsController.getPricingPage);
router.get('/join', viewsController.getJoinPage);

// ! LOGIN
router.get('/signup', viewsController.getSignupPage);
router.get('/login-rent', viewsController.getLoginRentPage);
router.get('/login-return', viewsController.getLoginReturnPage);

// ! AFTER LOGIN
router.get(
  '/stations',
  authController.protect,
  viewsController.getStationsPage,
);

router.get(
  '/stations/:stationID/bank-rent',
  authController.protect,
  viewsController.getBankRentPage,
);
router.get(
  '/stations/:stationID/confirm-rent',
  authController.protect,
  viewsController.getConfirmRentPage,
);
router.get(
  '/stations/:stationID/payment',
  authController.protect,
  viewsController.getPaymentPage,
);
router.get(
  '/stations/:stationID/return-form',
  authController.protect,
  viewsController.getReturnForm,
);

// * Natours
router.get('/', viewsController.getHomePage);
router.get('/tour/:slug', viewsController.getTour);

router.get('/login', viewsController.getLoginForm);

module.exports = router;
