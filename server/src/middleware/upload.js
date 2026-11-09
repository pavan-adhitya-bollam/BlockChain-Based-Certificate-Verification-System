const multer = require("multer");
const path = require("path");
const fs = require("fs");

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_BYTES || "10485760", 10); // 10MB default

// Storage for uploaded certificates outside public static folder
const storageDir = path.join(__dirname, "../../uploads/certificates");
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storageDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `orig-${uniqueSuffix}-${sanitizedName}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (file.mimetype !== "application/pdf" && ext !== ".pdf") {
    return cb(new Error("Only genuine PDF documents (.pdf) are permitted"), false);
  }
  cb(null, true);
};

const uploadCertificate = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

// Memory storage for public verification file checks (so we hash in memory and never keep unnecessary files)
const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

module.exports = {
  uploadCertificate,
  uploadMemory,
  storageDir,
};
