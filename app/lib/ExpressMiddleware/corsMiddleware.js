import cors from 'cors';

const {
  APP_HOME_PAGE,
} = process.env;

const whitelist = [
  APP_HOME_PAGE,
];

const corsMiddleware = () => (req, res, next) => cors({
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
    }
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      res.status(401);
    }
  },
  optionsSuccessStatus: 200,
  credentials: true,
})(req, res, next);

export default corsMiddleware;
