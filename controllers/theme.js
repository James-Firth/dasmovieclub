const Theme = require('../models/Theme');
/**
 * GET /themes
 * Theme submission form page.
 */
exports.getThemes = (req, res) => {
  Theme.find({})
  .populate('submitter')
  .exec()
  .then((themes) => {
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

exports.listThemes = (req, res) => {
  Theme.find({})
  .populate('submitter')
  .exec()
  .then((themes) => {
    return res.json(themes);
  })
  .catch((err) => {
    return res.status(500).send(err);
  })
}
