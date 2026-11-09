const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: [true, "Certificate ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student reference is required"],
    },
    studentIdentifier: {
      type: String,
      required: true,
      trim: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    course: {
      type: String,
      required: [true, "Course is required"],
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    institution: {
      type: String,
      required: [true, "Institution is required"],
      trim: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    fileHash: {
      type: String,
      required: [true, "Cryptographic file hash is required"],
      trim: true,
      lowercase: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    generatedPdfPath: {
      type: String,
    },
    blockchainTxHash: {
      type: String,
      required: [true, "Blockchain transaction hash is required"],
    },
    contractAddress: {
      type: String,
      required: [true, "Contract address is required"],
    },
    blockNumber: {
      type: Number,
    },
    issuingWallet: {
      type: String,
      required: [true, "Issuing wallet is required"],
    },
    issueStatus: {
      type: String,
      enum: ["issued", "revoked"],
      default: "issued",
    },
    revocationDetails: {
      isRevoked: {
        type: Boolean,
        default: false,
      },
      reason: {
        type: String,
        default: "",
      },
      revokedAt: {
        type: Date,
        default: null,
      },
      txHash: {
        type: String,
        default: null,
      },
    },
    publicVerificationUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

certificateSchema.index({ studentIdentifier: 1 });
certificateSchema.index({ fileHash: 1 });
certificateSchema.index({ issueStatus: 1 });

module.exports = mongoose.models.Certificate || mongoose.model("Certificate", certificateSchema);
