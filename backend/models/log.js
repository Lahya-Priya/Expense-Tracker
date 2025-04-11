const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  message: String,
  serverStatus: String,
  environment: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Log', logSchema);
