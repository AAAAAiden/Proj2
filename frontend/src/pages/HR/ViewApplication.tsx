import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Button, Input, Form, Spin } from 'antd';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setAuthMessage } from '../../store/authSlice';
import GlobalMessageBanner from '../../components/GlobalMessageBanner';

const { Title, Paragraph } = Typography;

interface ApplicationDetails {
    fullName: string;
    email: string;
    address: string;
    phone: string;
    workAuth: string;
    status: 'pending' | 'approved' | 'rejected';
    feedback?: string;
    emergency: {
      fullName: string;
      email: string;
      phone: string;
      relationship: string;
    };
    documents: {
      id: string;
      name: string;
      url: string;
      type: string;
    }[];
    immigration?: {
      isUSResident: boolean;
      residentStatus?: string;
      workAuthType?: string;
      otherVisaTitle?: string;
      optReceiptUrl?: string;
      authStartDate?: string;
      authEndDate?: string;
    };
  }

const ViewApplication: React.FC = () => {
  const { userId } = useParams();
  const [application, setApplication] = useState<ApplicationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const authLoaded = useAppSelector((state) => state.auth.authLoaded);
  
  const previewDocument = async (docId: string) => {
    try {
      const res = await axios.get(`http://localhost:5001/api/documents/preview/${docId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });
      const blobUrl = window.URL.createObjectURL(res.data);
      window.open(blobUrl, '_blank');
    } catch (err) {
      console.error('Preview failed', err);
      dispatch(setAuthMessage('Failed to preview document'));
    }
  };
  
  const downloadDocument = async (docId: string, filename: string) => {
    try {
      const res = await axios.get(`http://localhost:5001/api/documents/download/${docId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download failed', err);
      dispatch(setAuthMessage('Failed to download document'));
    }
  };


  useEffect(() => {
    dispatch(setAuthMessage(''));  
  }, [dispatch]);

  useEffect(() => {
    if (!authLoaded || !token || !userId) return;

    const fetchApplication = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5001/api/hr/hiring/application/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const raw = res.data;

        setApplication({
            fullName: raw.formData.name.preferredName || `${raw.formData.name.firstName} ${raw.formData.name.lastName}`,
            email: raw.formData.name.email,
            address: `${raw.formData.address.building} ${raw.formData.address.street}, ${raw.formData.address.city}, ${raw.formData.address.state} ${raw.formData.address.zip}`,
            phone: raw.formData.contact.cell,
            workAuth: raw.formData.employment.visaTitle,
            status: raw.status.toLowerCase(),
            feedback: raw.feedback || '',
            emergency: {
              fullName: `${raw.formData.emergency.firstName} ${raw.formData.emergency.lastName}`,
              email: raw.formData.emergency.email,
              phone: raw.formData.emergency.phone,
              relationship: raw.formData.emergency.relationship,
            },
            documents: raw.formData.documents || [],
            immigration: raw.formData.immigration || undefined,
          });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        dispatch(setAuthMessage('Failed to load application'));
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [authLoaded, token, userId, dispatch]);

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await axios.put(
        `http://localhost:5001/api/hr/hiring/application/approve`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(setAuthMessage('Application approved'));
      setTimeout(() => window.close(), 1000);
    } catch {
      dispatch(setAuthMessage('Failed to approve application'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!feedback.trim()) {
      dispatch(setAuthMessage('Please provide feedback when rejecting.'));
      return;
    }

    setSubmitting(true);
    try {
      await axios.put(
        `http://localhost:5001/api/hr/hiring/application/reject`,
        { userId, feedback },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(setAuthMessage('Application rejected'));
      setTimeout(() => window.close(), 1000);
    } catch {
      dispatch(setAuthMessage('Failed to reject application'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!authLoaded) return null;
  if (loading) return <Spin style={{ marginTop: '40px' }} />;
  if (!application) return <div style={{ marginTop: '40px', textAlign: 'center' }}>Application not found or failed to load.</div>;

  return (
    <div style={{ padding: '40px', maxWidth: 700, margin: 'auto' }}>
      <Title level={2}>Onboarding Application</Title>
      <GlobalMessageBanner />
      <Paragraph><b>Name:</b> {application.fullName}</Paragraph>
      <Paragraph><b>Email:</b> {application.email}</Paragraph>
      <Paragraph><b>Address:</b> {application.address}</Paragraph>
      <Paragraph><b>Phone:</b> {application.phone}</Paragraph>
      <Paragraph><b>Work Authorization:</b> {application.workAuth}</Paragraph>

      <Title level={4}>Emergency Contact</Title>
        <Paragraph><b>Name:</b> {application.emergency.fullName}</Paragraph>
        <Paragraph><b>Email:</b> {application.emergency.email}</Paragraph>
        <Paragraph><b>Phone:</b> {application.emergency.phone}</Paragraph>
        <Paragraph><b>Relationship:</b> {application.emergency.relationship}</Paragraph>

        {application.documents.length > 0 && (
        <>
            <Title level={4}>Uploaded Documents</Title>
            {['profile_picture', 'driver_license', 'work_auth'].map((category) => (
            <div key={category} style={{ marginBottom: '20px' }}>
                <Paragraph strong style={{ marginBottom: 4 }}>
                {category.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </Paragraph>
                {application.documents
                .filter(doc => doc.type === category)
                .map((doc) => (
                    <Paragraph key={doc.id}>
                    {doc.name} —
                    <button
                        onClick={() => previewDocument(doc.id)}
                        className="text-blue-600 underline bg-none border-none cursor-pointer ml-2"
                    >
                        Preview
                    </button>
                    |
                    <button
                        onClick={() => downloadDocument(doc.id, doc.name)}
                        className="text-blue-600 underline bg-none border-none cursor-pointer ml-2"
                    >
                        Download
                    </button>
                    </Paragraph>
                ))}
            </div>
            ))}
        </>
        )}

        
        {application.immigration && (
        <>
            <Title level={4}>U.S. Status & Work Authorization</Title>
            <Paragraph>
            <b>Is U.S. Resident:</b> {application.immigration.isUSResident ? 'Yes' : 'No'}
            </Paragraph>
            {application.immigration.isUSResident ? (
            <Paragraph>
                <b>Resident Status:</b> {application.immigration.residentStatus || 'N/A'}
            </Paragraph>
            ) : (
            <>
                <Paragraph>
                <b>Work Auth Type:</b> {application.immigration.workAuthType}
                </Paragraph>
                {application.immigration.workAuthType === 'Other' && (
                <Paragraph>
                    <b>Other Visa Title:</b> {application.immigration.otherVisaTitle}
                </Paragraph>
                )}
                {application.immigration.workAuthType === 'F1' && application.immigration.optReceiptUrl && (
                <Paragraph>
                    <b>OPT Receipt:</b>{' '}
                    <a href={application.immigration.optReceiptUrl} target="_blank" rel="noopener noreferrer">
                    Preview
                    </a>
                </Paragraph>
                )}
                <Paragraph>
                <b>Auth Start Date:</b> {application.immigration.authStartDate || 'N/A'}
                </Paragraph>
                <Paragraph>
                <b>Auth End Date:</b> {application.immigration.authEndDate || 'N/A'}
                </Paragraph>
            </>
            )}
        </>
        )}

      {application.status === 'approved' && (
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Button type="default" onClick={() => window.location.href = '/hr/review'}>
            Return to Review Page
            </Button>
        </div>
      )}

      {application.status === 'rejected' && application.feedback && (
        <Paragraph><b>Feedback:</b> {application.feedback}</Paragraph>
      )}

      {application.status === 'pending' && (
        <Form layout="vertical">
          <Form.Item label="Feedback (if rejecting)">
            <Input.TextArea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              onClick={handleApprove}
              style={{ marginRight: 8 }}
              loading={submitting}
            >
              Approve
            </Button>
            <Button
              danger
              onClick={handleReject}
              loading={submitting}
            >
              Reject
            </Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

export default ViewApplication;
