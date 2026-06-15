export function notFound(req, res, next) {
  const err = new Error(`Not Found - ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
}

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const payload = {
    message: err.message || "Server Error",
  };
  if (process.env.NODE_ENV === "development") payload.stack = err.stack;
  res.status(statusCode).json(payload);
}
