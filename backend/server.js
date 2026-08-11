import dns from "node:dns";
import express from "express";
import dotenv from "dotenv";
import mongoose, { mongo } from "mongoose";
import connectDB from "./connectDB.js";
import Tours from "./models/Tours.models.js";

if (process.env.NODE_ENV !== "production") {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
}
dotenv.config({ path: "./.env" });

const app = express();
connectDB();

async function createTour() {
  try {
    const newTourDocument = await Tours.create({
      name: "Mahabaleshwar Economy",
      price: 987,
    });

    console.log(newTourDocument);
  } catch (error) {
    console.log(`[ERROR] error creating tour: ${error.message}.`);
  }
}

createTour();

const runningPort = process.env.PORT || 8089;
app.listen(runningPort, () => {
  console.log(`[LISTENING] Server Listening to PORT: ${runningPort}.`);
});
