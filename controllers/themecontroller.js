var Theme = require('../models/theme');

var ThemeController = {
  findMostRecentWinningTheme: function() {
    return Theme.find({winner: {$ne:null}})
    .then((themes) => {
      var mostRecentTime = 0;
      var mostRecentWinningTheme = null;

      themes.forEach(function(theme){
        var curThemeTime = theme.winner.getTime();

        if(curThemeTime > mostRecentTime) {
          mostRecentTime = curThemeTime;
          mostRecentWinningTheme = theme;
        }
      });

      return mostRecentWinningTheme;
    });
  }
}

module.exports = ThemeController;
