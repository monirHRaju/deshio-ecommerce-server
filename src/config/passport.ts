import crypto from 'crypto';
import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import config from '.';
import User from '../models/user.model';

passport.serializeUser((user: any, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// ─── Google ──────────────────────────────────────────────────────────────────
if (config.google_client_id) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google_client_id,
        clientSecret: config.google_client_secret,
        callbackURL: `${config.server_url}/api/v1/auth/google/callback`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error('No email from Google'), false);

          let user = await User.findOne({ googleId: profile.id });
          if (!user) {
            user = await User.findOne({ email });
            if (user) {
              user.googleId = profile.id;
              await user.save();
            } else {
              user = await User.create({
                name: profile.displayName,
                email,
                googleId: profile.id,
                avatar: profile.photos?.[0]?.value,
                isVerified: true, // Google emails are pre-verified
                password: crypto.randomBytes(32).toString('hex'),
              });
            }
          }
          done(null, user);
        } catch (err) {
          done(err, false);
        }
      }
    )
  );
}

// ─── Facebook ────────────────────────────────────────────────────────────────
if (config.facebook_app_id) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: config.facebook_app_id,
        clientSecret: config.facebook_app_secret,
        callbackURL: `${config.server_url}/api/v1/auth/facebook/callback`,
        profileFields: ['id', 'emails', 'name', 'photos'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error('No email from Facebook'), false);

          let user = await User.findOne({ facebookId: profile.id });
          if (!user) {
            user = await User.findOne({ email });
            if (user) {
              user.facebookId = profile.id;
              await user.save();
            } else {
              user = await User.create({
                name: `${profile.name?.givenName} ${profile.name?.familyName}`.trim(),
                email,
                facebookId: profile.id,
                avatar: profile.photos?.[0]?.value,
                isVerified: true,
                password: crypto.randomBytes(32).toString('hex'),
              });
            }
          }
          done(null, user);
        } catch (err) {
          done(err, false);
        }
      }
    )
  );
}

export default passport;
