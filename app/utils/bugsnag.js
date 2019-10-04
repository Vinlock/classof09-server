import bugsnag from '@bugsnag/js';
import bugsnagExpress from '@bugsnag/plugin-express';


const {
  APP_BUGSNAG_KEY,
  APP_BUGSNAG_RELEASE_STAGE,
} = process.env;

const bugsnagClient = bugsnag({
  apiKey: APP_BUGSNAG_KEY,
  filters: [
    'accessToken',
    'refreshToken',
  ],
  releaseStage: APP_BUGSNAG_RELEASE_STAGE,
});
bugsnagClient.use(bugsnagExpress);

export const requestHandler = bugsnagClient.getPlugin('express');
export const errorHandler = bugsnagClient.getPlugin('express');
