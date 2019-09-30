import jwt from 'jsonwebtoken';
import passport from 'passport';

const {
  APP_JWT_SECRET,
  APP_HOME_PAGE,
  APP_COOKIE_DOMAIN,
  APP_DEV_MODE,
  APP_TYPEFORM_SURVEY_ID,
} = process.env;

export const getUser = () => async (req, res) => {
  if (!req.user) {
    return res.status(403).send(null);
  }

  const { surveyId } = req.query;

  // Get user
  const { user } = req;

  const userData = {
    name: `${user.firstName} ${user.lastName}`,
    facebookId: user.facebook.id,
    totalEntries: 0,
    surveyDone: false,
    purchasedTickets: 0,
    purchased: false,
    ticketsLeft: 0,
  };

  let saveUser = false;

  if (surveyId) {
    const responses = await req.Typeform.getResponses(surveyId, {
      pageSize: 1000,
    });

    // Check if user did typeform survey.
    if (!user.typeform.responseId) {
      const userResponse = responses.items.find((response) => {
        return response.hidden.id === user.facebook.id || response.hidden.id === user.email;
      });
      if (userResponse) {
        user.typeform.responseId = userResponse.response_id;
        saveUser = true;
        userData.surveyDone = true;
      }
    } else {
      userData.surveyDone = true;
    }

    // Check number of total typeform entries.
    userData.totalEntries = responses.total_items;
  }

  // Check number of purchased tickets.

  // Check if user purchased already.

  if (saveUser) {
    await user.save();
  }

  return res.json(userData);
};

export const logoutUser = () => (req, res) => {
  let { redirect } = req.query;
  res.cookie('token', null);
  if (!redirect) {
    redirect = APP_HOME_PAGE;
  }
  return res.redirect(redirect);
};

export const facebookOauth = () => {
   return passport.authenticate('facebook', {
     scope: [ 'email', 'public_profile' ],
   });
};

export const facebookOauthCallback = () => (req, res, next) => {
  passport.authenticate('facebook', (err, user, info) => {
    if (err) {
      return res.redirect(`${APP_HOME_PAGE}?error=${err.message}`);
    }
    if (user) {
      req.user = user;
      const jwtToken = jwt.sign({ userId: user._id }, APP_JWT_SECRET);
      res.cookie('token', jwtToken, {
        domain: APP_COOKIE_DOMAIN,
        secure: APP_DEV_MODE !== 'true',
        httpOnly: false,
      });
    }
    return res.redirect(APP_HOME_PAGE);
  })(req, res, next);
};