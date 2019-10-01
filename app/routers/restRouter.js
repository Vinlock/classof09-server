import { Router } from 'express';
import middleware from '../lib/ExpressMiddleware';
import { configure as configurePassport } from '../lib/Passport';
import { facebookOauth, facebookOauthCallback, getUser, logoutUser } from '../rest/controllers/authController';
import { generateAccessCode, webhookHandler } from '../rest/controllers/eventbriteController';

// Configure Passport
configurePassport();

///--- Core Rest Router ---///
const restRouter = Router();

// Activate Middleware
restRouter.use(middleware({
  cors: true,
  jsonParser: true,
  urlEncodedParser: true,
  requestIdGenerator: true,
  logging: 'rest_api',
  auth: true,
  db: true,
  typeform: true,
  eventbrite: true,
}));

// Rest Test
restRouter.get('/test', async (req, res) => {
  return res.json({ ping: 'pong' })
});
///--- END Core Rest Router ---///

//--- Auth Router ---///
const authRouter = Router();
restRouter.use('/auth', authRouter);
authRouter.get('/user', getUser());
authRouter.get('/logout', logoutUser());
authRouter.get('/oauth/facebook', facebookOauth());
authRouter.get('/oauth/facebook/callback', facebookOauthCallback());
///--- END Auth Router ---///

const eventbriteRouter = Router();
restRouter.use('/eventbrite', eventbriteRouter);
eventbriteRouter.post('/webhook', webhookHandler());
eventbriteRouter.get('/purchase', generateAccessCode());

export default restRouter;