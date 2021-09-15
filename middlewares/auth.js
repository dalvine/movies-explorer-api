const jwt = require('jsonwebtoken');

const { JWT_SECRET = 'some-secret' } = process.env;
// Error
const ForbiddenError = require('../errors/forbidden');
const UnauthorizedError = require('../errors/unauthorized');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new ForbiddenError('Необходима авторизация'));
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return next(new UnauthorizedError('Некорректный JSON веб-токен'));
  }

  req.user = payload;
  return next();
};
