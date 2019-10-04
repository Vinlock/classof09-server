import { Router } from 'express';
import middleware from '../lib/ExpressMiddleware';
import { configure as configurePassport } from '../lib/Passport';
import * as authController from '../rest/controllers/authController';
import * as eventbriteController from '../rest/controllers/eventbriteController';

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
authRouter.get('/user', authController.getUser());
authRouter.get('/logout', authController.logoutUser());
authRouter.get('/oauth/facebook', authController.facebookOauth());
authRouter.get('/oauth/facebook/callback', authController.facebookOauthCallback());
///--- END Auth Router ---///

const eventbriteRouter = Router();
restRouter.use('/eventbrite', eventbriteRouter);
eventbriteRouter.put('/order', eventbriteController.purchase());
eventbriteRouter.post('/webhook', eventbriteController.webhookHandler());
eventbriteRouter.get('/purchase', eventbriteController.generateAccessCode());

export default restRouter;