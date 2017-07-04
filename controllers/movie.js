const Movie = require('../models/Movie');
const Theme = require('../models/Theme');
const unirest = require('unirest');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
/**
 * GET /movies
 * Movie submission form page.
 */
exports.getMovies = (req, res) => {
  Movie.find({})
  .populate('submitter')
  .populate('theme')
  .exec()
  .then((movies) => {
    return Promise.all(movies.map((movie) => {
      return new Promise((resolve, reject) => {
        if (movie.moviedb_id) {
          return unirest.get(`https://api.themoviedb.org/3/movie/${movie.moviedb_id}?api_key=${process.env.MOVIEDB_KEY}&include_adult=false`)
          .end((response) => {
            if (response.ok) {
              resolve(Object.assign(movie, response.body));
            }
            return reject(response.error);
          })
        }
        return unirest.get(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIEDB_KEY}&include_adult=false&query=${encodeURI(movie.name)}`)
        .end((response) => {
          if (response.ok) {
            let results = response.body.results;
            let movieData = {};
            if (Array.isArray(results)) {
              movieData = results[0];
            }
            resolve(Object.assign(movie, movieData));
          }
          return reject(response.error);
        })
      })
    }))
  })
  .then((movies) => {
    unirest.get(`https://api.themoviedb.org/3/configuration?api_key=${process.env.MOVIE_DB_KEY}`)
    .end((response) => {
      let posterBase = 'https://image.tmdb.org/t/p'
      let posterSize = 'w185'
      if(response.ok) {
        if (response.body.poster_sizes) {
          postersize = response.body.poster_sizes[3]
        }
      }
      res.render('movies', {
        title: 'Movies',
        posterBase: `${posterBase}/${posterSize}`,
        movies,
      });
    })
  })
  .catch((err) => {
    req.flash('errors', err);
    return res.redirect('/');
  })
};

exports.findMostRecentWinningMovie = () => {
  return Movie.find({winner: {$ne:null}})
  .then((movies) => {
    var mostRecentTime = 0;
    var mostRecentWinningMovie = null;

    movies.forEach(function(movie){
      var curMovieTime = movie.winner.getTime();

      if(curMovieTime > mostRecentTime) {
        mostRecentTime = curMovieTime;
        mostRecentWinningMovie = movie;
      }
    });
    console.log(mostRecentWinningMovie);

    return mostRecentWinningMovie;
  });
}

exports.listMovies = (req, res) => {
  Movie.find({})
  .populate('submitter')
  .exec()
  .then((Movies) => {
    return res.json(Movies);
  })
  .catch((err) => {
    return res.status(500).send(err);
  })
}

/**
 * GET /movies/submit
 * Movie submission form page.
 */
exports.getMovieForm = (req, res) => {
  Theme.find({})
  .exec()
  .then((themes) => {
    res.render('movieSubmit', {
      title: 'Movie Submission',
      themes
    });
  })
};

/**
 * POST /movies/submit
 * Send a contact form via Nodemailer.
 */
exports.postMovieForm = (req, res) => {
  req.assert('name', 'Name cannot be blank').notEmpty();
  req.assert('theme', 'Must select a theme').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/movies');
  }

  const suggestedMovieOptions = {
    name: req.body.name,
    moviedb_id: req.body.moviedb_id || null,
    theme: ObjectId(req.body.theme),
    submitter: req.user || null,
  };

  const suggestedMovie = new Movie(suggestedMovieOptions);
  suggestedMovie.save()
  .then((stuff) => {
    req.flash('success', { msg: `Movie "${suggestedMovie.name}" has been suggested!` });
    return res.redirect('/movies');
  })
  .catch((err) => {
    req.flash('errors', err);
    return res.redirect('/movies/submit');
  })
};

exports.updateMovie = (name, update) => {
  return Movie.update({name:name}, update);
}
