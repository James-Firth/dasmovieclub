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
