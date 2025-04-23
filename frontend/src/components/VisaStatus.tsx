import { useState, useEffect, ChangeEvent } from "react";

type DocStatus = "pending" | "approved" | "rejected";

interface VisaDocStatus {
  status: DocStatus;
  feedback?: string; 
}

interface VisaStatusData {
  visaType: "OPT" | string;
  receipt: VisaDocStatus;
  ead: VisaDocStatus;
  i983: VisaDocStatus;
  i20: VisaDocStatus;
}

export default function VisaStatusPage() {
  const [data, setData] = useState<VisaStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  
  useEffect(() => {
    async function fetchStatus() {
      try {
        // TODO: API for visa-status
        const res = await fetch("/api/visa-status");
        const json: VisaStatusData = await res.json();
        setData(json);
      } catch (e: any) {
        setError("Unable to load visa status.");
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, []);

  async function handleUpload(
    step: keyof Omit<VisaStatusData, "visaType">,
    file: File
  ) {
    if (!data) return;
    const form = new FormData();
    form.append("file", file);
    form.append("step", step);
    await fetch("/api/visa-upload", { method: "POST", body: form });
    setLoading(true);
    setError(null);
    const res = await fetch("/api/visa-status");
    const json: VisaStatusData = await res.json();
    setData(json);
    setLoading(false);
  }

  if (loading) return <p className="p-4">Loading…</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;
  if (data!.visaType !== "OPT") {
    return (
      <p className="p-4 text-gray-600">
        No OPT documents to manage for your visa type.
      </p>
    );
  }

  const { receipt, ead, i983, i20 } = data!;


  const canUploadEad = receipt.status === "approved";
  const canUploadI983 = ead.status === "approved";
  const canUploadI20 = i983.status === "approved";

  function StepCard(props: {
    title: string;
    status: DocStatus;
    feedback?: string;
    disabledUpload: boolean;
    onFileChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    uploadLabel: string;
    children?: React.ReactNode;
  }) {
    const { title, status, feedback, disabledUpload, onFileChange, uploadLabel, children } = props;
    const badgeColor =
      status === "approved"
        ? "bg-green-100 text-green-800"
        : status === "pending"
        ? "bg-yellow-100 text-yellow-800"
        : "bg-red-100 text-red-800";

    return (
      <div className="mb-6 p-6 border rounded shadow-sm bg-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          <span className={`px-2 py-1 rounded text-sm ${badgeColor}`}>
            {status.toUpperCase()}
          </span>
        </div>

        {/* Status‐specific message */}
        {status === "pending" && (
          <p className="mb-4 opacity-80">
            {title.includes("Receipt")
              ? "Waiting for HR to approve your OPT Receipt."
              : title.includes("EAD")
              ? "Waiting for HR to approve your OPT EAD."
              : title.includes("I-983")
              ? "Waiting for HR to approve and sign your I-983."
              : "Waiting for HR to approve your I-20."}
          </p>
        )}

        {status === "approved" && (
          <p className="mb-4 font-medium">
            {title.includes("Receipt")
              ? "Please upload a copy of your OPT EAD."
              : title.includes("EAD")
              ? "Please download and fill out the I-983 form below."
              : title.includes("I-983")
              ? "Please send the I-983 with all necessary documents to your school, then upload the new I-20."
              : "All documents have been approved!"}
          </p>
        )}

        {status === "rejected" && (
          <p className="mb-4 text-red-600">
            <strong>HR Feedback:</strong> {feedback}
          </p>
        )}

        {children}
        
        {onFileChange && (
          <div className="mt-4">
            <input
              type="file"
              accept="application/pdf"
              disabled={disabledUpload}
              onChange={onFileChange}
              className={`${
                disabledUpload
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            />
            {!disabledUpload && (
              <p className="mt-1 text-sm text-gray-500">{uploadLabel}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Visa Status Management</h1>

      {/* 1) OPT Receipt (no upload here; it was submitted in onboarding) */}
      <StepCard
        title="OPT Receipt"
        status={receipt.status}
        feedback={receipt.feedback}
        disabledUpload={true}
        uploadLabel="No upload required for OPT Receipt"
      />

      {/* 2) OPT EAD */}
      <StepCard
        title="OPT EAD"
        status={ead.status}
        feedback={ead.feedback}
        disabledUpload={!canUploadEad}
        onFileChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload("ead", file);
        }}
        uploadLabel="Upload your OPT EAD (PDF)"
      />

      {/* 3) I-983: show templates + upload */}
      <StepCard
        title="I-983"
        status={i983.status}
        feedback={i983.feedback}
        disabledUpload={!canUploadI983}
        onFileChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload("i983", file);
        }}
        uploadLabel="Upload your completed I-983 form"
      >
        <div className="flex space-x-4 mb-2">
          <a
            href="/templates/983-empty.pdf"
            download
            className="underline text-blue-600"
          >
            Download Empty Template
          </a>
          <a
            href="/templates/983-sample.pdf"
            download
            className="underline text-blue-600"
          >
            Download Sample Template
          </a>
        </div>
      </StepCard>

      {/* 4) I-20 */}
      <StepCard
        title="I-20"
        status={i20.status}
        feedback={i20.feedback}
        disabledUpload={!canUploadI20}
        onFileChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload("i20", file);
        }}
        uploadLabel="Upload your new I-20 (PDF)"
      />
    </div>
  );
}
