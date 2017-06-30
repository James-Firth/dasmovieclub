const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  submitter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  winner: {
    type: Date,
    default: null
  }
}, { timestamps: true });

const Theme = mongoose.model('Theme', themeSchema);

module.exports = Theme;
