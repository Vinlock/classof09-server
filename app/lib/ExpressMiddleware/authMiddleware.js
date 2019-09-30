import jwt from 'jsonwebtoken';

const {
  APP_JWT_SECRET,
} = process.env;

const authMiddleware = () => async (req, res, next) => {
  let { token } = req.cookies;
  if (!token) {
    token = req.headers.authorization;
    if (token) {
      if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
      }
    }
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, APP_JWT_SECRET);
      if (decoded.userId) {
        req.user = await req.db.User.findOne({ _id: decoded.userId });
      }
    } catch (err) {
      console.error(err);
      return next();
    }
  }

  return next();
};

export default authMiddleware;
