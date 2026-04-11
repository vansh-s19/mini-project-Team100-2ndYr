const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user.model");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

console.log("Initializing Google Strategy with ID:", process.env.GOOGLE_CLIENT_ID);
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "MOCK_CLIENT_ID",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "MOCK_CLIENT_SECRET",
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("Using Google Client ID:", process.env.GOOGLE_CLIENT_ID);
      try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // If not, create new user
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          avatar: profile.photos[0].value,
        });

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

module.exports = passport;
