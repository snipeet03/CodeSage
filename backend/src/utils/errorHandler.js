// ─── Global Express error handler ────────────────────────────────────────────
export const errorHandler = (err, req, res, next) => {
  console.error("❌ Server error:", err.message);

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
