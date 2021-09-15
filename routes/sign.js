const router = require('express').Router();
const { celebrate, Segments, Joi } = require('celebrate');

const {
  signUpUser,
  signInUser,
} = require('../controllers/users');

router.post('/signin', celebrate(
  {
    [Segments.BODY]: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  },
), signInUser);

router.post('/signup', celebrate(
  {
    [Segments.BODY]: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      name: Joi.string().min(2).max(30).required(),
    }).unknown(true),
  },
), signUpUser);

module.exports = router;
