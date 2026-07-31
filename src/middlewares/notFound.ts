import type { RequestHandler } from "express";

const notFound: RequestHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    errorDetails: {
      method: req.method,
      path: req.originalUrl,
    },
  });
};

export default notFound;