import * as db from '../../db';

const dbMiddleware = () => (req, res, next) => {
  req.db = db;
  return next();
};

export default dbMiddleware;
