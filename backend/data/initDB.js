import dotenv from "dotenv";
import connectDB, { configureMongoDns } from "../configs/connectDB.js";
import fs from "fs";
import Tours from "../models/Tours.models.js";
import User from "../models/Users.models.js";
import Review from "../models/Reviews.models.js";

dotenv.config({ path: "../.env", override: true });
configureMongoDns();

const toursData = JSON.parse(fs.readFileSync("./tours.json", "utf-8"));
const usersData = JSON.parse(fs.readFileSync("./users.json", "utf-8"));
const reviewsData = JSON.parse(fs.readFileSync("./reviews.json", "utf-8"));

connectDB();

console.log(process.argv);

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
} else if (process.argv[2] === "--delete-import") {
  deleteData();
  importData();
  process.exit(1);
}

async function importData() {
  try {
    await Tours.create(toursData);
    await User.create(usersData, { validateBeforeSave: false });
    await Review.create(reviewsData);
    console.log("[SUCCESS] Data imported to DB.");
  } catch (error) {
    console.log(`[FAIL] ${error.message}`);
  }
  if (process.argv[2] === "--import") {
    process.exit(1);
  }
}

async function deleteData() {
  try {
    await Tours.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log("[SUCCESS] Data deleted from DB.");
  } catch (error) {
    console.log(`[FAIL] ${error.message}`);
  }
  if (process.argv[2] === "--delete") {
    process.exit(1);
  }
}
