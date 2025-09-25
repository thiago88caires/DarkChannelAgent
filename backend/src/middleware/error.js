export function notFound(_req, res) {
  res.status(404).json({ code: 'not_found', message: 'Route not found' });
}

export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const payload = {
    code: err.code || 'internal_error',
    message: err.message || 'Unexpected error'
  };
  res.status(status).json(payload);
}

