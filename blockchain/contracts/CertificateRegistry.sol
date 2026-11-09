// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title CertificateRegistry
 * @dev Cryptographic and verifiable registry for academic student certificates.
 * Provides on-chain immutability, tamper detection, and revocation tracking.
 */
contract CertificateRegistry {
    address public institution;

    struct Certificate {
        string certificateId;
        bytes32 certificateHash; // SHA-256 hash of original PDF file
        string studentIdentifier; // Unique student identifier (e.g., STU-2024-001)
        string course;
        string institution;
        uint256 issueTimestamp;
        bool isRevoked;
        string revokeReason;
        uint256 revokeTimestamp;
        bool exists;
    }

    // Mapping of unique certificate ID to Certificate record
    mapping(string => Certificate) private certificates;

    // Total count of certificates registered on-chain
    uint256 public totalCertificates;

    // Events
    event CertificateIssued(
        string certificateId,
        bytes32 certificateHash,
        string studentIdentifier,
        string course,
        string institution,
        uint256 issueTimestamp
    );

    event CertificateRevoked(
        string certificateId,
        string reason,
        uint256 revokeTimestamp
    );

    event InstitutionTransferred(
        address indexed previousInstitution,
        address indexed newInstitution
    );

    // Custom errors for gas efficiency and clear debugging
    error OnlyInstitution();
    error CertificateAlreadyExists(string certificateId);
    error CertificateDoesNotExist(string certificateId);
    error CertificateAlreadyRevoked(string certificateId);
    error EmptyCertificateId();
    error EmptyHash();
    error EmptyReason();
    error InvalidAddress();

    modifier onlyInstitution() {
        if (msg.sender != institution) {
            revert OnlyInstitution();
        }
        _;
    }

    constructor() {
        institution = msg.sender;
    }

    /**
     * @notice Allows institution wallet to transfer administrative control
     * @param _newInstitution Address of new institution wallet
     */
    function transferInstitution(address _newInstitution) external onlyInstitution {
        if (_newInstitution == address(0)) {
            revert InvalidAddress();
        }
        address prev = institution;
        institution = _newInstitution;
        emit InstitutionTransferred(prev, _newInstitution);
    }

    /**
     * @notice Registers a new student certificate on the blockchain
     */
    function issueCertificate(
        string memory _certificateId,
        bytes32 _certificateHash,
        string memory _studentIdentifier,
        string memory _course,
        string memory _institution,
        uint256 _issueTimestamp
    ) external onlyInstitution {
        if (bytes(_certificateId).length == 0) revert EmptyCertificateId();
        if (_certificateHash == bytes32(0)) revert EmptyHash();
        if (certificates[_certificateId].exists) {
            revert CertificateAlreadyExists(_certificateId);
        }

        uint256 timestamp = _issueTimestamp > 0 ? _issueTimestamp : block.timestamp;

        certificates[_certificateId] = Certificate({
            certificateId: _certificateId,
            certificateHash: _certificateHash,
            studentIdentifier: _studentIdentifier,
            course: _course,
            institution: _institution,
            issueTimestamp: timestamp,
            isRevoked: false,
            revokeReason: "",
            revokeTimestamp: 0,
            exists: true
        });

        totalCertificates++;

        emit CertificateIssued(
            _certificateId,
            _certificateHash,
            _studentIdentifier,
            _course,
            _institution,
            timestamp
        );
    }

    /**
     * @notice Revokes a previously issued certificate with a mandatory reason
     */
    function revokeCertificate(
        string memory _certificateId,
        string memory _reason
    ) external onlyInstitution {
        if (!certificates[_certificateId].exists) {
            revert CertificateDoesNotExist(_certificateId);
        }
        if (certificates[_certificateId].isRevoked) {
            revert CertificateAlreadyRevoked(_certificateId);
        }
        if (bytes(_reason).length == 0) {
            revert EmptyReason();
        }

        certificates[_certificateId].isRevoked = true;
        certificates[_certificateId].revokeReason = _reason;
        certificates[_certificateId].revokeTimestamp = block.timestamp;

        emit CertificateRevoked(_certificateId, _reason, block.timestamp);
    }

    /**
     * @notice Fast validity and tamper check against on-chain hash
     */
    function isCertificateValid(
        string memory _certificateId,
        bytes32 _certificateHash
    ) external view returns (bool isValid, string memory status) {
        Certificate memory cert = certificates[_certificateId];
        if (!cert.exists) {
            return (false, "NOT_FOUND");
        }
        if (cert.isRevoked) {
            return (false, "REVOKED");
        }
        if (cert.certificateHash != _certificateHash) {
            return (false, "HASH_MISMATCH");
        }
        return (true, "VALID");
    }

    /**
     * @notice Retrieves full public metadata and status of a certificate
     */
    function getCertificate(
        string memory _certificateId
    ) external view returns (Certificate memory) {
        if (!certificates[_certificateId].exists) {
            revert CertificateDoesNotExist(_certificateId);
        }
        return certificates[_certificateId];
    }

    /**
     * @notice Verifies and unpacks certificate metadata for external verifiers
     */
    function verifyCertificate(
        string memory _certificateId
    ) external view returns (
        bool exists,
        bool isRevoked,
        bytes32 certificateHash,
        string memory studentIdentifier,
        string memory course,
        string memory certInstitution,
        uint256 issueTimestamp,
        string memory revokeReason,
        uint256 revokeTimestamp
    ) {
        Certificate memory cert = certificates[_certificateId];
        if (!cert.exists) {
            return (false, false, bytes32(0), "", "", "", 0, "", 0);
        }
        return (
            cert.exists,
            cert.isRevoked,
            cert.certificateHash,
            cert.studentIdentifier,
            cert.course,
            cert.institution,
            cert.issueTimestamp,
            cert.revokeReason,
            cert.revokeTimestamp
        );
    }
}
