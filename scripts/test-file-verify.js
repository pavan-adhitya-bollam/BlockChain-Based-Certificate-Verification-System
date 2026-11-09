const path = require("path");
require("../server/node_modules/dotenv").config({ path: path.join(__dirname, "../.env") });
const fs = require("fs");
const http = require("http");

async function testFileVerification() {
  const Certificate = require("../server/src/models/Certificate");
  const connectDB = require("../server/src/config/db");
  await connectDB();

  const cert = await Certificate.findOne({ certificateId: "CERT-2024-DEMO01" });
  if (!cert) {
    console.error("CERT-2024-DEMO01 not found");
    process.exit(1);
  }

  const fileBytes = fs.readFileSync(cert.generatedPdfPath);
  console.log("Original PDF length:", fileBytes.length, "bytes");

  const sendFile = (pdfBuffer) => {
    return new Promise((resolve, reject) => {
      const boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";
      const header = Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="certificate.pdf"\r\nContent-Type: application/pdf\r\n\r\n`
      );
      const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
      const body = Buffer.concat([header, pdfBuffer, footer]);

      const req = http.request(
        "http://localhost:5000/api/certificates/CERT-2024-DEMO01/verify-file",
        {
          method: "POST",
          headers: {
            "Content-Type": `multipart/form-data; boundary=${boundary}`,
            "Content-Length": body.length,
          },
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              resolve({ raw: data });
            }
          });
        }
      );
      req.on("error", reject);
      req.write(body);
      req.end();
    });
  };

  // Test 1: Authentic File
  const validRes = await sendFile(fileBytes);
  console.log("==========================================");
  console.log("TEST 1: AUTHENTIC PDF UPLOAD");
  console.log("Status:", validRes.status);
  console.log("Valid:", validRes.isValid);
  console.log("Hash Match:", validRes.hashMatch);
  console.log("Uploaded Hash:", validRes.uploadedFileHash);
  console.log("On-Chain Hash:", validRes.onChainHash);

  // Test 2: Modified / Tampered File
  const tamperedBytes = Buffer.from(fileBytes);
  tamperedBytes[tamperedBytes.length - 20] = 0x77; // tamper byte
  const tamperedRes = await sendFile(tamperedBytes);
  console.log("==========================================");
  console.log("TEST 2: TAMPERED PDF UPLOAD");
  console.log("Status:", tamperedRes.status);
  console.log("Valid:", tamperedRes.isValid);
  console.log("Hash Match:", tamperedRes.hashMatch);
  console.log("Uploaded Hash:", tamperedRes.uploadedFileHash);
  console.log("On-Chain Hash:", tamperedRes.onChainHash);
  console.log("Message:", tamperedRes.message);
  console.log("==========================================");

  process.exit(0);
}

testFileVerification().catch((err) => {
  console.error(err);
  process.exit(1);
});
