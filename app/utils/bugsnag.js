import bugsnag from '@bugsnag/js';
import bugsnagExpress from '@bugsnag/plugin-express';


const {
  APP_BUGSNAG_KEY,
  APP_BUGSNAG_RELEASE_STAGE,
  APP_COMMIT_SHA,
} = process.env;

const bugsnagClient = bugsnag({
  apiKey: APP_BUGSNAG_KEY,
  filters: [
    'accessToken',
    'refreshToken',
  ],
  releaseStage: APP_BUGSNAG_RELEASE_STAGE,
  appVersion: APP_COMMIT_SHA,
});
bugsnagClient.use(bugsnagExpress);

export default bugsnagClient.getPlugin('express');

