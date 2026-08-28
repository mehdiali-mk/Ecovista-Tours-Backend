import dns from "node:dns";
import express from "express";
import dotenv from "dotenv";
import toursRouter from "./routes/Tours.route.js";
import userRouter from "./routes/User.route.js";
import AppError from "./utils/appError.util.js";
import { globalErrorHandler } from "./controllers/Errors.controller.js";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

const app = express();

app.use(express.json());
app.set("query parser", "extended");

// Global Middlewares.
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many request, please try again after an hour!",
});
app.use("/api", limiter);

app.use("/api/v1/tours", toursRouter);
app.use("/api/v1/users", userRouter);

app.all("/{*path}", (request, response, next) => {
  next(new AppError(`Can't find ${request.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
