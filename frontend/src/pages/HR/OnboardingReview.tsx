import React, { useEffect, useState } from 'react';
import { Typography, Card, Button, Tabs, Spin } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setAuthMessage } from '../../store/authSlice';
import GlobalMessageBanner from '../../components/GlobalMessageBanner';

const { Title } = Typography;
const { TabPane } = Tabs;

interface Application {
  userId: string;
  fullName: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
}

const OnboardingReview: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [apps, setApps] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'rejected' | 'approved'>('pending');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const fetchApplications = async (status: 'pending' | 'rejected' | 'approved') => {
    setLoading(true);
    try {
        const res = await axios.get(`http://localhost:5001/api/hr/hiring/applications/${status}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      
        setApps(res.data);
      
        if (res.data.length === 0) {
          dispatch(setAuthMessage(`No ${status} onboarding applications found.`));
        } else {
          dispatch(setAuthMessage(''));
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        dispatch(setAuthMessage('Failed to load onboarding applications.'));
      } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(activeTab);
  }, [activeTab]);

  const handleView = (userId: string) => {
    window.open(`/hr/view-application/${userId}`, '_blank');
  };

  return (
    <div style={{ padding: '40px' }}>
      <Title level={2}>Onboarding Applications</Title>
      <GlobalMessageBanner />
      <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key as any)}>
        {(['pending', 'rejected', 'approved'] as const).map((status) => (
          <TabPane tab={status.charAt(0).toUpperCase() + status.slice(1)} key={status}>
            {loading ? (
              <Spin />
            ) : apps.length === 0 ? (
              <p>No applications.</p>
            ) : (
              apps.map((app) => (
                <Card key={app.userId} style={{ marginBottom: '16px' }}>
                  <p><b>Name:</b> {app.fullName}</p>
                  <p><b>Email:</b> {app.email}</p>
                  <Button onClick={() => handleView(app.userId)}>View Application</Button>
                </Card>
              ))
            )}
          </TabPane>
        ))}
      </Tabs>
    </div>
  );
};

export default OnboardingReview;