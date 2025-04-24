import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Button, Input, Form, Spin, Collapse, Row, Col } from 'antd';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setAuthMessage } from '../../store/authSlice';
import GlobalMessageBanner from '../../components/GlobalMessageBanner';

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

interface ApplicationDetails {
  fullName: string;
  email: string;
  address: string;
  phone: string;
  ssn: string;
  dob: string;
  gender: string;
  workAuth: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  emergency: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    relationship: string;
  };
  references: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
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
        headers: { Authorization: `Bearer ${token}` },
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
        headers: { Authorization: `Bearer ${token}` },
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
        const res = await axios.get(`http://localhost:5001/api/hr/hiring/application/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("References:", res.data.formData?.references);
        const raw = res.data;
        const form = raw.formData;

        setApplication({
          fullName: form.name.preferredName || `${form.name.firstName} ${form.name.lastName}`,
          email: form.name.email,
          address: `${form.address.building} ${form.address.street}, ${form.address.city}, ${form.address.state} ${form.address.zip}`,
          phone: form.contact.cell,
          ssn: form.name.ssn,
          dob: form.name.dob,
          gender: form.name.gender,
          workAuth: form.employment.visaTitle,
          status: raw.status.toLowerCase(),
          feedback: raw.feedback || '',
          emergency: form.emergency,
          references: form.references || [],
          documents: form.documents || [],
          immigration: form.immigration || undefined,
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
      await axios.put(`http://localhost:5001/api/hr/hiring/application/approve`, { userId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch(setAuthMessage('Application approved'));
      setTimeout(() => window.location.href = '/hr/review', 1000);
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
      await axios.put(`http://localhost:5001/api/hr/hiring/application/reject`, { userId, feedback }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch(setAuthMessage('Application rejected'));
      setTimeout(() => window.location.href = '/hr/review', 1000);
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
      <Collapse defaultActiveKey={['1']}>
        <Panel header="Name & Contact" key="1">
          <Paragraph><b>First Name:</b> {application.fullName.split(' ')[0]}</Paragraph>
          <Paragraph><b>Last Name:</b> {application.fullName.split(' ')[1]}</Paragraph>
          <Paragraph><b>Preferred Name:</b> {application.fullName}</Paragraph>
          <Paragraph><b>Cell Phone:</b> {application.phone}</Paragraph>
          <Paragraph><b>Work Phone:</b> - </Paragraph>
          <Paragraph><b>Email:</b> {application.email}</Paragraph>
        </Panel>
        <Panel header="Address" key="2">
          <Paragraph>{application.address}</Paragraph>
        </Panel>
        <Panel header="Personal Info" key="3">
          <Paragraph><b>SSN:</b> {application.ssn}</Paragraph>
          <Paragraph><b>Date of Birth:</b> {application.dob}</Paragraph>
          <Paragraph><b>Gender:</b> {application.gender}</Paragraph>
        </Panel>
        <Panel header="U.S. Status & Work Authorization" key="4">
          <Paragraph>
            <b>Is U.S. Resident:</b> {application.immigration?.isUSResident ? 'Yes' : 'No'}
          </Paragraph>
          {application.immigration?.isUSResident ? (
            <Paragraph><b>Resident Status:</b> {application.immigration.residentStatus || 'N/A'}</Paragraph>
          ) : (
            <>
              <Paragraph><b>Work Auth Type:</b> {application.immigration?.workAuthType}</Paragraph>
              {application.immigration?.workAuthType === 'Other' && (
                <Paragraph><b>Other Visa Title:</b> {application.immigration.otherVisaTitle}</Paragraph>
              )}
            </>
          )}
        </Panel>
        <Panel header="References" key="5">
            <Paragraph><b>First Name:</b> {application.references.firstName}</Paragraph>
            <Paragraph><b>Last Name:</b> {application.references.lastName}</Paragraph>
            <Paragraph><b>Phone:</b> {application.references.phone}</Paragraph>
            <Paragraph><b>Email:</b> {application.references.email}</Paragraph>
            <Paragraph><b>Relationship:</b> {application.references.relationship}</Paragraph>
        </Panel>
        <Panel header="Emergency Contact" key="6">
            <Paragraph><b>First Name:</b> {application.emergency.firstName}</Paragraph>
            <Paragraph><b>Last Name:</b> {application.emergency.lastName}</Paragraph>
            <Paragraph><b>Phone:</b> {application.emergency.phone}</Paragraph>
            <Paragraph><b>Email:</b> {application.emergency.email}</Paragraph>
            <Paragraph><b>Relationship:</b> {application.emergency.relationship}</Paragraph>
        </Panel>
        <Panel header="Documents" key="6">
          {['profile_picture', 'driver_license', 'work_auth'].map((category) => (
            <div key={category} style={{ marginBottom: '20px' }}>
              <Paragraph strong style={{ marginBottom: 4 }}>
                {category.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </Paragraph>
              {application.documents
                .filter((doc) => doc.type === category)
                .map((doc) => (
                  <Paragraph key={doc.id}>
                    {doc.name} —
                    <Button type="link" onClick={() => previewDocument(doc.id)}>Preview</Button>
                    <Button type="link" onClick={() => downloadDocument(doc.id, doc.name)}>Download</Button>
                  </Paragraph>
                ))}
            </div>
          ))}
        </Panel>
      </Collapse>
      {application.status === 'pending' && (
        <Form layout="vertical">
          <Form.Item label="Feedback (required if rejecting)">
            <Input.TextArea rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleApprove} style={{ marginRight: 8 }} loading={submitting}>
              Approve
            </Button>
            <Button danger onClick={handleReject} loading={submitting}>
              Reject
            </Button>
          </Form.Item>
        </Form>
      )}

      {(application.status === 'approved' || application.status === 'rejected') && (
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Button type="default" onClick={() => window.location.href = '/hr/review'}>
            Return to Review Page
          </Button>
        </div>
      )}

    </div>
  );
};

export default ViewApplication;