const Student = require("../models/Student");
const User = require("../models/User");
const { logAction } = require("../services/auditService");
const { z } = require("zod");

const studentSchema = z.object({
  studentIdentifier: z.string().min(2, "Student ID must be at least 2 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email required"),
  course: z.string().min(2, "Course is required"),
  department: z.string().min(2, "Department is required"),
  graduationYear: z.coerce.number().min(2000).max(2050),
  password: z.string().min(6).optional(),
});

const getStudents = async (req, res, next) => {
  try {
    const { search, department, status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { studentIdentifier: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { course: { $regex: search, $options: "i" } },
      ];
    }

    if (department) {
      query.department = department;
    }

    if (status) {
      query.accountStatus = status;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .populate("userRef", "accountStatus");

    res.status(200).json({
      success: true,
      students,
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

const createStudent = async (req, res, next) => {
  try {
    const parseResult = studentSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: parseResult.error.errors[0].message,
      });
    }

    const data = parseResult.data;

    // Check existing
    const existing = await Student.findOne({
      $or: [{ email: data.email.toLowerCase() }, { studentIdentifier: data.studentIdentifier.toUpperCase() }],
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A student with this Email or Student Identifier already exists.",
      });
    }

    const student = await Student.create({
      studentIdentifier: data.studentIdentifier.toUpperCase(),
      name: data.name,
      email: data.email.toLowerCase(),
      course: data.course,
      department: data.department,
      graduationYear: data.graduationYear,
      accountStatus: "active",
    });

    // Create user login account for student
    const studentPassword = data.password || "Student@123";
    const user = await User.create({
      name: student.name,
      email: student.email,
      password: studentPassword,
      role: "student",
      accountStatus: "active",
      studentRef: student._id,
    });

    student.userRef = user._id;
    await student.save();

    await logAction({
      actor: req.user,
      action: "STUDENT_CREATED",
      studentIdentifier: student.studentIdentifier,
      details: { studentId: student._id, name: student.name, email: student.email },
      req,
    });

    res.status(201).json({
      success: true,
      message: "Student created successfully.",
      student,
    });
  } catch (error) {
    next(error);
  }
};

const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate("userRef", "accountStatus");
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }
    res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    next(error);
  }
};

const updateStudent = async (req, res, next) => {
  try {
    const { name, course, department, graduationYear } = req.body;
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (name) student.name = name;
    if (course) student.course = course;
    if (department) student.department = department;
    if (graduationYear) student.graduationYear = graduationYear;

    await student.save();

    if (student.userRef && name) {
      await User.findByIdAndUpdate(student.userRef, { name });
    }

    await logAction({
      actor: req.user,
      action: "STUDENT_UPDATED",
      studentIdentifier: student.studentIdentifier,
      details: { studentId: student._id },
      req,
    });

    res.status(200).json({
      success: true,
      message: "Student details updated successfully",
      student,
    });
  } catch (error) {
    next(error);
  }
};

const toggleStudentStatus = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const newStatus = student.accountStatus === "active" ? "inactive" : "active";
    student.accountStatus = newStatus;
    await student.save();

    if (student.userRef) {
      await User.findByIdAndUpdate(student.userRef, { accountStatus: newStatus });
    }

    await logAction({
      actor: req.user,
      action: "STUDENT_STATUS_TOGGLED",
      studentIdentifier: student.studentIdentifier,
      details: { newStatus },
      req,
    });

    res.status(200).json({
      success: true,
      message: `Student account marked as ${newStatus}`,
      student,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  createStudent,
  getStudentById,
  updateStudent,
  toggleStudentStatus,
};
