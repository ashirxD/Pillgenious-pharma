const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User');

const jwtOptions = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: process.env.JWT_SECRET || 'dev-secret',
};

passport.use(
	new JwtStrategy(jwtOptions, async (payload, done) => {
		try {
			const user = await User.findById(payload.sub).select('-password');
			if (!user) return done(null, false);
			return done(null, user);
		} catch (err) {
			return done(err, false);
		}
	}),
);

module.exports = passport;
