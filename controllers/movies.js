const Movie = require('../models/movie');

// Errors
const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request');
const ForbiddenError = require('../errors/forbidden');

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

const getMovies = async (req, res) => {
  const userID = req.user._id;
  const movies = await Movie.find({ owner: userID });
  res.send(movies);
};

const createMovie = async (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;

  const movie = await Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner: req.user._id,
  }).catch((err) => handleError(err, next));
  res.send(movie);
};

const removeMovie = async (req, res, next) => {
  const { movieID } = req.params;
  const movie = await Movie.findById({ _id: movieID })
    .catch((err) => {
      handleError(err, next);
    });

  if (!movie) return next(new NotFoundError('Фильм не найден'));

  const ownerId = movie.owner.toString();
  const userId = req.user._id.toString();

  if (ownerId !== userId) return next(new ForbiddenError('Вы можете удалять только свои сохраненные фильмы'));

  const deleteMovie = await Movie.findByIdAndRemove(movieID)
    .catch((err) => handleError(err, next));
  return res.send(deleteMovie);
};

module.exports = {
  getMovies,
  createMovie,
  removeMovie,
};
