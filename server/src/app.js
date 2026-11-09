const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const errorHandler = require("./middleware/errorHandler");
const blockchainService = require("./services/blockchainService");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// System Health and Blockchain Connectivity Endpoint
app.get("/api/health", async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  const bcAvailable = await blockchainService.isBlockchainAvailable();
  const network = await blockchainService.getNetworkDetails();

  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      database: {
        status: dbStatus,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
      },
      blockchain: {
        status: bcAvailable ? "connected" : "unavailable",
        network,
      },
    },
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Fallback for unmatched API routes
app.all("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;
