require("dotenv").config({ path: "../.env" });
const connectDB = require("../config/db");
const Certificate = require("../models/Certificate");
const Student = require("../models/Student");
const blockchainService = require("../services/blockchainService");
const { logAction } = require("../services/auditService");

async function reconcileBlockchainWithDatabase() {
  try {
    console.log("==================================================================");
    console.log("Starting Blockchain-to-Database Reconciliation Routine...");
    console.log("==================================================================");

    await connectDB();

    const isBcAvailable = await blockchainService.isBlockchainAvailable();
    if (!isBcAvailable) {
      console.error("[Reconciliation Error] Hardhat blockchain is offline.");
      process.exit(1);
    }

    const contract = await blockchainService.getContract(true);
    const filter = contract.filters.CertificateIssued();
    const events = await contract.queryFilter(filter, 0, "latest");

    console.log(`Discovered ${events.length} CertificateIssued events on-chain.`);

    let reconciledCount = 0;

    for (const event of events) {
      const { certificateId, certificateHash, studentIdentifier, course, institution, issueTimestamp } = event.args;

      const existingInDb = await Certificate.findOne({ certificateId });

      if (!existingInDb) {
        console.warn(`[Missing Record Found] Certificate ${certificateId} exists on blockchain but missing in MongoDB!`);

        // Check if student exists
        let student = await Student.findOne({ studentIdentifier });
        if (!student) {
          student = await Student.create({
            studentIdentifier,
            name: `Student (${studentIdentifier})`,
            email: `${studentIdentifier.toLowerCase()}@reconciled.edu`,
            course,
            department: "Academic Department",
            graduationYear: new Date().getFullYear(),
          });
        }

        // Check if certificate has been revoked on chain
        const onChainData = await blockchainService.verifyCertificateOnChain(certificateId);

        await Certificate.create({
          certificateId,
          student: student._id,
          studentIdentifier,
          studentName: student.name,
          course,
          department: student.department,
          institution,
          issueDate: new Date(Number(issueTimestamp) * 1000),
          fileHash: onChainData.certificateHash,
          originalFileName: `${certificateId}-reconciled.pdf`,
          filePath: "reconciled_from_blockchain",
          blockchainTxHash: event.transactionHash,
          contractAddress: await contract.getAddress(),
          blockNumber: event.blockNumber,
          issuingWallet: (await blockchainService.getNetworkDetails()).institutionWallet,
          issueStatus: onChainData.isRevoked ? "revoked" : "issued",
          revocationDetails: onChainData.isRevoked
            ? {
                isRevoked: true,
                reason: onChainData.revokeReason,
                revokedAt: new Date(onChainData.revokeTimestamp),
                txHash: event.transactionHash,
              }
            : null,
          publicVerificationUrl: `http://localhost:5173/verify/${certificateId}`,
        });

        await logAction({
          action: "RECONCILIATION_COMPLETED",
          certificateId,
          studentIdentifier,
          transactionHash: event.transactionHash,
          details: { blockNumber: event.blockNumber },
        });

        reconciledCount++;
        console.log(` -> Successfully reconciled Certificate ${certificateId} into database!`);
      }
    }

    console.log("------------------------------------------------------------------");
    console.log(`Reconciliation finished. ${reconciledCount} missing records restored.`);
    console.log("==================================================================");

    process.exit(0);
  } catch (error) {
    console.error("Reconciliation error:", error);
    process.exit(1);
  }
}

reconcileBlockchainWithDatabase();
