const mongoose = require('mongoose');
const slugify = require('slugify');
//const User = require('./userModel');
//const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name!'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain charaters'], //from the validator npm package
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration!'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size!'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty!'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be above 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price!'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // ! THIS ONLY WORKS ON POST REQUESTS (new doc creation), NOT PATCH OR UPDATE!
          // console.log('[DB] The price is ', this.price);
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below the regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description!'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      // ! Note: We never store image files in our database. We keep the jpegs in our server folder, so we only store the path to those images in the database.
      type: String,
      required: [true, 'A tour must have a cover image!'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },

      /** Coordinates: Mongoose vs Google Maps API
       * ? Here in Mongoose we first store longitude first and latitude second.
       * ! In Google Maps API they provide latitude first and longitude second.
       */
      coordinates: [Number],
      address: String,
      description: String,
    },
    // Embbeded JSON object to hold locations of tours
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // ? Child Referencing
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtual: true },
  },
);

tourSchema.index({ price: 1 });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// * Get the associated reviews from one tour (i.e. get the parent from child in parent referencing)
// ? foreignField -> the field stored in the child element (in reviewModel)
// ? localField -> the field stored in the parent element referenced in the child element (localField here is the _id from the Tours collection)
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

//DOCUMENT MIDDLEWARE
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// ! The following commented out code is from section 11, video 151.
// ? It's still kind of useful to know this, especially when you will loop through arrays of documents
// // This only works when creating documents. Not for updating guides list.
// tourSchema.pre('save', async function (next) {
//   // Loop through guides with map.
//   // ! After doing the map async function, guidesPromises will be an array full of promises
//   // ? Need to await all of those promises and then overwrite the array
//   // ! USEFUL TO KNOW FOR PROJECT CODING
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.pre('save', function (next) {
//   console.group('Will save document...');
//   next();
// });

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

// * Populating the 'guides' array in a Tour
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`[DB] Query took ${Date.now() - this.start} milliseconds`);
  next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(`[DB] Aggregation Object: `, this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
