const Bank = require('../models/bankModel');
const factory = require('./handlerFactory');

exports.getAllBanks = factory.getAll(Bank);

exports.getBank = factory.getOne(Bank);

exports.createBank = factory.createOne(Bank);

exports.updateBank = factory.updateOne(Bank);

exports.deleteBank = factory.deleteOne(Bank);
