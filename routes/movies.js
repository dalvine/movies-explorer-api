const router = require('express').Router();
const { celebrate, Segments, Joi } = require('celebrate');
const validator = require('validator');

const {
  getMovies,
  createMovie,
  removeMovie,
} = require('../controllers/movies');

const isURL = (val) => {
  if (validator.isURL(val, { require_protocol: true })) {
    return val;
  }
  return new Error('error');
};

router.get('/movies', getMovies);

router.post('/movies', celebrate({
  [Segments.BODY]: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().uri().custom(isURL).required(),
    trailer: Joi.string().uri().custom(isURL).required(),
    thumbnail: Joi.string().uri().custom(isURL).required(),
    movieId: Joi.number().required(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
  }),
}), createMovie);

router.delete('/movies/:movieID', celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    movieID: Joi.string().hex().length(24),
  }),
}), removeMovie);

module.exports = router;
