const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {
  isCelebrateError,
} = require('celebrate');

const cors = require('cors');
const helmet = require('helmet');
const { limiter } = require('./middlewares/rateLimiter');

require('dotenv').config();

const { requestLogger, errorLogger } = require('./middlewares/logger');

// Errors
const BadRequestError = require('./errors/bad-request');
const NotFoundError = require('./errors/not-found-err');
const handleErrors = require('./middlewares/handleErrors');

const { PORT = 3000, DB_URL } = process.env;

const auth = require('./middlewares/auth');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(requestLogger);
app.use(limiter);
app.use(helmet());
app.use(cors({
  origin: '*',
}));

app.use(require('./routes/sign'));

app.use(auth);

app.use(require('./routes/users'));
app.use(require('./routes/movies'));

app.use((req, res, next) => {
  if (!req.route) return next(new NotFoundError('Ресурс не найден'));
  return next();
});

app.use(errorLogger);

app.use((err, res, req, next) => {
  if (isCelebrateError(err)) next(new BadRequestError('Ошибка валидации данных'));
  return next(err);
});

app.use(handleErrors);
app.listen(PORT);
