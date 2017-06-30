const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true
  },
  description: String,
  submitter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  winner: {
    type: Date,
    default: null
  }
}, { timestamps: true });

const Theme = mongoose.model('Theme', themeSchema);

module.exports = Theme;
