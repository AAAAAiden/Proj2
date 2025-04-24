import React, { useEffect, useState, ChangeEvent } from 'react';
import axios from 'axios';
import { api } from '../api';
import { useAppSelector } from '../hooks';

type Status = 'Not Submitted' | 'Pending' | 'Approved' | 'Rejected';

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
  onNotOpt?: () => void;
}

const VisaStatus: React.FC<Props> = ({ userId, onNotOpt }) => {
  const [visa, setVisa] = useState<VisaStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const token = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    api.get<VisaStatusData>(`/api/visa-status/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.data.optReceipt) {
          onNotOpt?.();
        } else {
          setVisa(res.data);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId, onNotOpt, token]);

  const upload = (stage: keyof VisaStatusData) => async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const form = new FormData();
    form.append('file', e.target.files[0]);
    form.append('userId', userId);

    try {
      console.log(`http://localhost:5001/api/visa-status/upload/${stage}`);
      await api.post(`http://localhost:5001/api/visa-status/upload/${stage}`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Refresh status after upload
      const updated = await api.get<VisaStatusData>(`/api/visa-status/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVisa(updated.data);
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    }
  };

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="error">Error: {error}</p>;
  if (!visa) return <p>fail to get a visa status</p>;

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
          {doc.status === 'Not Submitted' && <p>Please upload your {label.toLowerCase()} to begin.</p>}
          {doc.status === 'Pending' && <p>Waiting for HR to approve your {label.toLowerCase()}.</p>}
          {doc.status === 'Approved' && <p>{nextLabel}</p>}
          {doc.status === 'Rejected' && <p className="feedback">HR Feedback: {doc.feedback}</p>}
        </>
      ) : (
        <p>Not yet submitted</p>
      )}

      {uploadHandler && (
        (!doc || doc.status === 'Not Submitted' || doc.status === 'Rejected') && (
          <input type="file" accept="application/pdf,image/*" onChange={uploadHandler} />
        )
      )}
    </div>
  );

  return (
    <div className="visa-status-container">
      {renderStage(
        'OPT Receipt',
        visa.optReceipt,
        visa.optReceipt?.status === 'Approved'
          ? 'Approved by HR'
          : 'Waiting for HR to approve your OPT Receipt',
        upload('optReceipt')
      )}

      {visa.optReceipt?.status === 'Approved' && renderStage(
        'OPT EAD',
        visa.optEAD,
        visa.optEAD?.status === 'Approved'
        ? 'Approved by HR'
        : 'Waiting for HR to approve your OPT EAD',
        upload('optEAD')
      )}
      {visa.optReceipt?.status !== 'Approved' && (
        <p className="hint">You must wait for OPT Receipt approval before uploading EAD.</p>
      )}

      {visa.optEAD?.status === 'Approved' && renderStage(
        'I-983',
        visa.i983,
        visa.i983?.status === 'Approved'
        ? 'Approved by HR'
        : 'Waiting for HR to approve your I983',
        upload('i983')
      )}
      {visa.optEAD?.status !== 'Approved' && visa.optReceipt?.status === 'Approved' && (
        <p className="hint">You must wait for OPT EAD approval before filling out I-983.</p>
      )}

      {visa.i983?.status === 'Approved' && renderStage(
        'I-20',
        visa.i20,
        visa.i20?.status === 'Approved'
        ? 'All done!'
        : 'Waiting for HR to approve your I20',
        upload('i20')
      )}
      {visa.i983?.status !== 'Approved' && visa.optEAD?.status === 'Approved' && (
        <p className="hint">You must wait for I-983 approval before uploading I-20.</p>
      )}
    </div>
  );
};

export default VisaStatus;
