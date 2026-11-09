import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FilePlus,
  Users,
  Building,
  GraduationCap,
  FileUp,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import api from "../../services/api";

export const IssueCertificate = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [course, setCourse] = useState("");
  const [institution, setInstitution] = useState("National Institute of Engineering & Technology");
  const [issuanceMode, setIssuanceMode] = useState("auto"); // "auto" | "upload"
  const [uploadedFile, setUploadedFile] = useState(null);

  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0 = idle, 1 = hashing, 2 = contract call, 3 = mining, 4 = complete
  const [errorMessage, setErrorMessage] = useState("");
  const [issuedResult, setIssuedResult] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get("/students?status=active&limit=100");
        if (res.success) {
          setStudents(res.students);
          if (res.students.length > 0) {
            setSelectedStudentId(res.students[0]._id);
            setCourse(res.students[0].course);
          }
        }
      } catch (err) {
        console.error("Failed to load students:", err);
      } finally {
        setIsLoadingStudents(false);
      }
    };
    fetchStudents();
  }, []);

  const handleStudentChange = (e) => {
    const sId = e.target.value;
    setSelectedStudentId(sId);
    const stu = students.find((s) => s._id === sId);
    if (stu) {
      setCourse(stu.course);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        setErrorMessage("Please select a genuine PDF document.");
        setUploadedFile(null);
        return;
      }
      setUploadedFile(file);
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setErrorMessage("Please select a registered student.");
      return;
    }
    if (issuanceMode === "upload" && !uploadedFile) {
      setErrorMessage("Please upload the PDF certificate file to hash and anchor.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setCurrentStep(1); // Hashing

    try {
      const formData = new FormData();
      formData.append("studentId", selectedStudentId);
      formData.append("course", course);
      formData.append("institution", institution);

      if (issuanceMode === "upload" && uploadedFile) {
        formData.append("file", uploadedFile);
      }

      // Simulate UI stage transition for demonstration clarity
      setTimeout(() => setCurrentStep(2), 600); // Interacting with contract
      setTimeout(() => setCurrentStep(3), 1200); // Mining block

      const res = await api.post("/certificates/issue", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setCurrentStep(4);
      setIssuedResult(res);
    } catch (err) {
      setErrorMessage(
        err.message ||
          "Failed to issue certificate. Ensure Hardhat local node is running on 127.0.0.1:8545."
      );
      setCurrentStep(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedStudent = students.find((s) => s._id === selectedStudentId);

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Issue Blockchain-Anchored Academic Certificate
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Cryptographically sign, calculate SHA-256 fingerprint, and commit verifiable credential to Ethereum/Hardhat smart contract.
        </p>
      </div>

      {/* Success View */}
      {issuedResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 space-y-6 shadow-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-600 rounded-2xl text-white">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Transaction Confirmed on Blockchain
              </span>
              <h2 className="text-2xl font-black text-emerald-950">
                Certificate Successfully Issued!
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-2xl border border-emerald-100 text-sm">
            <div>
              <span className="text-xs text-slate-400 block mb-0.5">Certificate ID</span>
              <span className="font-mono font-bold text-base text-blue-600">
                {issuedResult.certificate.certificateId}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block mb-0.5">Recipient Student</span>
              <span className="font-bold text-slate-900">
                {issuedResult.certificate.studentName} ({issuedResult.certificate.studentIdentifier})
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block mb-0.5">Mining Block Number</span>
              <span className="font-mono text-slate-800">
                #{issuedResult.blockchain.blockNumber}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block mb-0.5">Ethereum Transaction Hash</span>
              <span className="font-mono text-xs text-slate-700 truncate block">
                {issuedResult.blockchain.txHash}
              </span>
            </div>
            <div className="md:col-span-2">
              <span className="text-xs text-slate-400 block mb-0.5">Cryptographic SHA-256 Hash</span>
              <span className="font-mono text-xs text-emerald-700 break-all select-all font-semibold">
                {issuedResult.certificate.fileHash}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={`/api/certificates/${issuedResult.certificate.certificateId}/download`}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Official PDF with QR Code</span>
            </a>

            <Link
              to={`/verify/${issuedResult.certificate.certificateId}`}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-semibold text-sm flex items-center gap-2 transition-all"
            >
              <span>Test Public Verification</span>
              <ExternalLink className="w-4 h-4 text-blue-500" />
            </Link>

            <button
              onClick={() => {
                setIssuedResult(null);
                setCurrentStep(0);
              }}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 text-sm font-medium"
            >
              Issue Another Certificate
            </button>
          </div>
        </div>
      )}

      {/* Issuance Form */}
      {!issuedResult && (
        <form onSubmit={handleSubmit} className="space-y-8">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
              <div>
                <p className="font-bold">Issuance Failed</p>
                <p className="mt-0.5 text-xs text-rose-600">{errorMessage}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Student Details */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Users className="w-4 h-4 text-blue-600" />
                <span>1. Select Student Recipient</span>
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
                  Student Record
                </label>
                {isLoadingStudents ? (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-400 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Loading registered students...</span>
                  </div>
                ) : (
                  <select
                    value={selectedStudentId}
                    onChange={handleStudentChange}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    {students.map((stu) => (
                      <option key={stu._id} value={stu._id}>
                        {stu.name} — {stu.studentIdentifier} ({stu.department})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedStudent && (
                <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-slate-700 space-y-1.5 font-sans">
                  <div>
                    <span className="text-slate-400">Roll / ID: </span>
                    <span className="font-mono font-bold text-blue-700">
                      {selectedStudent.studentIdentifier}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Department: </span>
                    <span className="font-semibold">{selectedStudent.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Class: </span>
                    <span className="font-semibold">{selectedStudent.graduationYear}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Student Email: </span>
                    <span className="font-mono text-slate-600">{selectedStudent.email}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
                  Conferred Degree / Course Title
                </label>
                <input
                  type="text"
                  required
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
                  Issuing Academic Authority
                </label>
                <input
                  type="text"
                  required
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Right Column: PDF Mode & Anchoring */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>2. Certificate Generation & Hashing</span>
              </h2>

              {/* Mode Selection */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIssuanceMode("auto")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    issuanceMode === "auto"
                      ? "border-blue-600 bg-blue-50/50 text-blue-900 ring-2 ring-blue-500/20"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <Sparkles className="w-5 h-5 text-blue-600 mb-1" />
                  <span className="block font-bold text-sm">Auto-Generate</span>
                  <span className="text-[11px] text-slate-500 block">
                    Create official PDF with QR code automatically
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIssuanceMode("upload")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    issuanceMode === "upload"
                      ? "border-blue-600 bg-blue-50/50 text-blue-900 ring-2 ring-blue-500/20"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <FileUp className="w-5 h-5 text-indigo-600 mb-1" />
                  <span className="block font-bold text-sm">Upload Custom PDF</span>
                  <span className="text-[11px] text-slate-500 block">
                    Upload pre-signed university document
                  </span>
                </button>
              </div>

              {issuanceMode === "upload" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
                    Upload Original PDF File
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50 relative cursor-pointer hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    <FileUp className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    {uploadedFile ? (
                      <p className="text-xs font-bold text-blue-600">{uploadedFile.name}</p>
                    ) : (
                      <p className="text-xs text-slate-500">
                        Choose PDF file to compute exact SHA-256 bytes
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Blockchain info note */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Cpu className="w-4 h-4 text-emerald-600" />
                  <span>Hardhat Smart Contract: CertificateRegistry.sol</span>
                </div>
                <p>
                  Calculates a 32-byte cryptographic SHA-256 fingerprint from the exact binary bytes and permanently records it into the blockchain ledger.
                </p>
              </div>

              {/* Progress Stepper if submitting */}
              {isSubmitting && (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                    <span>Anchoring Pipeline:</span>
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  </div>
                  <div className="text-xs text-blue-700 space-y-1 font-mono">
                    <p className={currentStep >= 1 ? "font-bold text-blue-900" : "opacity-40"}>
                      ✔ 1. Computing SHA-256 binary hash
                    </p>
                    <p className={currentStep >= 2 ? "font-bold text-blue-900" : "opacity-40"}>
                      ✔ 2. Sending tx to Hardhat smart contract
                    </p>
                    <p className={currentStep >= 3 ? "font-bold text-blue-900" : "opacity-40"}>
                      ✔ 3. Awaiting mined block confirmation receipt
                    </p>
                    <p className={currentStep >= 4 ? "font-bold text-blue-900" : "opacity-40"}>
                      ✔ 4. Generating scannable QR certificate PDF
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || isLoadingStudents}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Executing Blockchain Transaction...</span>
                  </>
                ) : (
                  <>
                    <FilePlus className="w-4 h-4" />
                    <span>Issue & Anchor Certificate on Blockchain</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default IssueCertificate;
