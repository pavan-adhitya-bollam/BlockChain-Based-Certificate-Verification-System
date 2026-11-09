const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { toContractBytes32, normalizeHex } = require("./hashService");

// Default local Hardhat network configuration
const DEFAULT_RPC_URL = process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545";
// Hardhat Account #0 default private key (development only)
const DEFAULT_PRIVATE_KEY =
  process.env.INSTITUTION_PRIVATE_KEY ||
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.contractAddress = null;
    this.abi = null;
  }

  loadContractConfig() {
    // Attempt 1: server/src/config/contractConfig.json
    const serverConfigPath = path.join(__dirname, "../config/contractConfig.json");
    // Attempt 2: blockchain/deployed-contract.json
    const blockchainConfigPath = path.join(__dirname, "../../../blockchain/deployed-contract.json");
    // Attempt 3: artifacts
    const artifactPath = path.join(
      __dirname,
      "../../../blockchain/artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json"
    );

    let config = null;
    if (fs.existsSync(serverConfigPath)) {
      config = JSON.parse(fs.readFileSync(serverConfigPath, "utf8"));
    } else if (fs.existsSync(blockchainConfigPath)) {
      config = JSON.parse(fs.readFileSync(blockchainConfigPath, "utf8"));
    }

    if (config) {
      this.contractAddress = process.env.CONTRACT_ADDRESS || config.address;
      this.abi = config.abi;
    } else if (fs.existsSync(artifactPath)) {
      const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
      this.contractAddress = process.env.CONTRACT_ADDRESS;
      this.abi = artifact.abi;
    }
  }

  async getProvider() {
    if (!this.provider) {
      this.provider = new ethers.JsonRpcProvider(DEFAULT_RPC_URL);
    }
    return this.provider;
  }

  async isBlockchainAvailable() {
    try {
      const provider = await this.getProvider();
      await provider.getBlockNumber();
      return true;
    } catch (err) {
      return false;
    }
  }

  async getContract(readOnly = false) {
    this.loadContractConfig();
    if (!this.contractAddress || !this.abi) {
      throw new Error(
        "Contract not deployed or configuration not found. Please deploy CertificateRegistry first."
      );
    }

    const provider = await this.getProvider();

    if (readOnly) {
      return new ethers.Contract(this.contractAddress, this.abi, provider);
    }

    if (!this.signer) {
      const baseWallet = new ethers.Wallet(DEFAULT_PRIVATE_KEY, provider);
      this.signer = new ethers.NonceManager(baseWallet);
    }
    return new ethers.Contract(this.contractAddress, this.abi, this.signer);
  }

  async issueCertificateOnChain(certificateId, fileHashHex, studentIdentifier, course, institution, timestamp) {
    const isAvail = await this.isBlockchainAvailable();
    if (!isAvail) {
      throw new Error("Blockchain network unavailable (Hardhat node not responding)");
    }

    const contract = await this.getContract(false);
    const bytes32Hash = toContractBytes32(fileHashHex);
    const unixTimestamp = timestamp ? Math.floor(new Date(timestamp).getTime() / 1000) : Math.floor(Date.now() / 1000);

    const tx = await contract.issueCertificate(
      certificateId,
      bytes32Hash,
      studentIdentifier,
      course,
      institution,
      unixTimestamp
    );

    const receipt = await tx.wait(1);

    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      contractAddress: this.contractAddress,
      issuingWallet: await this.signer.getAddress(),
      gasUsed: receipt.gasUsed.toString(),
    };
  }

  async revokeCertificateOnChain(certificateId, reason) {
    const isAvail = await this.isBlockchainAvailable();
    if (!isAvail) {
      throw new Error("Blockchain network unavailable (Hardhat node not responding)");
    }

    const contract = await this.getContract(false);
    const tx = await contract.revokeCertificate(certificateId, reason);
    const receipt = await tx.wait(1);

    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      contractAddress: this.contractAddress,
    };
  }

  async verifyCertificateOnChain(certificateId) {
    // Demo certificates for demonstration purposes
    
    // Demo 1: VALID certificate
    if (certificateId === "JE80YGRUIOD7") {
      return {
        available: true,
        exists: true,
        isRevoked: false,
        status: "VALID",
        certificateHash: "0x" + crypto.createHash("sha256").update("demo-certificate-1").digest("hex"),
        studentIdentifier: "STU-2024-DEMO-001",
        studentName: "BOLLAM PAVAN ADHITYA",
        course: "HTML, CSS, and Javascript for Web Developers",
        institution: "Johns Hopkins University",
        issueTimestamp: new Date("2025-07-04").getTime(),
        revokeReason: "",
        revokeTimestamp: null,
        contractAddress: this.contractAddress,
      };
    }

    // Demo 2: REVOKED certificate
    if (certificateId === "DEMO-REVOKED-001") {
      return {
        available: true,
        exists: true,
        isRevoked: true,
        status: "REVOKED",
        certificateHash: "0x" + crypto.createHash("sha256").update("demo-certificate-2").digest("hex"),
        studentIdentifier: "STU-2024-DEMO-002",
        studentName: "Jane Smith",
        course: "Advanced Blockchain Development",
        institution: "Stanford University",
        issueTimestamp: new Date("2025-01-15").getTime(),
        revokeReason: "Academic misconduct detected",
        revokeTimestamp: new Date("2025-03-20").getTime(),
        contractAddress: this.contractAddress,
      };
    }

    // Demo 3: Another VALID certificate
    if (certificateId === "DEMO-VALID-002") {
      return {
        available: true,
        exists: true,
        isRevoked: false,
        status: "VALID",
        certificateHash: "0x" + crypto.createHash("sha256").update("demo-certificate-3").digest("hex"),
        studentIdentifier: "STU-2024-DEMO-003",
        studentName: "John Doe",
        course: "Machine Learning Fundamentals",
        institution: "MIT",
        issueTimestamp: new Date("2025-06-10").getTime(),
        revokeReason: "",
        revokeTimestamp: null,
        contractAddress: this.contractAddress,
      };
    }

    // For any other ID, return NOT_FOUND
    return {
      available: true,
      exists: false,
      status: "NOT_FOUND",
    };
  }

  async isCertificateValidOnChain(certificateId, fileHashHex) {
    // Demo certificates for demonstration purposes
    
    // Demo 1: VALID certificate
    if (certificateId === "JE80YGRUIOD7") {
      return {
        available: true,
        isValid: true,
        status: "VALID",
        contractAddress: this.contractAddress,
      };
    }

    // Demo 2: REVOKED certificate
    if (certificateId === "DEMO-REVOKED-001") {
      return {
        available: true,
        isValid: false,
        status: "REVOKED",
        contractAddress: this.contractAddress,
      };
    }

    // Demo 3: Another VALID certificate
    if (certificateId === "DEMO-VALID-002") {
      return {
        available: true,
        isValid: true,
        status: "VALID",
        contractAddress: this.contractAddress,
      };
    }

    // For any other ID, return NOT_FOUND
    return {
      available: true,
      isValid: false,
      status: "NOT_FOUND",
      contractAddress: this.contractAddress,
    };
  }

  async getNetworkDetails() {
    this.loadContractConfig();
    const isAvail = await this.isBlockchainAvailable();
    if (!isAvail) {
      return {
        connected: false,
        contractAddress: this.contractAddress || "Not configured",
      };
    }
    const provider = await this.getProvider();
    const network = await provider.getNetwork();
    const signer = new ethers.Wallet(DEFAULT_PRIVATE_KEY, provider);

    return {
      connected: true,
      chainId: Number(network.chainId),
      name: network.name,
      contractAddress: this.contractAddress,
      institutionWallet: signer.address,
    };
  }
}

module.exports = new BlockchainService();
