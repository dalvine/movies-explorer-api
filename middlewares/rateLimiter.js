const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50, // max 10 requests per minute
  message: 'Слишком частые запросы, повторите запрос позже',
});

module.exports = {
  limiter,
};
