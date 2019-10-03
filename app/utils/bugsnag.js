import bugsnag from '@bugsnag/js';

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

export const requestHandler = bugsnagClient.getPlugin('express');
export const errorHandler = bugsnagClient.getPlugin('express');
