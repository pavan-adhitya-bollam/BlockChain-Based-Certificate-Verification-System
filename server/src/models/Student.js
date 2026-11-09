const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    studentIdentifier: {
      type: String,
      required: [true, "Student identifier is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Student email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    course: {
      type: String,
      required: [true, "Course is required"],
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    graduationYear: {
      type: Number,
      required: [true, "Graduation year is required"],
    },
    accountStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Student || mongoose.model("Student", studentSchema);
