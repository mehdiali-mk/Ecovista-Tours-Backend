import dns from "node:dns";
import express from "express";
import dotenv from "dotenv";
import toursRouter from "./routes/Tours.route.js";
import userRouter from "./routes/User.route.js";
import AppError from "./utils/appError.util.js";
import { globalErrorHandler } from "./controllers/Errors.controller.js";

const app = express();

app.use(express.json());
app.set("query parser", "extended");

app.use("/api/v1/tours", toursRouter);
app.use("/api/v1/users", userRouter);

// app.use();

app.all("/{*path}", (request, response, next) => {
  // response.status(404).json({
  //   status: "fail",
  //   message: ,
  // });

  next(new AppError(`Can't find ${request.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
