# Files to Explain for Demo Certificate (Bollam Pavan Adhitya - JE80YGRUIOD7)

## For Person 3: Code Workflow & Architecture

When explaining the demo certificate for **Bollam Pavan Adhitya** (Certificate ID: JE80YGRUIOD7), focus on these key files:

---

## 1. blockchainService.js
**Path:** `server/src/services/blockchainService.js`

**What to Explain:**
- Lines 136-199: `verifyCertificateOnChain()` function
  - Shows the hardcoded demo certificate logic for JE80YGRUIOD7
  - Returns VALID status with student details
  - Demonstrates bypassing actual blockchain for demo purposes
  
- Lines 201-242: `isCertificateValidOnChain()` function
  - Shows how PDF file verification works
  - Returns VALID for JE80YGRUIOD7
  - Used when verifying by PDF upload

**Key Points:**
- Demo certificates are hardcoded for easy testing
- Returns structured data: available, exists, isRevoked, status
- Includes student name, course, institution, issue date
- Generates SHA-256 hash for the certificate

---

## 2. certificateController.js
**Path:** `server/src/controllers/certificateController.js`

**What to Explain:**
- Lines 544-615: `downloadCertificate()` function
  - Lines 548-569: Special case for JE80YGRUIOD7
  - Generates PDF on-the-fly using pdfService
  - Passes hardcoded student details
  - Includes verification URL for QR code

- Lines 363-445: `verifyCertificate()` function
  - Lines 368: Calls blockchain service to verify certificate
  - Lines 378-391: Handles NOT_FOUND case
  - Lines 425-434: Returns metadata including student name from blockchain

**Key Points:**
- Download endpoint generates PDF dynamically for demo certificates
- Verification endpoint queries blockchain and returns details
- Uses student name from blockchain result first, then database
- Returns structured JSON with on-chain data and metadata

---

## 3. pdfService.js
**Path:** `server/src/services/pdfService.js`

**What to Explain:**
- Lines 30-165: `generateCertificatePDF()` function
  - Lines 30-43: Destructures data including verificationUrl
  - Lines 43: Generates QR code buffer
  - Lines 71-88: Creates background, border, and vertical banner
  - Lines 90-106: Institution logo and name
  - Lines 108-130: Main content (student name, course, etc.)
  - Lines 132-138: Signature section
  - Lines 140-145: Verification link
  - Lines 147-150: QR code placement
  - Lines 152-161: Disclaimer text

**Key Points:**
- Uses PDFKit for PDF generation
- Uses QRCode library for QR code generation
- Creates Coursera-style certificate layout
- Includes vertical "COURSE CERTIFICATE" banner
- Embeds QR code with verification URL
- Professional design with Times-Roman fonts

---

## 4. CertificateRegistry.sol
**Path:** `blockchain/contracts/CertificateRegistry.sol`

**What to Explain:**
- Lines 12-21: Certificate struct definition
  - Shows data structure stored on blockchain
  - Includes certificateHash, studentIdentifier, course, institution
  - Includes timestamps and revocation details

- Lines 34-52: issueCertificate() function
  - Only callable by institution
  - Validates inputs (no duplicate, no zero hash)
  - Stores certificate in mapping
  - Emits CertificateIssued event

- Lines 54-67: revokeCertificate() function
  - Only callable by institution
  - Requires non-empty reason
  - Sets isRevoked to true
  - Emits CertificateRevoked event

- Lines 69-85: isCertificateValid() function
  - Public view function
  - Returns (bool isValid, string status)
  - Checks existence, revocation, and hash match
  - Used for verification

- Lines 87-97: verifyCertificate() function
  - Public view function
  - Returns complete Certificate struct
  - Used to display certificate details

**Key Points:**
- Solidity smart contract for Ethereum blockchain
- Uses mapping for certificate storage
- Events for audit trail
- Access control (only institution can issue/revoke)
- View functions for verification (no gas cost)

---

## 5. VerifyResultPage.jsx
**Path:** `client/src/pages/VerifyResultPage.jsx`

**What to Explain:**
- Lines 32-53: useEffect hook
  - Fetches verification data from API
  - Calls `/certificates/${certificateId}/verify`
  - Handles loading and error states

- Lines 73-124: Status banner display
  - Shows VALID/REVOKED/NOT_FOUND status
  - Displays download button for VALID certificates
  - Uses VerificationStatusBadge component

- Lines 146-198: Certificate details display
  - Shows student name, identifier, institution
  - Shows course and issue date
  - Displays on-chain data

- Lines 200-268: Blockchain evidence section
  - Shows SHA-256 hash
  - Shows smart contract address
  - Shows transaction hash (if available)
  - Copy to clipboard functionality

**Key Points:**
- React component for verification results
- Fetches data from backend API
- Displays certificate details and blockchain proof
- Provides download link for PDF
- Shows cryptographic evidence

---

## 6. VerifyPage.jsx
**Path:** `client/src/pages/VerifyPage.jsx`

**What to Explain:**
- Lines 28-35: handleIdSubmit() function
  - Validates certificate ID input
  - Navigates to verification result page
  - Converts ID to uppercase

- Lines 57-95: handleFileSubmit() function
  - Validates file and certificate ID
  - Uploads PDF to backend
  - Calls `/certificates/${fileCertId}/verify-file`
  - Displays verification result

**Key Points:**
- Two verification methods: by ID and by PDF upload
- Form validation for inputs
- File type checking (PDF only)
- Error handling and display

---

## Suggested Explanation Order for Person 3

1. **Start with CertificateRegistry.sol** - Explain the smart contract foundation
2. **Move to blockchainService.js** - Show how backend interacts with blockchain
3. **Then certificateController.js** - Explain API endpoints and business logic
4. **Next pdfService.js** - Show how certificates are generated
5. **Finally VerifyResultPage.jsx** - Explain the frontend verification display

---

## Key Talking Points

### For JE80YGRUIOD7 Demo Certificate:
- "This is a hardcoded demo certificate for testing purposes"
- "It bypasses actual blockchain lookup to return predefined data"
- "Student: Bollam Pavan Adhitya"
- "Course: HTML, CSS, and Javascript for Web Developers"
- "Institution: Johns Hopkins University"
- "Status: VALID"
- "The same pattern is used for DEMO-VALID-002 and DEMO-REVOKED-001"

### Code Flow:
1. User enters JE80YGRUIOD7 on VerifyPage.jsx
2. Frontend calls `/certificates/JE80YGRUIOD7/verify`
3. certificateController.js calls blockchainService.js
4. blockchainService.js returns hardcoded demo data
5. Controller returns JSON with on-chain data
6. VerifyResultPage.jsx displays the result
7. User clicks download → certificateController.js generates PDF
8. pdfService.js creates PDF with QR code
9. PDF is returned to user for download

---

## Quick Reference for Recording

**File Locations:**
- Smart Contract: `blockchain/contracts/CertificateRegistry.sol`
- Blockchain Service: `server/src/services/blockchainService.js`
- Certificate Controller: `server/src/controllers/certificateController.js`
- PDF Service: `server/src/services/pdfService.js`
- Verify Result Page: `client/src/pages/VerifyResultPage.jsx`
- Verify Page: `client/src/pages/VerifyPage.jsx`

**Demo Certificate Details:**
- ID: JE80YGRUIOD7
- Student: BOLLAM PAVAN ADHITYA
- Course: HTML, CSS, and Javascript for Web Developers
- Institution: Johns Hopkins University
- Status: VALID
