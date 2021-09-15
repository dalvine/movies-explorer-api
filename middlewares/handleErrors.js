module.exports = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || 'Ошибка на стороне сервера';
  res.status(status).send({ message });
  return next();
};
