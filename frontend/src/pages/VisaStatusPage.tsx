import React from 'react';
import { useAppSelector } from '../hooks';
import MainLayout from '../components/MainLayout';
import VisaStatus from '../components/VisaStatus';
import { Typography, message } from 'antd';

const { Title } = Typography;

const VisaStatusPage: React.FC = () => {
  const userId = useAppSelector(state => state.auth.id);
  const authLoaded = useAppSelector(state => state.auth.authLoaded);

  if (!authLoaded || !userId) return null;

  return (
    <MainLayout title="Visa Status Management">
      <div style={{ padding: 40, maxWidth: 1000, margin: 'auto' }}>
        <Title level={2}>Visa Status Management</Title>
        <VisaStatus
          userId={userId}
          onNotOpt={() => message.info('Visa tracking is only required for F1 visa holders.')}
        />
      </div>
    </MainLayout>
  );
};

export default VisaStatusPage;
