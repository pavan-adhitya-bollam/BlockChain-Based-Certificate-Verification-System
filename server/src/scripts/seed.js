require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Student = require("../models/Student");
const Certificate = require("../models/Certificate");
const AuditLog = require("../models/AuditLog");
const blockchainService = require("../services/blockchainService");
const hashService = require("../services/hashService");
const pdfService = require("../services/pdfService");
const path = require("path");
const fs = require("fs");

const CLIENT_BASE_URL = process.env.CLIENT_URL || "http://localhost:5173";

const sampleStudentsData = [
  {
    studentIdentifier: "STU-2024-001",
    name: "Adarsh Challa",
    email: "adarsh.challa@student.edu",
    course: "B.Tech in Computer Science and Engineering",
    department: "Computer Science",
    graduationYear: 2024,
    password: "Student@123",
  },
  {
    studentIdentifier: "STU-2024-002",
    name: "Priya Patel",
    email: "priya.patel@student.edu",
    course: "B.Tech in Artificial Intelligence & Machine Learning",
    department: "Computer Science",
    graduationYear: 2024,
    password: "Student@123",
  },
  {
    studentIdentifier: "STU-2024-003",
    name: "Aarav Gupta",
    email: "aarav.gupta@student.edu",
    course: "B.Tech in Information Technology",
    department: "Information Technology",
    graduationYear: 2024,
    password: "Student@123",
  },
  {
    studentIdentifier: "STU-2024-004",
    name: "Sneha Reddy",
    email: "sneha.reddy@student.edu",
    course: "B.Tech in Electronics and Communication Engineering",
    department: "Electronics & Communication",
    graduationYear: 2024,
    password: "Student@123",
  },
  {
    studentIdentifier: "STU-2024-005",
    name: "Vikram Singh",
    email: "vikram.singh@student.edu",
    course: "B.Tech in Mechanical Engineering",
    department: "Mechanical Engineering",
    graduationYear: 2024,
    password: "Student@123",
  },
];

async function seedDatabase() {
  try {
    console.log("==================================================================");
    console.log("Starting Database Seeding for Student Certificate Blockchain System");
    console.log("==================================================================");

    await connectDB();

    // Clear existing development collections
    console.log("Cleaning previous development data...");
    await User.deleteMany({});
    await Student.deleteMany({});
    await Certificate.deleteMany({});
    await AuditLog.deleteMany({});

    // 1. Create Administrator Account
    console.log("Creating default Administrator account...");
    const adminUser = await User.create({
      name: "Dr. K. S. Ramanujan (Registrar)",
      email: "admin@institution.edu",
      password: "Admin@123",
      role: "admin",
      accountStatus: "active",
    });
    console.log(" -> Admin created: admin@institution.edu / Admin@123");

    // 2. Create Sample Students and Student User Accounts
    console.log("Creating 5 sample student records and login credentials...");
    const createdStudents = [];
    for (const item of sampleStudentsData) {
      const student = await Student.create({
        studentIdentifier: item.studentIdentifier,
        name: item.name,
        email: item.email,
        course: item.course,
        department: item.department,
        graduationYear: item.graduationYear,
        accountStatus: "active",
      });

      const studentUser = await User.create({
        name: student.name,
        email: student.email,
        password: item.password,
        role: "student",
        accountStatus: "active",
        studentRef: student._id,
      });

      student.userRef = studentUser._id;
      await student.save();
      createdStudents.push(student);
      console.log(` -> Student created: ${student.name} (${student.studentIdentifier}) | Login: ${student.email} / ${item.password}`);
    }

    // 3. Issue sample demo certificates if blockchain is available
    const isBcAvailable = await blockchainService.isBlockchainAvailable();
    if (isBcAvailable) {
      console.log("Blockchain node detected! Issuing demo certificates on Hardhat network...");
      const certDir = path.join(__dirname, "../../uploads/certificates");
      if (!fs.existsSync(certDir)) {
        fs.mkdirSync(certDir, { recursive: true });
      }

      // Certificate 1: Valid certificate for Adarsh Challa
      const student1 = createdStudents[0];
      const certId1 = "CERT-2024-DEMO01";
      const cert1Url = `${CLIENT_BASE_URL}/verify/${certId1}`;
      const cert1Path = path.join(certDir, `${certId1}.pdf`);

      const cert1Buffer = await pdfService.generateCertificatePDF(
        {
          certificateId: certId1,
          studentName: student1.name,
          studentIdentifier: student1.studentIdentifier,
          course: student1.course,
          department: student1.department,
          institution: "National Institute of Engineering & Technology",
          graduationYear: student1.graduationYear,
          issueDate: new Date("2024-05-15"),
          verificationUrl: cert1Url,
        },
        cert1Path
      );

      const hash1 = hashService.calculateBufferHash(cert1Buffer);
      const onChain1 = await blockchainService.issueCertificateOnChain(
        certId1,
        hash1,
        student1.studentIdentifier,
        student1.course,
        "National Institute of Engineering & Technology",
        new Date("2024-05-15").getTime()
      );

      await Certificate.create({
        certificateId: certId1,
        student: student1._id,
        studentIdentifier: student1.studentIdentifier,
        studentName: student1.name,
        course: student1.course,
        department: student1.department,
        institution: "National Institute of Engineering & Technology",
        issueDate: new Date("2024-05-15"),
        fileHash: hash1,
        originalFileName: `${certId1}.pdf`,
        filePath: cert1Path,
        generatedPdfPath: cert1Path,
        blockchainTxHash: onChain1.txHash,
        contractAddress: onChain1.contractAddress,
        blockNumber: onChain1.blockNumber,
        issuingWallet: onChain1.issuingWallet,
        issueStatus: "issued",
        publicVerificationUrl: cert1Url,
      });

      console.log(` -> Demo Certificate 1 Issued: ${certId1} (Status: VALID, Tx: ${onChain1.txHash.slice(0, 16)}...)`);

      // Certificate 2: Revoked certificate for Priya Patel
      const student2 = createdStudents[1];
      const certId2 = "CERT-2024-DEMO02";
      const cert2Url = `${CLIENT_BASE_URL}/verify/${certId2}`;
      const cert2Path = path.join(certDir, `${certId2}.pdf`);

      const cert2Buffer = await pdfService.generateCertificatePDF(
        {
          certificateId: certId2,
          studentName: student2.name,
          studentIdentifier: student2.studentIdentifier,
          course: student2.course,
          department: student2.department,
          institution: "National Institute of Engineering & Technology",
          graduationYear: student2.graduationYear,
          issueDate: new Date("2024-06-20"),
          verificationUrl: cert2Url,
        },
        cert2Path
      );

      const hash2 = hashService.calculateBufferHash(cert2Buffer);
      const onChain2 = await blockchainService.issueCertificateOnChain(
        certId2,
        hash2,
        student2.studentIdentifier,
        student2.course,
        "National Institute of Engineering & Technology",
        new Date("2024-06-20").getTime()
      );

      // Now revoke it on-chain
      const revokeReason = "Administrative review: Incorrect credit score recorded. Re-issuance pending.";
      const revokeReceipt = await blockchainService.revokeCertificateOnChain(certId2, revokeReason);

      await Certificate.create({
        certificateId: certId2,
        student: student2._id,
        studentIdentifier: student2.studentIdentifier,
        studentName: student2.name,
        course: student2.course,
        department: student2.department,
        institution: "National Institute of Engineering & Technology",
        issueDate: new Date("2024-06-20"),
        fileHash: hash2,
        originalFileName: `${certId2}.pdf`,
        filePath: cert2Path,
        generatedPdfPath: cert2Path,
        blockchainTxHash: onChain2.txHash,
        contractAddress: onChain2.contractAddress,
        blockNumber: onChain2.blockNumber,
        issuingWallet: onChain2.issuingWallet,
        issueStatus: "revoked",
        revocationDetails: {
          isRevoked: true,
          reason: revokeReason,
          revokedAt: new Date(),
          txHash: revokeReceipt.txHash,
        },
        publicVerificationUrl: cert2Url,
      });

      console.log(` -> Demo Certificate 2 Issued & Revoked: ${certId2} (Status: REVOKED, Tx: ${revokeReceipt.txHash.slice(0, 16)}...)`);
    } else {
      console.log("Notice: Hardhat node not running during seed. Users & students created. Start Hardhat and deploy contract to issue on-chain certificates.");
    }

    console.log("==================================================================");
    console.log("Database Seeding Completed Successfully!");
    console.log("Admin Credentials:   admin@institution.edu / Admin@123");
    console.log("Student Credentials: adarsh.challa@student.edu / Student@123");
    console.log("==================================================================");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed with error:", error);
    process.exit(1);
  }
}

seedDatabase();
