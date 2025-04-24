import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Select, Input, Button, Spin } from 'antd';
import axios from 'axios';
import { useAppSelector, useAppDispatch } from '../../hooks';
import MainLayout from '../../components/MainLayout';
import { hrNavItems, handleHRNavClick, hrPathToNavKey } from '../../utils/hrNavigation';
import { setAuth, setAuthMessage } from '../../store/authSlice';
import GlobalMessageBanner from '../../components/GlobalMessageBanner';

const { Title, Text } = Typography;
const { Option } = Select;

type VisaDocumentKey = 'optReceipt' | 'optEAD' | 'i983' | 'i20';

interface VisaDocument {
  path: string;
  status: 'Not Submitted' | 'Pending' | 'Approved' | 'Rejected';
  feedback: string;
}

interface VisaStatus {
  userId: string;
  optReceipt?: VisaDocument;
  optEAD?: VisaDocument;
  i983?: VisaDocument;
  i20?: VisaDocument;
}

const VisaReviewDetailPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const token = useAppSelector((state) => state.auth.token);
  const [visa, setVisa] = useState<VisaStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [actionTypes, setActionTypes] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const selectedKey = hrPathToNavKey[location.pathname] || '';
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchVisa = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/hr/visa-status/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('visa:', res.data);
        setVisa(res.data);
      } catch {
        dispatch(setAuthMessage('Failed to load visa data'));
      } finally {
        setLoading(false);
      }
    };

    fetchVisa();
  }, [token, userId]);

  const handleReview = async (docType: VisaDocumentKey) => {
    const action = actionTypes[docType];
    const feedback = feedbacks[docType];

    if (!action) {
      dispatch(setAuthMessage('Please select an action'));
      return;
    }

    try {
      await axios.put(
        `http://localhost:5001/api/hr/visa-status/review`,
        {
          userId,
          docType,
          action,
          feedback,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      dispatch(setAuthMessage(`${docType} ${action}d`));
      setTimeout(() => {
        navigate('/hr/visa', { state: { refresh: true } });
      }, 2000);
    } catch {
      dispatch(setAuthMessage('Review failed'));
    }
  };

  const renderDocumentSection = (docType: VisaDocumentKey, doc?: VisaDocument) => {
    if (!doc) return null;

    const isDisabled = doc.status !== 'Pending';

    return (
      <Card key={docType} title={docType} style={{ marginBottom: 24 }}>
        <Text>Status: </Text>
        <Text strong>{doc.status}</Text>
        {doc.path && (
        <>
            <a
            href={`http://localhost:5001/${doc.path}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginRight: 12 }}
            >
            <Button>Preview</Button>
            </a>
            <a
            href={`http://localhost:5001/${doc.path}`}
            download
            >
            <Button>Download</Button>
            </a>
        </>
        )}
        <div style={{ marginTop: 8 }}>
          <Select
            placeholder="Approve / Reject"
            disabled={isDisabled}
            onChange={(value) =>{
              setActionTypes((prev) => ({ ...prev, [docType]: value }))
            }}
            style={{ width: 160, marginRight: 12 }}
          >
            <Option value="approve">Approve</Option>
            <Option value="reject">Reject</Option>
          </Select>
          <Input.TextArea
            placeholder="Optional feedback"
            disabled={isDisabled}
            style={{ width: 300, marginRight: 12 }}
            rows={1}
            onChange={(e) =>
              setFeedbacks((prev) => ({ ...prev, [docType]: e.target.value }))
            }
          />
          <Button type="primary" disabled={isDisabled} onClick={() => handleReview(docType)}>
            Submit
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <MainLayout
      title="HR Home Page"
      navItems={hrNavItems}
      selectedKey={selectedKey}
      onNavClick={handleHRNavClick(navigate)}
    >
      <div style={{ padding: 24 }}>
        <GlobalMessageBanner />
        <Title level={3}>Visa Document Review - Detail</Title>
        {loading ? (
          <Spin />
        ) : visa ? (
          <>
            {renderDocumentSection('optReceipt', visa.optReceipt)}
            {renderDocumentSection('optEAD', visa.optEAD)}
            {renderDocumentSection('i983', visa.i983)}
            {renderDocumentSection('i20', visa.i20)}
          </>
        ) : (
          <Text>No visa data found.</Text>
        )}
      </div>
    </MainLayout>
  );
};

export default VisaReviewDetailPage;
