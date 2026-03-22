/**
 * utils/errorHandler.js
 * Centralized Express error handling middleware.
 */

/**
 * errorHandler — catches all errors thrown in route handlers.
 * Formats a consistent JSON error response.
 */
function errorHandler(err, req, res, _next) {
  console.error("[ErrorHandler]", err.message || err);

  // Axios errors from the RAG service
  if (err.response) {
    return res.status(err.response.status || 502).json({
      error: "RAG service error.",
      detail: err.response.data,
    });
  }

  // Connection errors (RAG service not running, etc.)
  if (err.code === "ECONNREFUSED") {
    return res.status(503).json({
      error: "RAG service is unavailable. Please ensure it is running.",
    });
  }

  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "An unexpected error occurred.",
  });
}

module.exports = { errorHandler };
