import dns from "node:dns";
import express from "express";
import dotenv from "dotenv";
import toursRouter from "./routes/Tours.route.js";
import userRouter from "./routes/User.route.js";

const app = express();

app.use(express.json());
app.set("query parser", "extended");

app.use("/api/v1/tours", toursRouter);
app.use("/api/v1/users", userRouter);

export default app;
