const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment of CertificateRegistry...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  const CertificateRegistry = await hre.ethers.getContractFactory("CertificateRegistry");
  const certificateRegistry = await CertificateRegistry.deploy();

  await certificateRegistry.waitForDeployment();
  const contractAddress = await certificateRegistry.getAddress();

  console.log("=================================================");
  console.log("CertificateRegistry deployed successfully!");
  console.log("Contract Address:", contractAddress);
  console.log("Institution Owner:", deployer.address);
  console.log("Network Chain ID:", (await hre.ethers.provider.getNetwork()).chainId.toString());
  console.log("=================================================");

  // Read ABI from Hardhat artifact
  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json"
  );
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const deploymentData = {
    address: contractAddress,
    institution: deployer.address,
    network: hre.network.name,
    chainId: Number((await hre.ethers.provider.getNetwork()).chainId),
    deployedAt: new Date().toISOString(),
    abi: artifact.abi,
  };

  // Save to blockchain folder
  const outputPath = path.join(__dirname, "../deployed-contract.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentData, null, 2));
  console.log("Saved deployment info to:", outputPath);

  // Also sync directly to server config if directory exists or when server is created
  const serverConfigDir = path.join(__dirname, "../../server/src/config");
  if (!fs.existsSync(serverConfigDir)) {
    fs.mkdirSync(serverConfigDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(serverConfigDir, "contractConfig.json"),
    JSON.stringify(deploymentData, null, 2)
  );
  console.log("Synced deployment info to server configuration.");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
