const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  moviedb_id: {
    type: String,
    required: false,
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

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
