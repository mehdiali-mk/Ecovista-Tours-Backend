import dns from "node:dns";
import dotenv from "dotenv";
import connectDB from "./configs/connectDB.js";
import app from "./app.js";

dotenv.config({ path: "./.env" });

if (process.env.NODE_ENV !== "production") {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
}

connectDB();

const runningPort = process.env.PORT || 8089;
app.listen(runningPort, () => {
  console.log(`[LISTENING] Server Listening to PORT: ${runningPort}.`);
});
