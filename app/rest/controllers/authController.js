import jwt from 'jsonwebtoken';
import passport from 'passport';

const {
  APP_JWT_SECRET,
  APP_HOME_PAGE,
  APP_COOKIE_DOMAIN,
  APP_DEV_MODE,
  APP_TYPEFORM_SURVEY_ID,
  APP_EVENTBRITE_ORGANIZATION_ID,
  APP_EVENTBRITE_EVENT_ID,
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
    ticketType: null,
    code: null,
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

  if (user.eventbrite.ticketType) {
    userData.ticketType = user.eventbrite.ticketType;
  }

  // Check number of purchased tickets.

  // Check if user purchased already.
  if (user.eventbrite.purchased) {
    userData.purchased = true;
  } else if (user.eventbrite.accessCodeId) {
    userData.purchased = await req.Eventbrite.checkAccessCodeStatus(user.eventbrite.accessCodeId);
    if (userData.purchased) {
      user.eventbrite.purchased = true;
      saveUser = true;
    }
  }

  userData.code = user.eventbrite.accessCode;
  if (!userData.code) {
    const {code, id} = await req.Eventbrite
      .createAccessCode(APP_EVENTBRITE_ORGANIZATION_ID, APP_EVENTBRITE_EVENT_ID);

    userData.code = code;
    user.eventbrite.accessCode = code;
    user.eventbrite.accessCodeId = id;
    saveUser = true;
  }

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