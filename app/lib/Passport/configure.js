import passport from 'passport';
import FacebookStrategy from 'passport-facebook';
import { User } from '../../db';
import { FacebookUser } from '../Facebook';

const {
  APP_FACEBOOK_CLIENT_ID,
  APP_FACEBOOK_SECRET,
  APP_SITE_URL,
  APP_EVENTBRITE_ORGANIZATION_ID,
  APP_EVENTBRITE_EVENT_ID,
} = process.env;

const configure = () => {
  // Configure Facebook OAuth Strategy
  passport.use(new FacebookStrategy({
    clientID: APP_FACEBOOK_CLIENT_ID,
    clientSecret: APP_FACEBOOK_SECRET,
    callbackURL: `${APP_SITE_URL}/rest/auth/oauth/facebook/callback`,
    passReqToCallback: true,
  }, async (req, accessToken, refreshToken, _, done) => {
    if (req.user) {
      return done(null, req.user);
    }
    const facebookUser = new FacebookUser(accessToken, refreshToken, req.logger);
    const profile = await facebookUser.getProfile();
    const { id, firstName, lastName, email } = profile;
    if (!email) {
      // E-Mail is not verified
      return done(new Error('EMAIL_NOT_VERIFIED'), null);
    }
    req.bugsnag.metaData.facebookUser = profile;
    try {
      let user = await User.findOne({'facebook.id': id});
      if (!user) {
        user = await User.create({
          firstName,
          lastName,
          email,
          facebook: {
            id, accessToken, refreshToken,
          },
        });
      } else {
        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;
        user.facebook.id = id;
        user.facebook.accessToken = accessToken;
        user.facebook.refreshToken = refreshToken;
        await user.save();
      }
      if (!user.eventbrite.accessCode) {
        const { code, id } = await req.Eventbrite.createAccessCode(APP_EVENTBRITE_ORGANIZATION_ID, APP_EVENTBRITE_EVENT_ID);
        user.eventbrite.accessCode = code;
        user.eventbrite.accessCodeId = id;
        await user.save();
      }
      return done(null, user);
    } catch (err) {
      req.bugsnag.notify(err);
      if (err.message.startsWith('E11000')) {
        return done(new Error('DUPLICATE_USER'), null);
      } else {
        return done(err, null);
      }
    }
  }));
};

export default configure;
