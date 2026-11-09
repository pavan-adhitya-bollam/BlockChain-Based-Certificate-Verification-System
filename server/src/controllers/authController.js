const User = require("../models/User");
const { signToken } = require("../middleware/auth");
const { logAction } = require("../services/auditService");
const { z } = require("zod");

const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password is required"),
});

const login = async (req, res, next) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: parseResult.error.errors[0].message,
      });
    }

    const { email, password } = parseResult.data;
    const user = await User.findOne({ email: email.toLowerCase() }).populate("studentRef");

    if (!user) {
      await logAction({
        action: "LOGIN_FAILED",
        details: { reason: "User not found", email },
        req,
      });
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await logAction({
        actor: user,
        action: "LOGIN_FAILED",
        details: { reason: "Password mismatch", email },
        req,
      });
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.accountStatus !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact administrator.",
      });
    }

    const token = signToken(user);

    await logAction({
      actor: user,
      action: "LOGIN_SUCCESS",
      details: { role: user.role, email: user.email },
      req,
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
        student: user.studentRef,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await logAction({
        actor: req.user,
        action: "LOGOUT",
        req,
      });
    }
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("studentRef");
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
        student: user.studentRef,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  logout,
  getMe,
};
