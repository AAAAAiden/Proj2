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
    }[];
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
            {application.documents.map((doc) => (
            <Paragraph key={doc.id}>
                {doc.name} — 
                <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8 }}>
                Preview
                </a> | 
                <a href={doc.url} download style={{ marginLeft: 8 }}>
                Download
                </a>
            </Paragraph>
            ))}
        </>
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
