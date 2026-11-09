const AuditLog = require("../models/AuditLog");

/**
 * Records an audit trail entry
 */
const logAction = async ({
  actor = null,
  action,
  certificateId = null,
  studentIdentifier = null,
  transactionHash = null,
  details = {},
  req = null,
}) => {
  try {
    const ipAddress = req ? req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress : null;
    const userAgent = req ? req.headers["user-agent"] : null;

    const actorData = {
      userId: actor?._id || actor?.id || null,
      name: actor?.name || "Public / Anonymous",
      role: actor?.role || "public",
      email: actor?.email || null,
    };

    await AuditLog.create({
      actor: actorData,
      action,
      certificateId,
      studentIdentifier,
      transactionHash,
      details,
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("[AuditLog Error] Failed to write audit log:", err.message);
  }
};

module.exports = {
  logAction,
};
