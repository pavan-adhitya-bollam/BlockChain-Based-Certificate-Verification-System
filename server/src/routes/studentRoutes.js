const express = require("express");
const {
  getStudents,
  createStudent,
  getStudentById,
  updateStudent,
  toggleStudentStatus,
} = require("../controllers/studentController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// All student management endpoints are restricted to Administrator
router.use(protect);
router.use(authorize("admin"));

router.get("/", getStudents);
router.post("/", createStudent);
router.get("/:id", getStudentById);
router.put("/:id", updateStudent);
router.patch("/:id/status", toggleStudentStatus);

module.exports = router;
