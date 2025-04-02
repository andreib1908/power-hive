const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const stationRouter = require('./routes/stationRoutes');
const bankRouter = require('./routes/bankRoutes');
const rentalRouter = require('./routes/rentalRoutes');

// Start the Express App
const app = express();

// * PUG Templates and Views
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// *  Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// * Setting Security HTTP Headers
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // 👈 allow inline scripts
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
    },
  }),
);

// * GLOBAL Middleware Section

// * Use Morgan for logging in development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(methodOverride('_method'));

// * Limit Requests
// how many requests can a client make in a given time? here we set 100 requests per hour
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: '[S] Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);

// * Parses incoming JSON payloads. Body parser. Read data from body into req.body
app.use(
  express.json({
    limit: '10kb',
  }),
);

app.use(cookieParser());

// * Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// * Data sanitization against XSS
app.use(xss());

// * Prevent Parameter Polution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuality',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// * Adds request time to each request object.
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log('[S] Generated Cookie:', req.cookies);

  next();
});

// * API ROUTES

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/stations', stationRouter);
app.use('/api/v1/banks', bankRouter);
app.use('/api/v1/rentals', rentalRouter);

// * Handle unmatched routes.
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// * ERROR CONTROLLER
app.use(globalErrorHandler);

// * Export the configured Express app.
module.exports = app;
