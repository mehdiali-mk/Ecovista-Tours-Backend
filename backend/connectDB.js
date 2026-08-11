import mongoose from "mongoose";

export default async function connectDB() {
  try {
    const connectionString = process.env.DATABASE_CONNECTION_STRING.replace(
      "<db_password>",
      process.env.DATABASE_PASSWORD,
    );

    const connection = await mongoose.connect(connectionString);

    console.log(
      `[SUCCESS] DB connected successfully: ${connection.connection.host}`,
    );
  } catch (error) {
    console.error("[FAILED] DB connection failed: " + error.message);
  }
}
