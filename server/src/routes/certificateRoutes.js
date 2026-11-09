const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  issueCertificate,
  getCertificates,
  getCertificateById,
  revokeCertificate,
  verifyCertificate,
  verifyCertificateFile,
  downloadCertificate,
  getCertificateAudit,
} = require("../controllers/certificateController");
const { protect, authorize } = require("../middleware/auth");
const { uploadCertificate, uploadMemory } = require("../middleware/upload");

const router = express.Router();

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // 100 checks per 15 minutes
  message: { success: false, message: "Too many verification requests. Please try again later." },
});

// PUBLIC VERIFICATION ENDPOINTS (No authentication required, rate-limited)
router.get("/:certificateId/verify", verifyLimiter, verifyCertificate);
router.post(
  "/:certificateId/verify-file",
  verifyLimiter,
  uploadMemory.single("file"),
  verifyCertificateFile
);

// DOWNLOAD ENDPOINT (accessible by certificateId)
router.get("/:certificateId/download", downloadCertificate);

// PROTECTED ENDPOINTS
router.use(protect);

// Read certificate listings (admin gets all, student gets only owned)
router.get("/", getCertificates);
router.get("/:certificateId", getCertificateById);
router.get("/:certificateId/audit", getCertificateAudit);

// Restricted to Administrator
router.post("/issue", authorize("admin"), uploadCertificate.single("file"), issueCertificate);
router.post("/:certificateId/revoke", authorize("admin"), revokeCertificate);

module.exports = router;
