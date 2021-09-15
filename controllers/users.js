const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const { JWT_SECRET = 'some-secret' } = process.env;

// Errors
const BadRequestError = require('../errors/bad-request');
const ConflictError = require('../errors/conflict');
const UnauthorizedError = require('../errors/unauthorized');

function handleError(err, next) {
  switch (err.name) {
    case 'ValidationError':
      next(new BadRequestError('Ошибка валидации переданных данных'));
      break;
    case 'CastError':
      next(new BadRequestError('Переданы некорректные данные'));
      break;
    default:
      next(err);
  }
}

const signUpUser = async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return next(new BadRequestError('Заполните все поля'));
  if (!validator.isEmail(email)) return next(new BadRequestError('Введен некорректный e-mail'));

  const checkUser = await User.findOne({ email }).catch((err) => handleError(err, next));
  if (checkUser) return next(new ConflictError('Пользователь с данным e-mail уже зарегистрирован'));

  const hash = await bcrypt.hash(password, 10).catch((err) => handleError(err, next));

  const user = await User.create({ name, email, password: hash })
    .catch((err) => handleError(err, next));
  return res.send({
    name: user.name, _id: user._id, email: user.email,
  });
};

const signInUser = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new BadRequestError('Заполните все поля'));
  if (!validator.isEmail(email)) return next(new UnauthorizedError('Введен некорректный e-mail'));

  const user = await User.findOne({ email }).select('+password').catch((err) => handleError(err, next));
  if (!user) return next(new UnauthorizedError('Неправильные почта или пароль'));

  const matched = await bcrypt.compare(password, user.password)
    .catch((err) => handleError(err, next));
  if (!matched) return next(new UnauthorizedError('Неправильные почта или пароль'));

  const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });
  return res.send({ token });
};

const getCurrentUser = async (req, res, next) => {
  const user = await User.findOne({ _id: req.user._id }).catch((err) => handleError(err, next));
  return res.send(user);
};

function updateUser(req, res, next) {
  const { email, name } = req.body;
  if (!email || !name) return next(new BadRequestError('Заполните все поля'));
  return User.findOne({ email })
    .then((result) => {
      if (result) return next(new ConflictError('Данный email уже зарегистрирован'));
      return User.findByIdAndUpdate(
        req.user._id,
        { email, name },
        { new: true, runValidators: true },
      )
        .then((user) => res.send(user))
        .catch((err) => handleError(err, next));
    })
    .catch((err) => handleError(err, next));
}

module.exports = {
  getCurrentUser,
  updateUser,
  signUpUser,
  signInUser,
};
