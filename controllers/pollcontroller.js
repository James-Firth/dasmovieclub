var http = require('http');
var Poll = require('../models/poll');
var Theme = require('../models/theme');
var ThemeController = require('themecontroller.js');

var PollController = {
  createThemePoll: function(movieClubNumber) {
    Theme.find({winner:null}, function(err, themes) {
      var themeNames = [];

      themes.forEach(function(theme) {
        themeNames.push(theme.name);
      });

      var body = JSON.stringify({
        title: 'Movie Club #'+movieClubNumber+' Theme Voting',
        options: themeNames,
        multi: true,
        dupcheck: 'permissive'
      });

      var options = {
        host: 'www.strawpoll.me',
        path: '/api/v2/polls',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      };

      var request = http.request(options, function(response) {
        response.setEncoding('utf8');
        response.on('data', function(chunk){
          var responseBody = JSON.parse(chunk);
          return Poll.create({strawpoll_id:chunk.id, is_theme_poll:true});
        });
      });

      request.write(body);
      request.end();
    });
  },
  createMoviePoll: function() {
    themeController.getMostRecentThemeWinner()
    .then((theme) => {
      Movie.find({theme: theme.id}, function(err, movies) {
        var movieNames = [];

        movies.forEach(function(movie) {
          movieNames.push(movie.name);
        });

        var body = JSON.stringify({
          title: 'Movie Club #'+movieClubNumber+' Movie Voting',
          options: movieNames,
          multi: true,
          dupcheck: 'permissive'
        });

        var options = {
          host: 'www.strawpoll.me',
          path: '/api/v2/polls',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body)
          }
        };

        var request = http.request(options, function(response) {
          response.setEncoding('utf8');
          response.on('data', function(chunk){
            var responseBody = JSON.parse(chunk);
            return Poll.create({strawpoll_id:chunk.id, is_theme_poll:false});
          });
        });

        request.write(body);
        request.end();
      });
    })
    .catch((error) => {
      return error;
    });
  }
}

module.exports = PollController;
