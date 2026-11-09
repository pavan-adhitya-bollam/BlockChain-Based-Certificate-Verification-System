const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

class PDFService {
  /**
   * Generates a QR code image as a PNG buffer
   * @param {string} text URL or text
   * @returns {Promise<Buffer>}
   */
  async generateQRCodeBuffer(text) {
    return QRCode.toBuffer(text, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 150,
      color: {
        dark: "#1e293b",
        light: "#ffffff",
      },
    });
  }

  /**
   * Creates an official, beautiful landscape Certificate PDF
   * @param {Object} data Certificate details
   * @param {string} destinationPath File path to save the generated PDF
   * @returns {Promise<Buffer>}
   */
  async generateCertificatePDF(data, destinationPath = null) {
    const {
      certificateId,
      studentName,
      studentIdentifier,
      course,
      department,
      institution,
      graduationYear,
      issueDate,
      verificationUrl,
    } = data;

    const qrBuffer = await this.generateQRCodeBuffer(verificationUrl);

    return new Promise((resolve, reject) => {
      // Landscape A4: 841.89 x 595.28 points
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margins: { top: 40, bottom: 40, left: 40, right: 40 },
      });

      const buffers = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        if (destinationPath) {
          const dir = path.dirname(destinationPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFileSync(destinationPath, pdfData);
        }
        resolve(pdfData);
      });
      doc.on("error", (err) => reject(err));

      const width = doc.page.width;
      const height = doc.page.height;

      // Background - light cream/gold color
      doc.rect(0, 0, width, height).fill("#faf8f5");

      // Outer dark border
      doc.rect(10, 10, width - 20, height - 20).lineWidth(3).stroke("#1a1a1a");

      // Vertical banner on right side (COURSE CERTIFICATE)
      const bannerWidth = 60;
      const bannerX = width - 10 - bannerWidth;
      doc.rect(bannerX, 10, bannerWidth, height - 20).fill("#e0e0e0");
      
      // Banner text - rotated
      doc.save();
      doc.translate(bannerX + bannerWidth / 2, height / 2);
      doc.rotate(-90);
      doc.font("Helvetica-Bold").fontSize(14).fillColor("#666666")
        .text("COURSE CERTIFICATE", 0, 0, { align: "center" });
      doc.restore();

      // Institution logo placeholder (top left)
      doc.rect(50, 40, 80, 80).fill("#1e3a8a");
      doc.font("Helvetica").fontSize(10).fillColor("#ffffff")
        .text("LOGO", 90, 80, { align: "center" });

      // Institution name
      doc.font("Times-Bold").fontSize(20).fillColor("#1a1a1a")
        .text(institution, 150, 60);

      // Date below logo
      const dateStr = new Date(issueDate || Date.now()).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      doc.font("Times-Roman").fontSize(12).fillColor("#666666")
        .text(dateStr, 50, 140);

      // Main content area
      const contentX = 50;
      const contentY = 180;

      // "This certifies that" text
      doc.font("Times-Roman").fontSize(14).fillColor("#333333")
        .text("This certifies that", contentX, contentY);

      // Student name - large and bold
      doc.font("Times-Bold").fontSize(32).fillColor("#1a1a1a")
        .text(studentName, contentX, contentY + 30);

      // "has successfully completed" text
      doc.font("Times-Roman").fontSize(14).fillColor("#333333")
        .text("has successfully completed", contentX, contentY + 80);

      // Course name
      doc.font("Times-Bold").fontSize(18).fillColor("#1e3a8a")
        .text(course, contentX, contentY + 110);

      // Additional description
      doc.font("Times-Italic").fontSize(12).fillColor("#666666")
        .text(`an online course authorized by ${institution}`, contentX, contentY + 140);

      // Signature section
      const sigY = contentY + 200;
      doc.moveTo(contentX, sigY + 30).lineTo(contentX + 200, sigY + 30).lineWidth(1).stroke("#333333");
      doc.font("Times-Bold").fontSize(12).fillColor("#1a1a1a")
        .text("Authorized Signatory", contentX, sigY + 40);
      doc.font("Times-Roman").fontSize(10).fillColor("#666666")
        .text("Institution Administrator", contentX, sigY + 55);

      // Verification link
      const verifyY = sigY + 90;
      doc.font("Times-Bold").fontSize(10).fillColor("#1e3a8a")
        .text("Verify at:", contentX, verifyY);
      doc.font("Times-Roman").fontSize(10).fillColor("#1e3a8a")
        .text(verificationUrl, contentX, verifyY + 15);

      // QR Code
      const qrSize = 60;
      const qrX = width - bannerWidth - 80;
      doc.image(qrBuffer, qrX, verifyY, { width: qrSize, height: qrSize });

      // Disclaimer text at bottom
      const disclaimerY = height - 60;
      doc.font("Times-Roman").fontSize(8).fillColor("#999999")
        .text(
          "This certificate confirms that the individual named above has successfully completed the course requirements. " +
          "The certificate ID can be used to verify authenticity online.",
          contentX,
          disclaimerY,
          { width: width - bannerWidth - 150, align: "left" }
        );

      doc.end();
    });
  }
}

module.exports = new PDFService();
