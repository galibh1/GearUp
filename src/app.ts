import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import config from "./config/index.js";
import AppError from "./errors/AppError.js";
import globalErrorHandler from "./middlewares/globalErrorHandler.js";
import notFound from "./middlewares/notFound.js";

const app = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to GearUp API",
    data: {
      name: "GearUp",
      description: "Rent sports and outdoor gear instantly",
      version: "1.0.0",
    },
  });
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "GearUp API is healthy",
    data: {
      status: "healthy",
      environment: config.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
});

/*
 * Temporary route used only to test the global error handler.
 * We will remove it after testing.
 */
app.get(
  "/api/test-error",
  (
    _req: Request,
    _res: Response,
    next: NextFunction,
  ) => {
    next(
      new AppError(
        400,
        "This is a test error",
        {
          field: "test",
          issue: "Error handling is working correctly",
        },
      ),
    );
  },
);

app.use(notFound);
app.use(globalErrorHandler);

export default app;