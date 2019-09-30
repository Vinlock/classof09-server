import FacebookUser from '../Facebook/FacebookUser';

const facebookMiddleware = () => (req, res, next) => {
  if (req.user && req.user.info && req.user.info.facebook) {
    req.facebookUser = new FacebookUser(req.user.info.facebook.accessToken, req.user.info.facebook.refreshToken, req.logger);
  }
  next();
};

export default facebookMiddleware;
