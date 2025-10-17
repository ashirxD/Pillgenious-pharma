const passport = require('../utils/passport');

function requireAuth(req, res, next) {
  return passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    req.user = user;
    next();
  })(req, res, next);
}

module.exports = requireAuth;
