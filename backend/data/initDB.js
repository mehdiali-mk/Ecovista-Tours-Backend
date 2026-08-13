import dns from "node:dns";
import dotenv from "dotenv";
import connectDB from "../configs/connectDB.js";
import fs from "fs";
import Tours from "../models/Tours.models.js";

dotenv.config({ path: "../.env" });

if (process.env.NODE_ENV !== "production") {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
}

const toursData = JSON.parse(fs.readFileSync("./tours-simple.json", "utf-8"));

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
    console.log("[SUCCESS] Data deleted from DB.");
  } catch (error) {
    console.log(`[FAIL] ${error.message}`);
  }
  if (process.argv[2] === "--delete") {
    process.exit(1);
  }
}
