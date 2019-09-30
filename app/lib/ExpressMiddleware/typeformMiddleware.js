import Typeform from '../Typeform';

const typeformMiddleware = () => (req, res, next) => {
  req.Typeform = new Typeform(req.logger);
  return next();
};

export default typeformMiddleware;
