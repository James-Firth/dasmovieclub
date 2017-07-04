const Theme = require('../models/Theme');
/**
 * GET /themes
 * Theme submission form page.
 */
exports.getThemes = (req, res) => {
  Theme.find({})
  .populate('submitter')
  .exec()
  .then((themes, b, c) => {
    res.render('themes', {
      title: 'Theme',
      themes
    });
  })
  .catch((err) => {
    req.flash('errors', err);
    return res.redirect('/');
  })
};

exports.findMostRecentWinningTheme = () => {
  Theme.find({winner: {$ne:null}})
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

exports.updateTheme = (name, update) => {
  return Theme.update({name:name}, update);
}
