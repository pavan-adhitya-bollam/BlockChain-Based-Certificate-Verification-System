const Certificate = require("../models/Certificate");
const Student = require("../models/Student");
const AuditLog = require("../models/AuditLog");

const getStats = async (req, res, next) => {
  try {
    const isStudent = req.user.role === "student";
    let studentCertQuery = {};
    if (isStudent && req.user.studentRef) {
      studentCertQuery.student = req.user.studentRef._id || req.user.studentRef;
    }

    const totalIssued = await Certificate.countDocuments(
      isStudent ? studentCertQuery : {}
    );
    const totalRevoked = await Certificate.countDocuments(
      isStudent ? { ...studentCertQuery, issueStatus: "revoked" } : { issueStatus: "revoked" }
    );
    const totalActive = await Certificate.countDocuments(
      isStudent ? { ...studentCertQuery, issueStatus: "issued" } : { issueStatus: "issued" }
    );
    const totalStudents = await Student.countDocuments({ accountStatus: "active" });

    // Recent verifications in system
    const recentVerificationsCount = await AuditLog.countDocuments({
      action: { $in: ["CERTIFICATE_VERIFIED_VALID", "FILE_VERIFICATION_CHECK"] },
      timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    res.status(200).json({
      success: true,
      stats: {
        totalIssued,
        totalActive,
        totalRevoked,
        totalStudents: isStudent ? 1 : totalStudents,
        verifiedCount: recentVerificationsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getRecentActivity = async (req, res, next) => {
  try {
    const isStudent = req.user.role === "student";
    let query = {};
    if (isStudent && req.user.studentRef) {
      const student = await Student.findById(req.user.studentRef);
      if (student) {
        query.studentIdentifier = student.studentIdentifier;
      }
    }

    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      activity: logs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getRecentActivity,
};
