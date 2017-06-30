const Theme = require('../models/Theme');
/**
 * GET /themes/submit
 * Theme submission form page.
 */
exports.getThemeForm = (req, res) => {
  res.render('themeSubmit', {
    title: 'Theme Submission',
  });
};

/**
 * POST /themes/submit
 * Send a contact form via Nodemailer.
 */
exports.postThemeForm = (req, res) => {
  req.assert('name', 'Name cannot be blank').notEmpty();
  req.assert('description', 'Description cannot be blank').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/themes');
  }

  const suggestedThemeOptions = {
    name: req.body.name,
    description: req.body.description,
    submitter: req.user || null,
  };

  const suggestedTheme = new Theme(suggestedThemeOptions);
  suggestedTheme.save()
  .then((stuff) => {
    console.log("past themes");
    Theme.find({}).exec()
    .then((thing) => {
      console.log("found:");
      console.log(thing);
    })
    req.flash('success', { msg: `Theme "${suggestedTheme.name}" has been suggested!` });
    return res.redirect('/themes');

  })
  .catch((err) => {
    req.flash('errors', err);
    return res.redirect('/themes');
  })
};
