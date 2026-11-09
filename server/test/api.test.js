import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const app = require("../src/app");
const User = require("../src/models/User");
const Student = require("../src/models/Student");
const Certificate = require("../src/models/Certificate");
const blockchainService = require("../src/services/blockchainService");
const hashService = require("../src/services/hashService");

const TEST_DB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/certificate_verification_test_db";

describe("API Test Suite - Student Certificate Validation", () => {
  let adminToken;
  let studentToken;
  let student2Token;
  let testStudent1;
  let testStudent2;
  let testCertificate;

  const samplePdfBytes = Buffer.from("%PDF-1.4 sample genuine certificate content");
  const tamperedPdfBytes = Buffer.from("%PDF-1.4 altered certificate content with tampered grade");
  const samplePdfHash = hashService.calculateBufferHash(samplePdfBytes);

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_DB_URI);
    }

    // Clean test collections
    await User.deleteMany({});
    await Student.deleteMany({});
    await Certificate.deleteMany({});

    // 1. Create Admin
    const adminUser = await User.create({
      name: "Test Administrator",
      email: "test.admin@institution.edu",
      password: "AdminPassword123",
      role: "admin",
      accountStatus: "active",
    });

    // 2. Create Student 1
    testStudent1 = await Student.create({
      studentIdentifier: "STU-TEST-001",
      name: "Alice Smith",
      email: "alice@student.edu",
      course: "B.Tech CSE",
      department: "CSE",
      graduationYear: 2024,
      accountStatus: "active",
    });

    const studentUser1 = await User.create({
      name: testStudent1.name,
      email: testStudent1.email,
      password: "StudentPassword123",
      role: "student",
      accountStatus: "active",
      studentRef: testStudent1._id,
    });

    testStudent1.userRef = studentUser1._id;
    await testStudent1.save();

    // 3. Create Student 2
    testStudent2 = await Student.create({
      studentIdentifier: "STU-TEST-002",
      name: "Bob Jones",
      email: "bob@student.edu",
      course: "B.Tech IT",
      department: "IT",
      graduationYear: 2024,
      accountStatus: "active",
    });

    const studentUser2 = await User.create({
      name: testStudent2.name,
      email: testStudent2.email,
      password: "StudentPassword123",
      role: "student",
      accountStatus: "active",
      studentRef: testStudent2._id,
    });

    testStudent2.userRef = studentUser2._id;
    await testStudent2.save();

    // Login Admin
    const adminRes = await request(app).post("/api/auth/login").send({
      email: "test.admin@institution.edu",
      password: "AdminPassword123",
    });
    adminToken = adminRes.body.token;

    // Login Student 1
    const s1Res = await request(app).post("/api/auth/login").send({
      email: "alice@student.edu",
      password: "StudentPassword123",
    });
    studentToken = s1Res.body.token;

    // Login Student 2
    const s2Res = await request(app).post("/api/auth/login").send({
      email: "bob@student.edu",
      password: "StudentPassword123",
    });
    student2Token = s2Res.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("1. Authentication Endpoints", () => {
    it("should authenticate admin with valid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "test.admin@institution.edu",
        password: "AdminPassword123",
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe("admin");
    });

    it("should reject invalid login credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "test.admin@institution.edu",
        password: "WrongPassword!",
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject login for non-existent user", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "doesnotexist@nowhere.com",
        password: "SomePassword123",
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should fetch current authenticated user profile via /api/auth/me", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe("test.admin@institution.edu");
    });
  });

  describe("2. Role-based Authorization & Access Control", () => {
    it("should allow admin to access student management list", async () => {
      const res = await request(app)
        .get("/api/students")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.students.length).toBeGreaterThanOrEqual(2);
    });

    it("should reject student from accessing student management list", async () => {
      const res = await request(app)
        .get("/api/students")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should reject student from issuing certificates", async () => {
      const res = await request(app)
        .post("/api/certificates/issue")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          studentId: testStudent1._id,
          course: "B.Tech CSE",
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe("3. Student Record Privacy & Management", () => {
    it("should allow admin to create a new student", async () => {
      const res = await request(app)
        .post("/api/students")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          studentIdentifier: "STU-TEST-003",
          name: "Charlie Brown",
          email: "charlie@student.edu",
          course: "B.Tech Mechanical",
          department: "Mechanical",
          graduationYear: 2025,
        });

      expect(res.status).toBe(201);
      expect(res.body.student.studentIdentifier).toBe("STU-TEST-003");
    });

    it("should reject creating duplicate student identifiers", async () => {
      const res = await request(app)
        .post("/api/students")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          studentIdentifier: "STU-TEST-003",
          name: "Duplicate Charlie",
          email: "another.charlie@student.edu",
          course: "B.Tech Mechanical",
          department: "Mechanical",
          graduationYear: 2025,
        });

      expect(res.status).toBe(409);
    });
  });

  describe("4. Certificate Verification & File Hash Integrity", () => {
    let mockCertId = "CERT-2024-TEST-MOCK";

    beforeAll(async () => {
      // Mock an existing certificate record
      testCertificate = await Certificate.create({
        certificateId: mockCertId,
        student: testStudent1._id,
        studentIdentifier: testStudent1.studentIdentifier,
        studentName: testStudent1.name,
        course: testStudent1.course,
        department: testStudent1.department,
        institution: "National Institute of Engineering & Technology",
        issueDate: new Date(),
        fileHash: samplePdfHash,
        originalFileName: "sample.pdf",
        filePath: "dummy/path",
        blockchainTxHash: "0x" + "a".repeat(64),
        contractAddress: "0x" + "b".repeat(40),
        blockNumber: 101,
        issuingWallet: "0x" + "c".repeat(40),
        issueStatus: "issued",
      });
    });

    it("should return NOT_FOUND for non-existent certificate ID", async () => {
      // Mock verifyCertificateOnChain returning exists: false
      const origVerify = blockchainService.verifyCertificateOnChain;
      blockchainService.verifyCertificateOnChain = async () => ({
        available: true,
        exists: false,
        status: "NOT_FOUND",
      });

      const res = await request(app).get("/api/certificates/UNKNOWN-CERT-999/verify");
      expect(res.status).toBe(404);
      expect(res.body.status).toBe("NOT_FOUND");

      blockchainService.verifyCertificateOnChain = origVerify;
    });

    it("should return VERIFICATION_UNAVAILABLE when blockchain is offline", async () => {
      const origVerify = blockchainService.verifyCertificateOnChain;
      blockchainService.verifyCertificateOnChain = async () => ({
        available: false,
        status: "VERIFICATION_UNAVAILABLE",
      });

      const res = await request(app).get(`/api/certificates/${mockCertId}/verify`);
      expect(res.status).toBe(503);
      expect(res.body.status).toBe("VERIFICATION_UNAVAILABLE");

      blockchainService.verifyCertificateOnChain = origVerify;
    });

    it("should verify valid certificate against blockchain record", async () => {
      const origVerify = blockchainService.verifyCertificateOnChain;
      blockchainService.verifyCertificateOnChain = async () => ({
        available: true,
        exists: true,
        isRevoked: false,
        status: "VALID",
        certificateHash: samplePdfHash,
        studentIdentifier: testStudent1.studentIdentifier,
        course: testStudent1.course,
        institution: "National Institute of Engineering & Technology",
        issueTimestamp: Date.now(),
        contractAddress: "0x1234567890123456789012345678901234567890",
      });

      const res = await request(app).get(`/api/certificates/${mockCertId}/verify`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("VALID");
      expect(res.body.isValid).toBe(true);
      expect(res.body.metadata.studentName).toBe(testStudent1.name);

      blockchainService.verifyCertificateOnChain = origVerify;
    });

    it("should return REVOKED for a revoked certificate", async () => {
      const origVerify = blockchainService.verifyCertificateOnChain;
      blockchainService.verifyCertificateOnChain = async () => ({
        available: true,
        exists: true,
        isRevoked: true,
        status: "REVOKED",
        certificateHash: samplePdfHash,
        studentIdentifier: testStudent1.studentIdentifier,
        course: testStudent1.course,
        institution: "National Institute of Engineering & Technology",
        issueTimestamp: Date.now(),
        revokeReason: "Degree annulled due to plagiarism",
        revokeTimestamp: Date.now(),
        contractAddress: "0x1234567890123456789012345678901234567890",
      });

      const res = await request(app).get(`/api/certificates/${mockCertId}/verify`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("REVOKED");
      expect(res.body.isValid).toBe(false);
      expect(res.body.revocationDetails.reason).toBe("Degree annulled due to plagiarism");

      blockchainService.verifyCertificateOnChain = origVerify;
    });

    it("should confirm file validity when uploaded PDF hash matches", async () => {
      const origValid = blockchainService.isCertificateValidOnChain;
      const origVerify = blockchainService.verifyCertificateOnChain;

      blockchainService.isCertificateValidOnChain = async () => ({
        available: true,
        isValid: true,
        status: "VALID",
        contractAddress: "0x1234567890123456789012345678901234567890",
      });

      blockchainService.verifyCertificateOnChain = async () => ({
        available: true,
        exists: true,
        isRevoked: false,
        certificateHash: samplePdfHash,
        studentIdentifier: testStudent1.studentIdentifier,
        course: testStudent1.course,
        institution: "National Institute of Engineering & Technology",
        issueTimestamp: Date.now(),
      });

      const res = await request(app)
        .post(`/api/certificates/${mockCertId}/verify-file`)
        .attach("file", samplePdfBytes, "certificate.pdf");

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("VALID");
      expect(res.body.hashMatch).toBe(true);

      blockchainService.isCertificateValidOnChain = origValid;
      blockchainService.verifyCertificateOnChain = origVerify;
    });

    it("should flag HASH_MISMATCH when uploaded PDF has been modified", async () => {
      const origValid = blockchainService.isCertificateValidOnChain;
      const origVerify = blockchainService.verifyCertificateOnChain;

      blockchainService.isCertificateValidOnChain = async () => ({
        available: true,
        isValid: false,
        status: "HASH_MISMATCH",
        contractAddress: "0x1234567890123456789012345678901234567890",
      });

      blockchainService.verifyCertificateOnChain = async () => ({
        available: true,
        exists: true,
        isRevoked: false,
        certificateHash: samplePdfHash,
        studentIdentifier: testStudent1.studentIdentifier,
        course: testStudent1.course,
        institution: "National Institute of Engineering & Technology",
        issueTimestamp: Date.now(),
      });

      const res = await request(app)
        .post(`/api/certificates/${mockCertId}/verify-file`)
        .attach("file", tamperedPdfBytes, "tampered_certificate.pdf");

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("HASH_MISMATCH");
      expect(res.body.hashMatch).toBe(false);

      blockchainService.isCertificateValidOnChain = origValid;
      blockchainService.verifyCertificateOnChain = origVerify;
    });
  });

  describe("5. Student Certificate Scoping (Ownership Privacy)", () => {
    it("should isolate student certificate listings to only their own certificates", async () => {
      // Student 1 requests certificates
      const res = await request(app)
        .get("/api/certificates")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.certificates.length).toBe(1);
      expect(res.body.certificates[0].studentIdentifier).toBe("STU-TEST-001");

      // Student 2 requests certificates (has none)
      const res2 = await request(app)
        .get("/api/certificates")
        .set("Authorization", `Bearer ${student2Token}`);

      expect(res2.status).toBe(200);
      expect(res2.body.certificates.length).toBe(0);
    });
  });
});
