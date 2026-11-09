# CertiChain - 25-Minute Team Video Presentation Script

Each member should speak for approximately five minutes. The project uses
Solidity for the smart contract and JavaScript for Hardhat, deployment,
testing, backend, and frontend. Python is not required.

## 1. Challa Adarsh - Project Introduction

Good morning everyone. My name is **Challa Adarsh**. Today, our team is
presenting our project called **Blockchain-Based Certificate Verification
System**, also known as **CertiChain**.

Our team members are Challa Adarsh, Bollam Pavan Adhitya, Dugyala Vinay,
Myakala Praveen, and Ganta Preetham.

The purpose of our project is to issue, store, and verify academic
certificates securely using blockchain technology.

In the traditional certificate system, certificates are printed on paper or
stored in normal databases. A person may create a fake certificate by editing
the name, course, marks, or institution details. Verification is also slow
because employers or other institutions must contact the issuing college
manually through emails, phone calls, or physical visits.

Paper certificates can be lost, damaged, or destroyed. A normal database can
also be changed by someone with unauthorized access. Our system solves these
problems by using a blockchain smart contract and cryptographic hashing.

When an institution issues a certificate, our system creates a unique
certificate ID and calculates a SHA-256 hash from the exact PDF file. This
hash is a digital fingerprint of the document. The hash and important
certificate details are recorded on the blockchain.

If even one character or one byte in the PDF changes, its hash becomes
different. During verification, the system calculates the uploaded file hash
again and compares it with the original hash stored on the blockchain.

Our system has three main users. The institution administrator can register
students, issue certificates, and revoke certificates. Students can view and
download their certificates. Employers, universities, and other public
verifiers can verify certificates using the certificate ID or PDF file.

The workflow is simple. The administrator selects an active student and
enters the course and institution details. The system generates or accepts a
certificate PDF, calculates its hash, and sends the hash to the smart
contract. The blockchain stores the certificate information. The certificate
is then saved in the database and made available for download.

For verification, a user enters the certificate ID or uploads the PDF. The
backend checks the blockchain record and returns `VALID`, `HASH_MISMATCH`,
`REVOKED`, or `NOT_FOUND`.

The main benefits are security, transparency, faster verification, tamper
detection, and reduced certificate fraud. Our technology stack includes
Solidity, JavaScript, Hardhat, Ethers.js, Node.js, Express, MongoDB, and
React.

I will now hand over to **Bollam Pavan Adhitya**, who will explain the smart
contract logic.

## 2. Bollam Pavan Adhitya - Smart Contract Logic

Good morning everyone. My name is **Bollam Pavan Adhitya**. I will explain the
blockchain logic in
`blockchain/contracts/CertificateRegistry.sol`.

This file contains our Solidity smart contract. A smart contract is a program
deployed on a blockchain that stores data and performs operations according to
predefined rules.

The contract has an `institution` variable containing the wallet address of
the authorized institution. When the contract is deployed, the deployer
becomes the institution.

The `Certificate` structure stores the certificate ID, certificate hash,
student identifier, course, institution, issue timestamp, revocation status,
revocation reason, revocation timestamp, and an `exists` flag. Certificate
records are stored in a mapping where the certificate ID is the key.

The `onlyInstitution` modifier checks whether the caller is the authorized
institution. If an unauthorized wallet tries to issue or revoke a
certificate, the transaction fails with the `OnlyInstitution` error.

The `issueCertificate()` function receives the certificate ID, file hash,
student ID, course, institution, and timestamp. It rejects an empty ID, an
empty hash, and a duplicate certificate ID. If the data is valid, it stores
the certificate, increases `totalCertificates`, and emits the
`CertificateIssued` event.

The `revokeCertificate()` function allows the institution to revoke a
certificate. It checks that the certificate exists, has not already been
revoked, and has a non-empty reason. It stores the reason and blockchain
timestamp, marks the certificate as revoked, and emits `CertificateRevoked`.

The `isCertificateValid()` function performs the main verification. It returns
`NOT_FOUND` for an unknown ID, `REVOKED` for a revoked certificate, and
`HASH_MISMATCH` when the submitted hash differs from the stored hash. If all
checks succeed, it returns `VALID`.

The `getCertificate()` function returns the complete certificate structure.
The `verifyCertificate()` function returns certificate details separately,
including the hash, student identifier, course, institution, and revocation
information.

The contract uses custom errors such as `EmptyHash`,
`CertificateAlreadyExists`, and `CertificateAlreadyRevoked`. It also uses
events so the backend and other applications can detect blockchain activity.

This contract protects the registry because only the institution can issue or
revoke records, duplicate IDs are rejected, and PDF changes can be detected
through hash comparison.

I will now hand over to **Dugyala Vinay**, who will explain the contract
tests.

## 3. Dugyala Vinay - Smart Contract Testing

Good morning everyone. My name is **Dugyala Vinay**. I will explain the
automated tests in
`blockchain/test/CertificateRegistry.test.js`.

Testing is important because blockchain transactions are permanent. Our test
file uses JavaScript, Hardhat, Ethers, and Chai. The `describe()` blocks
organize the tests into deployment, issuance, verification, and revocation.

The `beforeEach()` function runs before every test. It creates blockchain
accounts, uses one account as the institution, uses another account for
unauthorized-access tests, deploys a fresh contract, and creates sample and
mismatched hashes. A fresh contract ensures that every test starts with a
clean state.

The deployment tests confirm that the deployer becomes the institution and
that the initial certificate count is zero.

The issuance tests issue a valid certificate and expect the
`CertificateIssued` event. They check that the total count becomes one and
that `getCertificate()` returns the correct certificate ID, hash, student
identifier, revocation status, and existence value.

The security tests use the unauthorized account to attempt certificate
issuance. The transaction must fail with `OnlyInstitution`. Another test
issues a certificate and tries to issue the same ID again; it must fail with
`CertificateAlreadyExists`. Empty IDs and empty hashes are also tested and
must produce the corresponding custom errors.

The verification tests first issue a certificate. A correct hash must return
`true` and `VALID`. A different hash represents a modified PDF and must
return `false` and `HASH_MISMATCH`. An unknown ID must return `false` and
`NOT_FOUND`. The `verifyCertificate()` test checks that all certificate
metadata is returned correctly.

The revocation tests confirm that the institution can revoke a certificate
with a reason. They verify the revocation event, the `isRevoked` flag, the
stored reason, and the fact that future validation returns `REVOKED`.

Additional tests confirm that unauthorized users cannot revoke certificates,
an empty reason is rejected, and an already revoked certificate cannot be
revoked again. The final test confirms that a revoked certificate cannot be
issued again with the same ID.

These tests cover normal operations, invalid input, unauthorized access,
duplicate IDs, tampered files, and permanent revocation. We can run them with
`npm run test:contract` from the project root or `npx hardhat test` inside the
blockchain folder.

I will now hand over to **Myakala Praveen**, who will explain the backend and
blockchain connection.

## 4. Myakala Praveen - Backend and Blockchain Integration

Good morning everyone. My name is **Myakala Praveen**. I will explain how the
backend connects the web application, database, PDF files, and blockchain.

The main files are
`server/src/controllers/certificateController.js`,
`server/src/services/blockchainService.js`, and
`server/src/services/hashService.js`.

The `issueCertificate` controller reads the student ID, course, and
institution. It checks that the student exists and has an active account. It
then generates a unique certificate ID and public verification URL.

The system supports an uploaded PDF or an automatically generated PDF. After
obtaining the original PDF bytes, the controller calls
`calculateBufferHash()` in `hashService.js`. This function calculates a
lowercase SHA-256 hexadecimal hash. The service also provides
`calculateFileHash()` for hashing a file stream.

The `toContractBytes32()` function converts the 64-character SHA-256 value
into the `0x`-prefixed `bytes32` format required by Solidity.

The controller calls `issueCertificateOnChain()` in
`blockchainService.js`. This service uses Ethers.js to connect to the local
Hardhat network at `127.0.0.1:8545`. It loads the contract address and ABI,
creates a provider for blockchain access, and creates a signer representing
the institution wallet.

Before sending the transaction, the service checks whether the blockchain is
available. It calls the smart contract with the certificate ID, converted
hash, student identifier, course, institution, and timestamp. It waits for
confirmation and returns the transaction hash, block number, contract
address, issuing wallet, and gas used.

After blockchain confirmation, the controller generates the final PDF and
saves certificate metadata in MongoDB. The record includes the certificate
ID, student information, file hash, file paths, transaction hash, contract
address, block number, and verification URL. An audit log records who issued
the certificate and the blockchain transaction details.

The controller also handles failures. If the blockchain is unavailable, it
returns a service-unavailable response. If the blockchain transaction
succeeds but the database write fails, it creates a reconciliation record so
the on-chain certificate is not lost.

The backend is therefore the bridge between the React frontend, MongoDB, PDF
storage, hashing service, and Solidity smart contract.

I will now hand over to **Ganta Preetham**, who will explain the frontend.

## 5. Ganta Preetham - Frontend and Verification

Good morning everyone. My name is **Ganta Preetham**. I will explain the
frontend pages
`client/src/pages/admin/IssueCertificate.jsx`,
`client/src/pages/VerifyPage.jsx`, and
`client/src/services/api.js`.

The frontend is built with React. React state variables store form values,
selected files, loading status, errors, and verification results.

The `IssueCertificate.jsx` page is used by an administrator. When it opens,
the `useEffect()` hook requests active students from the backend. The
administrator selects a student, and the course field is filled from the
student record. The administrator can select automatic PDF generation or
upload an existing PDF.

When the form is submitted, `handleSubmit()` validates the student and file.
It creates a `FormData` object containing the student ID, course, institution,
and optional PDF. It sends this data to the backend. The page displays the
stages hashing, contract call, mining, and completion. After success, it
displays the certificate ID, transaction hash, block number, and SHA-256
hash. It also provides download and verification links.

The `VerifyPage.jsx` page supports verification by certificate ID and by PDF
upload. For ID verification, the user enters an ID and is taken to the
verification result page. For file verification, the page checks that the
selected file is a PDF, accepts the certificate ID, and sends the file to:

`/certificates/{certificateId}/verify-file`

The backend calculates the uploaded file hash and compares it with the
on-chain hash. The result can be `VALID`, `REVOKED`, `HASH_MISMATCH`, or
`NOT_FOUND`. The page displays loading indicators and clear error messages. It
can also detect a certificate ID from a filename containing a pattern such as
`CERT-2026-XXXXXX`.

The `api.js` service centralizes frontend requests to the backend. This avoids
duplicating request logic across components and makes the application easier
to maintain.

The frontend does not directly expose the institution private key or write to
the blockchain. It sends requests to the backend, which performs hashing and
blockchain operations securely.

The complete flow is therefore: the React interface collects data, the
backend hashes the PDF, the smart contract stores the hash, and the
verification page checks the certificate later.

This completes our presentation of the Blockchain-Based Certificate
Verification System. Thank you.
