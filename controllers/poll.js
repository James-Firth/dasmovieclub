const http = require('http');
var rp = require('request-promise');
const Poll = require('../models/Poll');
const Theme = require('../models/Theme');
const ThemeController = require('./theme');
const MovieController = require('./movie');

exports.createPoll = (names, isThemePoll) => {
  if(isThemePoll) {
    title = 'Movie Club Theme Voting';
  } else {
    title = 'Movie Club Movie Voting';
  }

  var options = {
    method: 'POST',
    uri: 'https://www.strawpoll.me/api/v2/polls',
    body: {
      title: title,
      options: names,
      multi: true,
      dupcheck: 'permissive'
    },
    json: true
  };

  rp(options)
  .then((pollData) => {
    return Poll.create({strawpoll_id:pollData.id, is_theme_poll:isThemePoll});
  })
  .catch((err) => {
    return err;
  });
};

exports.createThemePoll = () => {
  Theme.find({winner:null})
  .then((themes) => {
    var themeNames = [];

    themes.forEach(function(theme) {
      themeNames.push(theme.name);
    });

    return themeNames;
  })
  .then((themeNames) => {
    exports.createPoll(themeNames, true);
  })
  .catch((error) => {
    return error;
  });
};

exports.createMoviePoll = () => {
  ThemeController.getMostRecentThemeWinner()
  .then((theme) => {
    return Movie.find({theme: theme.id});
  })
  .then((movies) => {
    var movieNames = [];

    movies.forEach(function(movie) {
      movieNames.push(movie.name);
    });

    return movieNames;
  })
  .then((movieNames) => {
    exports.createPoll(movieNames, false);
  })
  .catch((error) => {
    return error;
  });
};

exports.goToCurrentPoll = (req, res) => {
  Poll.find({complete:false})
  .then((polls) => {
    if(polls.length > 0) {
      var mostRecentPollIndex = 0;
      if(polls.length > 1) {
        var mostRecentPollTime = 0;

        for(var i = 0; i < polls.length; i++) {
          if(polls[i].createdAt.getTime() > mostRecentPollTime) {
            mostRecentPollTime = polls[i].createdAt.getTime();
            mostRecentPollIndex = i;
          }
        }
      }

      var curPoll = polls[mostRecentPollIndex];

      res.redirect('https://www.strawpoll.me/'+curPoll.strawpoll_id);
    } else {
      res.redirect('/');
    }
  })
  .catch((error) => {
    return error;
  });
};

exports.getPollResults = (id) => {
  var options = {
    host: 'www.strawpoll.me',
    path: '/api/v2/polls/'+id,
    method: 'GET'
  };

  var request = http.request(options, function(response) {
    response.setEncoding('utf8');
    response.on('data', function(chunk){
      var responseBody = JSON.parse(chunk);
      console.log(responseBody);
      return responseBody;
    });
  });

  request.end();
};

exports.getPollWinner = () => {
  Poll.findOne({complete:false})
  .then((poll) => {
    var options = {
      uri: 'https://www.strawpoll.me/api/v2/polls/'+poll.strawpoll_id,
      json: true
    };

    rp(options)
    .then((pollResults) => {
      var winnerIndex = 0;

      var votes = pollResults.votes;

      var highestNumberOfVotes = 0;

      for(var i = 0; i < votes.length; i++) {
        if(votes[i] > highestNumberOfVotes) {
          winnerIndex = i;
          highestNumberOfVotes = votes[i];
        }
      }
      var winnerName = pollResults.options[winnerIndex];

      return Poll.update({strawpoll_id:poll.strawpoll_id}, {complete:true})
      .then(() => {
        if(poll.is_theme_poll) {
          return ThemeController.updateTheme(winnerName, {winner: new Date()});
        } else {
          return MovieController.updateMovie(winnerName, {winner: new Date()});
        }
      });
    })
    .catch((err) => {
      return err;
    });
  })
  .catch((error) => {
    return error;
  });
};

exports.updatePoll = (id, update) => {
  return Poll.update({strawpoll_id:id}, update);
};
