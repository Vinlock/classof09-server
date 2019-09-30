import Eventbrite from '../Eventbrite';

const eventbriteMiddleware = () => (req, res, next) => {
  req.Eventbrite = new Eventbrite(req.logger);
  return next();
};

export default eventbriteMiddleware;
