// src/components/VisaStatus.tsx
import React, { useEffect, useState, ChangeEvent } from 'react';
import axios from 'axios';
import { api } from '../api';

type Status = 'Pending' | 'Approved' | 'Rejected';

interface VisaDocument {
  path: string;
  status: Status;
  feedback: string;
}

interface VisaStatusData {
  optReceipt?: VisaDocument;
  optEAD?: VisaDocument;
  i983?: VisaDocument;
  i20?: VisaDocument;
}

interface Props {
  userId: string;
  onNotOpt?: () => void; // optional callback if not OPT
}

const VisaStatus: React.FC<Props> = ({ userId, onNotOpt }) => {
  const [visa, setVisa] = useState<VisaStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  // load visa‐status on mount
  useEffect(() => {
    api.get<VisaStatusData>(`/api/visa-status/${userId}`)
      .then(res => {
        if (!res.data.optReceipt) {
          // not OPT user
          onNotOpt?.();
        } else {
          setVisa(res.data);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId, onNotOpt]);

  const upload = (stage: keyof VisaStatusData) => async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const form = new FormData();
    form.append('file', e.target.files[0]);
    try {
      await api.post(`/api/visa-status/${userId}/${stage}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // refresh
      const updated = await api.get<VisaStatusData>(`/api/visa-status/${userId}`);
      setVisa(updated.data);
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    }
  };

  if (loading)   return <p>Loading…</p>;
  if (error)     return <p className="error">Error: {error}</p>;
  if (!visa)     return <p>fail to get a visa status</p>;

  // helper to render each card
  const renderStage = (
    label: string,
    doc: VisaDocument | undefined,
    nextLabel: string,
    
    uploadHandler?: (e: ChangeEvent<HTMLInputElement>) => void
  ) => (
    <div className="visa-stage">
      <h4>{label}</h4>
      {doc ? (
        <>
          <p>Status: <strong>{doc.status}</strong></p>
          {doc.status === 'Pending' && <p>Waiting for HR to approve your {label.toLowerCase()}.</p>}
          {doc.status === 'Approved' && <p>{nextLabel}</p>}
          {doc.status === 'Rejected' && <p className="feedback">HR Feedback: {doc.feedback}</p>}
        </>
      ) : (
        <p>Not yet submitted</p>
      )}

      {/* show upload if allowed */}
      {(doc?.status === 'Approved' || !doc) && uploadHandler && (
        <input type="file" accept="application/pdf,image/*" onChange={uploadHandler} />
      )}
    </div>
  );

  return (
    <div className="visa-status-container">
      {/** 1) OPT Receipt is already in “Pending” from onboarding */}
      {renderStage(
        'OPT Receipt',
        visa.optReceipt,
        'Waiting for HR to approve your OPT Receipt',
        // since Receipt was submitted in onboarding, we typically don’t re‐upload here
        undefined
      )}

      {/** 2) OPT EAD */}
      {visa.optReceipt?.status === 'Approved' && renderStage(
        'OPT EAD',
        visa.optEAD,
        'Please download & fill out the I-983 form',
        upload('optEAD')
      )}
      {visa.optReceipt?.status !== 'Approved' && (
        <p className="hint">You must wait for OPT Receipt approval before uploading EAD.</p>
      )}

      {/** 3) I-983 */}
      {visa.optEAD?.status === 'Approved' && renderStage(
        'I-983',
        visa.i983,
        'Please upload your Form I-20',
        upload('i983')
      )}
      {visa.optEAD?.status !== 'Approved' && visa.optReceipt?.status === 'Approved' && (
        <p className="hint">You must wait for OPT EAD approval before filling out I-983.</p>
      )}

      {/** 4) I-20 */}
      {visa.i983?.status === 'Approved' && renderStage(
        'I-20',
        visa.i20,
        'All done!',
        upload('i20')
      )}
      {visa.i983?.status !== 'Approved' && visa.optEAD?.status === 'Approved' && (
        <p className="hint">You must wait for I-983 approval before uploading I-20.</p>
      )}
    </div>
  );
};

export default VisaStatus;