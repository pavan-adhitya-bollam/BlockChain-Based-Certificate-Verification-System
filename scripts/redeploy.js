const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("==================================================================");
console.log("Compiling and Deploying CertificateRegistry to Local Blockchain...");
console.log("==================================================================");

try {
  // 1. Run deployment script inside blockchain directory
  const deployOutput = execSync("npx hardhat run scripts/deploy.js --network localhost", {
    cwd: path.join(__dirname, "../blockchain"),
    encoding: "utf8",
  });
  console.log(deployOutput);

  // 2. Read deployed address
  const deployedConfig = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../blockchain/deployed-contract.json"), "utf8")
  );
  const contractAddress = deployedConfig.address;

  // 3. Update root .env
  const envPath = path.join(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");
    if (envContent.includes("CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(/CONTRACT_ADDRESS=.*(\r?\n|$)/, `CONTRACT_ADDRESS=${contractAddress}\n`);
    } else {
      envContent += `\nCONTRACT_ADDRESS=${contractAddress}\n`;
    }
    fs.writeFileSync(envPath, envContent);
    console.log(`Updated root .env with CONTRACT_ADDRESS=${contractAddress}`);
  }

  console.log("Deployment and synchronization complete!");
} catch (err) {
  console.error("Deployment failed:", err.message);
  process.exit(1);
}
