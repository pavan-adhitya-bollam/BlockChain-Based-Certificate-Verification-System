require("dotenv").config({ path: "../.env" });
const app = require("./app");
const connectDB = require("./config/db");
const blockchainService = require("./services/blockchainService");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log("------------------------------------------------------------------");
    console.log("Initializing Student Certificate Validation Backend Server...");
    console.log("------------------------------------------------------------------");

    // Connect to MongoDB
    await connectDB();

    // Check Hardhat blockchain node connection
    const bcAvailable = await blockchainService.isBlockchainAvailable();
    if (bcAvailable) {
      const net = await blockchainService.getNetworkDetails();
      console.log(`[Blockchain] Connected to Hardhat Network (ChainID: ${net.chainId})`);
      console.log(`[Blockchain] Registry Contract: ${net.contractAddress || "Not deployed yet"}`);
      console.log(`[Blockchain] Institution Wallet: ${net.institutionWallet}`);
    } else {
      console.warn("==================================================================");
      console.warn("[Blockchain Warning] Hardhat node is not responding at 127.0.0.1:8545");
      console.warn("Please run 'npm run chain' in another terminal to start Hardhat node.");
      console.warn("==================================================================");
    }

    const server = app.listen(PORT, () => {
      console.log(`[Server] API running on http://localhost:${PORT}`);
      console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
      console.log("------------------------------------------------------------------");
    });

    return server;
  } catch (err) {
    console.error("Fatal startup error:", err.message);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== "test") {
  startServer();
}

module.exports = startServer;
