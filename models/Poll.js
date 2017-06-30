const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  strawpoll_id: {
    type: String,
    unique: true,
    required: true,
  },
  is_theme_poll: {
    type: Boolean,
    required: true,
  }
}, { timestamps: true });

const Poll = mongoose.model('Poll', pollSchema);

module.exports = Poll;
