const crypto = require("crypto");
const fs = require("fs");

/**
 * Computes SHA-256 hash of a Buffer
 * @param {Buffer} buffer
 * @returns {string} 64-character lowercase hex string
 */
const calculateBufferHash = (buffer) => {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error("Invalid buffer provided for hashing");
  }
  return crypto.createHash("sha256").update(buffer).digest("hex").toLowerCase();
};

/**
 * Computes SHA-256 hash of a file on disk
 * @param {string} filePath
 * @returns {Promise<string>} 64-character lowercase hex string
 */
const calculateFileHash = async (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);

    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex").toLowerCase()));
    stream.on("error", (err) => reject(err));
  });
};

/**
 * Converts a 64-char hex SHA-256 hash to a 32-byte 0x-prefixed hex string for Solidity bytes32
 * @param {string} hexHash
 * @returns {string} 0x... (66 characters)
 */
const toContractBytes32 = (hexHash) => {
  const clean = hexHash.startsWith("0x") ? hexHash.slice(2) : hexHash;
  if (clean.length !== 64) {
    throw new Error(`Invalid SHA-256 hex length: ${clean.length}. Expected 64 characters.`);
  }
  return `0x${clean.toLowerCase()}`;
};

/**
 * Normalizes a bytes32 or hex string to a clean 64-character lowercase hex string
 * @param {string} bytes32
 * @returns {string}
 */
const normalizeHex = (bytes32) => {
  if (!bytes32) return "";
  const clean = bytes32.startsWith("0x") ? bytes32.slice(2) : bytes32;
  return clean.toLowerCase();
};

module.exports = {
  calculateBufferHash,
  calculateFileHash,
  toContractBytes32,
  normalizeHex,
};
