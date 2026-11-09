const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/certificate_verification_db";

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error("==================================================================");
    console.error("[Database Error] Failed to connect to MongoDB at:", mongoURI);
    console.error("Reason:", error.message);
    console.error("------------------------------------------------------------------");
    console.error("Troubleshooting steps:");
    console.error("1. Ensure local MongoDB service is running: Start-Service MongoDB (Windows)");
    console.error("2. Or verify MONGODB_URI in .env matches your local or remote cluster");
    console.error("==================================================================");
    throw error;
  }
};

module.exports = connectDB;
