const Certificate = require("../models/Certificate");
const Student = require("../models/Student");
const AuditLog = require("../models/AuditLog");
const blockchainService = require("../services/blockchainService");
const hashService = require("../services/hashService");
const pdfService = require("../services/pdfService");
const { logAction } = require("../services/auditService");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const CLIENT_BASE_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Generate clean unique Certificate ID: CERT-YYYY-XXXXXX
const generateUniqueCertificateId = () => {
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `CERT-${year}-${random}`;
};

/**
 * Issue a new certificate
 */
const issueCertificate = async (req, res, next) => {
  let tempFilePath = null;
  try {
    const { studentId, course, institution } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, message: "Student selection is required" });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Selected student record not found" });
    }

    if (student.accountStatus !== "active") {
      return res.status(400).json({
        success: false,
        message: "Cannot issue certificate to an inactive student account",
      });
    }

    const selectedCourse = course || student.course;
    const selectedInstitution = institution || "National Institute of Engineering & Technology";
    const certificateId = generateUniqueCertificateId();
    const verificationUrl = `${CLIENT_BASE_URL}/verify/${certificateId}`;

    let originalBuffer;
    let originalFileName;
    let originalFilePath;

    const certDir = path.join(__dirname, "../../uploads/certificates");
    if (!fs.existsSync(certDir)) {
      fs.mkdirSync(certDir, { recursive: true });
    }

    // Check if admin uploaded an existing custom PDF file
    if (req.file) {
      originalFileName = req.file.originalname;
      originalFilePath = req.file.path;
      originalBuffer = fs.readFileSync(originalFilePath);
    } else {
      // Auto-generate official initial certificate document
      originalFileName = `${certificateId}-original.pdf`;
      originalFilePath = path.join(certDir, originalFileName);
      originalBuffer = await pdfService.generateCertificatePDF(
        {
          certificateId,
          studentName: student.name,
          studentIdentifier: student.studentIdentifier,
          course: selectedCourse,
          department: student.department,
          institution: selectedInstitution,
          graduationYear: student.graduationYear,
          issueDate: new Date(),
          verificationUrl,
        },
        originalFilePath
      );
    }

    // Step 1: Compute SHA-256 hash of original PDF bytes
    const fileHash = hashService.calculateBufferHash(originalBuffer);

    // Step 2: Register on Blockchain via Hardhat smart contract
    let onChainReceipt;
    try {
      onChainReceipt = await blockchainService.issueCertificateOnChain(
        certificateId,
        fileHash,
        student.studentIdentifier,
        selectedCourse,
        selectedInstitution,
        Date.now()
      );
    } catch (bcError) {
      console.error("[Blockchain Error] Issuance failed:", bcError);
      return res.status(503).json({
        success: false,
        message: `Blockchain transaction failed: ${bcError.message}. Ensure Hardhat local node is running.`,
      });
    }

    // Step 3: Generate the official downloadable PDF
    const finalPdfName = `${certificateId}.pdf`;
    const finalPdfPath = path.join(certDir, finalPdfName);
    await pdfService.generateCertificatePDF(
      {
        certificateId,
        studentName: student.name,
        studentIdentifier: student.studentIdentifier,
        course: selectedCourse,
        department: student.department,
        institution: selectedInstitution,
        graduationYear: student.graduationYear,
        issueDate: new Date(),
        verificationUrl,
      },
      finalPdfPath
    );

    // Step 4: Persist in MongoDB
    let certificateRecord;
    try {
      certificateRecord = await Certificate.create({
        certificateId,
        student: student._id,
        studentIdentifier: student.studentIdentifier,
        studentName: student.name,
        course: selectedCourse,
        department: student.department,
        institution: selectedInstitution,
        issueDate: new Date(),
        fileHash,
        originalFileName,
        filePath: originalFilePath,
        generatedPdfPath: finalPdfPath,
        blockchainTxHash: onChainReceipt.txHash,
        contractAddress: onChainReceipt.contractAddress,
        blockNumber: onChainReceipt.blockNumber,
        issuingWallet: onChainReceipt.issuingWallet,
        issueStatus: "issued",
        publicVerificationUrl: verificationUrl,
      });
    } catch (dbError) {
      console.error("[Database Error] Failed to persist certificate after blockchain tx:", dbError);
      // Recovery log so on-chain record is not lost
      await logAction({
        actor: req.user,
        action: "RECONCILIATION_REQUIRED",
        certificateId,
        studentIdentifier: student.studentIdentifier,
        transactionHash: onChainReceipt.txHash,
        details: {
          error: dbError.message,
          fileHash,
          contractAddress: onChainReceipt.contractAddress,
        },
        req,
      });

      return res.status(500).json({
        success: false,
        message:
          "Blockchain transaction succeeded, but database write encountered an error. A reconciliation record has been created.",
        txHash: onChainReceipt.txHash,
        certificateId,
      });
    }

    // Step 5: Audit Log
    await logAction({
      actor: req.user,
      action: "CERTIFICATE_ISSUED",
      certificateId,
      studentIdentifier: student.studentIdentifier,
      transactionHash: onChainReceipt.txHash,
      details: {
        fileHash,
        blockNumber: onChainReceipt.blockNumber,
        studentName: student.name,
        course: selectedCourse,
      },
      req,
    });

    res.status(201).json({
      success: true,
      message: "Certificate successfully issued and anchored on blockchain.",
      certificate: certificateRecord,
      blockchain: onChainReceipt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all certificates with role-based filtering
 */
const getCertificates = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const query = {};

    // Role-based scope: Student can ONLY view their own certificates
    if (req.user.role === "student") {
      if (!req.user.studentRef) {
        return res.status(200).json({
          success: true,
          certificates: [],
          pagination: { total: 0, page: 1, pages: 0, limit: 10 },
        });
      }
      query.student = req.user.studentRef._id || req.user.studentRef;
    }

    if (search) {
      query.$or = [
        { certificateId: { $regex: search, $options: "i" } },
        { studentName: { $regex: search, $options: "i" } },
        { studentIdentifier: { $regex: search, $options: "i" } },
        { course: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.issueStatus = status;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Certificate.countDocuments(query);
    const certificates = await Certificate.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .populate("student", "name email department graduationYear");

    res.status(200).json({
      success: true,
      certificates,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10)),
        limit: parseInt(limit, 10),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single certificate by ID
 */
const getCertificateById = async (req, res, next) => {
  try {
    const cert = await Certificate.findOne({ certificateId: req.params.certificateId.toUpperCase() })
      .populate("student", "name email department graduationYear");

    if (!cert) {
      return res.status(404).json({ success: false, message: "Certificate not found" });
    }

    // Student privacy check
    if (req.user.role === "student") {
      const studentId = req.user.studentRef?._id || req.user.studentRef;
      if (!studentId || cert.student._id.toString() !== studentId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You do not have permission to view this certificate.",
        });
      }
    }

    // Query on-chain status
    const onChainData = await blockchainService.verifyCertificateOnChain(cert.certificateId);

    res.status(200).json({
      success: true,
      certificate: cert,
      onChainData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Revoke certificate on blockchain
 */
const revokeCertificate = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "A mandatory revocation reason is required",
      });
    }

    const cert = await Certificate.findOne({ certificateId: req.params.certificateId.toUpperCase() });
    if (!cert) {
      return res.status(404).json({ success: false, message: "Certificate not found" });
    }

    if (cert.issueStatus === "revoked" || cert.revocationDetails?.isRevoked) {
      return res.status(400).json({
        success: false,
        message: "Certificate is already revoked and cannot be revoked again",
      });
    }

    // Revoke on blockchain first (authoritative!)
    let onChainReceipt;
    try {
      onChainReceipt = await blockchainService.revokeCertificateOnChain(cert.certificateId, reason.trim());
    } catch (bcError) {
      console.error("[Blockchain Error] Revocation failed:", bcError);
      return res.status(503).json({
        success: false,
        message: `Blockchain revocation failed: ${bcError.message}. Ensure Hardhat node is running.`,
      });
    }

    // Update MongoDB
    cert.issueStatus = "revoked";
    cert.revocationDetails = {
      isRevoked: true,
      reason: reason.trim(),
      revokedAt: new Date(),
      txHash: onChainReceipt.txHash,
    };
    await cert.save();

    await logAction({
      actor: req.user,
      action: "CERTIFICATE_REVOKED",
      certificateId: cert.certificateId,
      studentIdentifier: cert.studentIdentifier,
      transactionHash: onChainReceipt.txHash,
      details: { reason: reason.trim() },
      req,
    });

    res.status(200).json({
      success: true,
      message: "Certificate successfully revoked on the blockchain.",
      certificate: cert,
      blockchain: onChainReceipt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Public Verification endpoint (by Certificate ID)
 */
const verifyCertificate = async (req, res, next) => {
  try {
    const certificateId = req.params.certificateId.trim().toUpperCase();

    // Query authoritative blockchain state
    const onChainResult = await blockchainService.verifyCertificateOnChain(certificateId);

    if (!onChainResult.available) {
      return res.status(503).json({
        success: false,
        status: "VERIFICATION_UNAVAILABLE",
        message: "Blockchain node is currently unreachable. Verification cannot proceed.",
      });
    }

    if (!onChainResult.exists) {
      await logAction({
        action: "CERTIFICATE_VERIFY_NOT_FOUND",
        certificateId,
        details: { result: "NOT_FOUND" },
        req,
      });
      return res.status(404).json({
        success: false,
        status: "NOT_FOUND",
        message: "Certificate ID does not exist on the blockchain registry.",
        certificateId,
      });
    }

    // Query non-sensitive metadata from database if available
    const dbRecord = await Certificate.findOne({ certificateId }).select(
      "studentName course department institution issueDate blockchainTxHash contractAddress blockNumber issueStatus revocationDetails"
    );

    const isRevoked = onChainResult.isRevoked;

    await logAction({
      action: isRevoked ? "CERTIFICATE_VERIFY_REVOKED" : "CERTIFICATE_VERIFIED_VALID",
      certificateId,
      studentIdentifier: onChainResult.studentIdentifier,
      transactionHash: dbRecord?.blockchainTxHash,
      details: { status: isRevoked ? "REVOKED" : "VALID" },
      req,
    });

    res.status(200).json({
      success: true,
      status: isRevoked ? "REVOKED" : "VALID",
      certificateId,
      isValid: !isRevoked,
      isRevoked,
      onChain: {
        certificateHash: onChainResult.certificateHash,
        studentIdentifier: onChainResult.studentIdentifier,
        course: onChainResult.course,
        institution: onChainResult.institution,
        issueTimestamp: onChainResult.issueTimestamp,
        revokeReason: onChainResult.revokeReason,
        revokeTimestamp: onChainResult.revokeTimestamp,
        contractAddress: onChainResult.contractAddress,
      },
      metadata: {
        studentName: onChainResult.studentName || dbRecord?.studentName || "Registered Student",
        course: onChainResult.course,
        department: dbRecord?.department || "",
        institution: onChainResult.institution,
        issueDate: onChainResult.issueTimestamp,
        blockchainTxHash: dbRecord?.blockchainTxHash || null,
        contractAddress: onChainResult.contractAddress,
        blockNumber: dbRecord?.blockNumber || null,
      },
      revocationDetails: isRevoked
        ? {
            reason: onChainResult.revokeReason,
            revokedAt: onChainResult.revokeTimestamp,
          }
        : null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Public File Verification endpoint (by uploading original PDF)
 */
const verifyCertificateFile = async (req, res, next) => {
  try {
    const certificateId = req.params.certificateId.trim().toUpperCase();

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "Please upload a valid PDF document to verify.",
      });
    }

    // 1. Calculate SHA-256 hash of the exact uploaded PDF bytes
    const uploadedFileHash = hashService.calculateBufferHash(req.file.buffer);

    // 2. Query blockchain
    const validityResult = await blockchainService.isCertificateValidOnChain(certificateId, uploadedFileHash);

    if (!validityResult.available) {
      return res.status(503).json({
        success: false,
        status: "VERIFICATION_UNAVAILABLE",
        message: "Blockchain node is currently unreachable. Verification cannot proceed.",
      });
    }

    // 3. Get on-chain record for detailed comparison
    const onChainRecord = await blockchainService.verifyCertificateOnChain(certificateId);

    const dbRecord = await Certificate.findOne({ certificateId }).select(
      "studentName course department institution issueDate blockchainTxHash contractAddress blockNumber"
    );

    const isMatch = onChainRecord.exists && onChainRecord.certificateHash === uploadedFileHash;

    let responseStatus = validityResult.status;
    let message = "";

    if (responseStatus === "VALID") {
      message = "Cryptographic integrity confirmed: File hash matches on-chain fingerprint and certificate is valid.";
    } else if (responseStatus === "HASH_MISMATCH") {
      message = "Integrity violation: Uploaded PDF file has been altered or tampered with. File hash does not match blockchain record.";
    } else if (responseStatus === "REVOKED") {
      message = "Certificate has been formally revoked by the issuing institution.";
    } else if (responseStatus === "NOT_FOUND") {
      message = "Certificate ID was not found on the blockchain registry.";
    }

    await logAction({
      action: "FILE_VERIFICATION_CHECK",
      certificateId,
      details: {
        status: responseStatus,
        hashMatch: isMatch,
        uploadedHash: uploadedFileHash,
        onChainHash: onChainRecord?.certificateHash,
      },
      req,
    });

    res.status(200).json({
      success: true,
      status: responseStatus,
      isValid: responseStatus === "VALID",
      hashMatch: isMatch,
      message,
      uploadedFileHash,
      onChainHash: onChainRecord?.certificateHash || null,
      metadata: onChainRecord.exists
        ? {
            studentName: dbRecord?.studentName || "Registered Student",
            studentIdentifier: onChainRecord.studentIdentifier,
            course: onChainRecord.course,
            department: dbRecord?.department || "",
            institution: onChainRecord.institution,
            issueDate: onChainRecord.issueTimestamp,
            blockchainTxHash: dbRecord?.blockchainTxHash || null,
            contractAddress: validityResult.contractAddress,
          }
        : null,
      revocationDetails: onChainRecord.isRevoked
        ? {
            reason: onChainRecord.revokeReason,
            revokedAt: onChainRecord.revokeTimestamp,
          }
        : null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Download certificate PDF
 */
const downloadCertificate = async (req, res, next) => {
  try {
    const certificateId = req.params.certificateId.toUpperCase();

    // Special case for demo certificates
    if (certificateId === "JE80YGRUIOD7") {
      const verificationUrl = `${CLIENT_BASE_URL}/verify/${certificateId}`;
      const pdfBuffer = await pdfService.generateCertificatePDF(
        {
          certificateId,
          studentName: "BOLLAM PAVAN ADHITYA",
          studentIdentifier: "STU-2024-DEMO-001",
          course: "HTML, CSS, and Javascript for Web Developers",
          department: "Computer Science",
          institution: "Johns Hopkins University",
          graduationYear: "2025",
          issueDate: new Date("2025-07-04"),
          verificationUrl,
        },
        null
      );

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${certificateId}.pdf"`);
      return res.send(pdfBuffer);
    }

    // Demo 2: REVOKED certificate
    if (certificateId === "DEMO-REVOKED-001") {
      const verificationUrl = `${CLIENT_BASE_URL}/verify/${certificateId}`;
      const pdfBuffer = await pdfService.generateCertificatePDF(
        {
          certificateId,
          studentName: "Jane Smith",
          studentIdentifier: "STU-2024-DEMO-002",
          course: "Advanced Blockchain Development",
          department: "Computer Science",
          institution: "Stanford University",
          graduationYear: "2025",
          issueDate: new Date("2025-01-15"),
          verificationUrl,
        },
        null
      );

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${certificateId}.pdf"`);
      return res.send(pdfBuffer);
    }

    // Demo 3: Another VALID certificate
    if (certificateId === "DEMO-VALID-002") {
      const verificationUrl = `${CLIENT_BASE_URL}/verify/${certificateId}`;
      const pdfBuffer = await pdfService.generateCertificatePDF(
        {
          certificateId,
          studentName: "John Doe",
          studentIdentifier: "STU-2024-DEMO-003",
          course: "Machine Learning Fundamentals",
          department: "Artificial Intelligence",
          institution: "MIT",
          graduationYear: "2025",
          issueDate: new Date("2025-06-10"),
          verificationUrl,
        },
        null
      );

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${certificateId}.pdf"`);
      return res.send(pdfBuffer);
    }

    const cert = await Certificate.findOne({ certificateId });
    if (!cert) {
      return res.status(404).json({ success: false, message: "Certificate not found" });
    }

    // Role check if authenticated
    if (req.user && req.user.role === "student") {
      const studentId = req.user.studentRef?._id || req.user.studentRef;
      if (!studentId || cert.student.toString() !== studentId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You do not own this certificate.",
        });
      }
    }

    const downloadPath = cert.generatedPdfPath || cert.filePath;
    if (!fs.existsSync(downloadPath)) {
      return res.status(404).json({
        success: false,
        message: "Certificate file is not available on disk.",
      });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${cert.certificateId}.pdf"`);
    const stream = fs.createReadStream(downloadPath);
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
};

/**
 * Get audit trail for a certificate
 */
const getCertificateAudit = async (req, res, next) => {
  try {
    const certificateId = req.params.certificateId.toUpperCase();
    const logs = await AuditLog.find({ certificateId }).sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  issueCertificate,
  getCertificates,
  getCertificateById,
  revokeCertificate,
  verifyCertificate,
  verifyCertificateFile,
  downloadCertificate,
  getCertificateAudit,
};
