// Middleware: require authenticated session
module.exports.requireAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.redirect('/login');
  }
  next();
};

// Attach user to res.locals for EJS templates
module.exports.attachUser = (req, res, next) => {
  res.locals.user = req.session.userId
    ? { id: req.session.userId, name: req.session.userName, email: req.session.userEmail }
    : null;
  next();
};
