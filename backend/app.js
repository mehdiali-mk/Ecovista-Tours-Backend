import dns from "node:dns";
import express from "express";
import dotenv from "dotenv";
import toursRouter from "./routes/Tours.route.js";
import userRouter from "./routes/User.route.js";
import AppError from "./utils/appError.util.js";
import { globalErrorHandler } from "./controllers/Errors.controller.js";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";

const app = express();

app.use(express.json({ limit: "10kb" }));
app.set("query parser", "extended");

// Global Middlewares.
// Headers Security.
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  }),
);

// Development Middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// RateLimit Api Middleware
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many request, please try again after an hour!",
});
app.use("/api", limiter);

// Actual routs of application.
app.use("/api/v1/tours", toursRouter);
app.use("/api/v1/users", userRouter);

// Handling 404 page not found error.
app.all("/{*path}", (request, response, next) => {
  next(new AppError(`Can't find ${request.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
