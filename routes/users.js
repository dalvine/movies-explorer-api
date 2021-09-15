const router = require('express').Router();
const { celebrate, Segments, Joi } = require('celebrate');
const validator = require('validator');

const isEmail = (val) => {
  if (validator.isEmail(val)) {
    return val;
  }
  return new Error('error');
};

const {
  getCurrentUser,
  updateUser,
} = require('../controllers/users');

router.get('/users/me', getCurrentUser);

router.patch('/users/me', celebrate({
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    email: Joi.string().email().custom(isEmail).required(),
  }),
}), updateUser);

module.exports = router;
