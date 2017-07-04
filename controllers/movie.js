const Movie = require('../models/Movie');

exports.updateMovie = (name, update) => {
  return Movie.update({name:name}, update);
}
