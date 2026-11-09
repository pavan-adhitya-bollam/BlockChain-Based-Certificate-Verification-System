const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificateRegistry", function () {
  let certificateRegistry;
  let owner;
  let unauthorizedAccount;
  let sampleHash;
  let mismatchedHash;

  const sampleCert = {
    id: "CERT-2026-TEST01",
    studentId: "STU-2024-001",
    course: "B.Tech in Computer Science and Engineering",
    institution: "National Institute of Engineering & Technology",
    timestamp: Math.floor(Date.now() / 1000),
  };

  beforeEach(async function () {
    [owner, unauthorizedAccount] = await ethers.getSigners();

    // Standard SHA-256 test hashes
    sampleHash = ethers.keccak256(ethers.toUtf8Bytes("original_test_pdf_bytes_sha256"));
    mismatchedHash = ethers.keccak256(ethers.toUtf8Bytes("tampered_test_pdf_bytes_sha256"));

    const CertificateRegistry = await ethers.getContractFactory("CertificateRegistry");
    certificateRegistry = await CertificateRegistry.deploy();
    await certificateRegistry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set deployer as the institution owner", async function () {
      expect(await certificateRegistry.institution()).to.equal(owner.address);
    });

    it("should start with 0 total certificates", async function () {
      expect(await certificateRegistry.totalCertificates()).to.equal(0);
    });
  });

  describe("Certificate Issuance", function () {
    it("should allow institution to issue a valid certificate and emit CertificateIssued", async function () {
      await expect(
        certificateRegistry.issueCertificate(
          sampleCert.id,
          sampleHash,
          sampleCert.studentId,
          sampleCert.course,
          sampleCert.institution,
          sampleCert.timestamp
        )
      )
        .to.emit(certificateRegistry, "CertificateIssued")
        .withArgs(
          sampleCert.id,
          sampleHash,
          sampleCert.studentId,
          sampleCert.course,
          sampleCert.institution,
          sampleCert.timestamp
        );

      expect(await certificateRegistry.totalCertificates()).to.equal(1);

      const cert = await certificateRegistry.getCertificate(sampleCert.id);
      expect(cert.certificateId).to.equal(sampleCert.id);
      expect(cert.certificateHash).to.equal(sampleHash);
      expect(cert.studentIdentifier).to.equal(sampleCert.studentId);
      expect(cert.isRevoked).to.be.false;
      expect(cert.exists).to.be.true;
    });

    it("should reject unauthorized callers from issuing certificates", async function () {
      await expect(
        certificateRegistry
          .connect(unauthorizedAccount)
          .issueCertificate(
            sampleCert.id,
            sampleHash,
            sampleCert.studentId,
            sampleCert.course,
            sampleCert.institution,
            sampleCert.timestamp
          )
      ).to.be.revertedWithCustomError(certificateRegistry, "OnlyInstitution");
    });

    it("should reject duplicate certificate IDs", async function () {
      await certificateRegistry.issueCertificate(
        sampleCert.id,
        sampleHash,
        sampleCert.studentId,
        sampleCert.course,
        sampleCert.institution,
        sampleCert.timestamp
      );

      await expect(
        certificateRegistry.issueCertificate(
          sampleCert.id,
          sampleHash,
          sampleCert.studentId,
          sampleCert.course,
          sampleCert.institution,
          sampleCert.timestamp
        )
      ).to.be.revertedWithCustomError(certificateRegistry, "CertificateAlreadyExists");
    });

    it("should reject empty certificate ID or empty hash", async function () {
      await expect(
        certificateRegistry.issueCertificate(
          "",
          sampleHash,
          sampleCert.studentId,
          sampleCert.course,
          sampleCert.institution,
          sampleCert.timestamp
        )
      ).to.be.revertedWithCustomError(certificateRegistry, "EmptyCertificateId");

      await expect(
        certificateRegistry.issueCertificate(
          "CERT-NO-HASH",
          ethers.ZeroHash,
          sampleCert.studentId,
          sampleCert.course,
          sampleCert.institution,
          sampleCert.timestamp
        )
      ).to.be.revertedWithCustomError(certificateRegistry, "EmptyHash");
    });
  });

  describe("Certificate Verification", function () {
    beforeEach(async function () {
      await certificateRegistry.issueCertificate(
        sampleCert.id,
        sampleHash,
        sampleCert.studentId,
        sampleCert.course,
        sampleCert.institution,
        sampleCert.timestamp
      );
    });

    it("should confirm valid certificate when hash matches and not revoked", async function () {
      const [isValid, status] = await certificateRegistry.isCertificateValid(
        sampleCert.id,
        sampleHash
      );
      expect(isValid).to.be.true;
      expect(status).to.equal("VALID");
    });

    it("should flag HASH_MISMATCH when hash does not match original", async function () {
      const [isValid, status] = await certificateRegistry.isCertificateValid(
        sampleCert.id,
        mismatchedHash
      );
      expect(isValid).to.be.false;
      expect(status).to.equal("HASH_MISMATCH");
    });

    it("should return NOT_FOUND for unknown certificate ID", async function () {
      const [isValid, status] = await certificateRegistry.isCertificateValid(
        "NON_EXISTENT_ID",
        sampleHash
      );
      expect(isValid).to.be.false;
      expect(status).to.equal("NOT_FOUND");
    });

    it("should return full unpack data via verifyCertificate", async function () {
      const result = await certificateRegistry.verifyCertificate(sampleCert.id);
      expect(result.exists).to.be.true;
      expect(result.isRevoked).to.be.false;
      expect(result.certificateHash).to.equal(sampleHash);
      expect(result.studentIdentifier).to.equal(sampleCert.studentId);
      expect(result.course).to.equal(sampleCert.course);
      expect(result.certInstitution).to.equal(sampleCert.institution);
    });
  });

  describe("Certificate Revocation", function () {
    beforeEach(async function () {
      await certificateRegistry.issueCertificate(
        sampleCert.id,
        sampleHash,
        sampleCert.studentId,
        sampleCert.course,
        sampleCert.institution,
        sampleCert.timestamp
      );
    });

    it("should allow institution to revoke certificate with reason", async function () {
      const reason = "Administrative disciplinary action";
      await expect(certificateRegistry.revokeCertificate(sampleCert.id, reason))
        .to.emit(certificateRegistry, "CertificateRevoked");

      const cert = await certificateRegistry.getCertificate(sampleCert.id);
      expect(cert.isRevoked).to.be.true;
      expect(cert.revokeReason).to.equal(reason);
      expect(cert.revokeTimestamp).to.be.gt(0);

      // Validation check must return REVOKED
      const [isValid, status] = await certificateRegistry.isCertificateValid(
        sampleCert.id,
        sampleHash
      );
      expect(isValid).to.be.false;
      expect(status).to.equal("REVOKED");
    });

    it("should reject unauthorized callers from revoking certificate", async function () {
      await expect(
        certificateRegistry
          .connect(unauthorizedAccount)
          .revokeCertificate(sampleCert.id, "Malicious attempt")
      ).to.be.revertedWithCustomError(certificateRegistry, "OnlyInstitution");
    });

    it("should reject revocation if reason is empty", async function () {
      await expect(
        certificateRegistry.revokeCertificate(sampleCert.id, "")
      ).to.be.revertedWithCustomError(certificateRegistry, "EmptyReason");
    });

    it("should reject revoking an already revoked certificate", async function () {
      await certificateRegistry.revokeCertificate(sampleCert.id, "First revocation");
      await expect(
        certificateRegistry.revokeCertificate(sampleCert.id, "Second revocation")
      ).to.be.revertedWithCustomError(certificateRegistry, "CertificateAlreadyRevoked");
    });

    it("should permanently invalidate certificate and prevent re-issuance", async function () {
      await certificateRegistry.revokeCertificate(sampleCert.id, "Permanently annulled");

      // Attempting to re-issue must fail
      await expect(
        certificateRegistry.issueCertificate(
          sampleCert.id,
          sampleHash,
          sampleCert.studentId,
          sampleCert.course,
          sampleCert.institution,
          sampleCert.timestamp
        )
      ).to.be.revertedWithCustomError(certificateRegistry, "CertificateAlreadyExists");

      // Must remain revoked forever
      const [isValid, status] = await certificateRegistry.isCertificateValid(
        sampleCert.id,
        sampleHash
      );
      expect(isValid).to.be.false;
      expect(status).to.equal("REVOKED");
    });
  });
});
