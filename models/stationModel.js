const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  // ! required
  name: {
    type: String,
    required: [true, 'A station must have a name!'],
    unique: true,
    trim: true,
  },
  // ! required
  location: {
    type: String,
    required: [true, 'A station must have a location!'],
  },
  // ! required
  ownedBy: {
    type: String,
    required: [
      true,
      'Please specify the company that owns this power station!',
    ],
  },
  installationDate: { type: Date, default: () => Date.now(), select: false },

  // ! required
  maxPowerBankNr: {
    type: Number,
    required: [
      true,
      'Please specify the maximum number of power banks that can be stored in this power station! (the sockets)',
    ],
  },
  freePowerBankNr: {
    type: Number,
    default: 0,
    validate: {
      validator: function (val) {
        return val <= this.maxPowerBankNr;
      },
      message: 'freePowerBankNr ({VALUE}) cannot exceed maxPowerBankNr!',
    },
  },
});

// Auto-update freePowerBankNr before saving
// stationSchema.pre('save', async function (next) {
//   const powerBankCount = await mongoose.model('PowerBank').countDocuments({
//     stationID: this._id,
//     isRented: false,
//   });
//   this.freePowerBankNr = powerBankCount;
//   next();
// });

// // Index location for faster searches
// stationSchema.index({ location: 1 });

const Station = mongoose.model('Station', stationSchema);
module.exports = Station;
