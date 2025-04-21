import React from 'react';
import { Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Oops: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', paddingTop: 120 }}>
      <Title level={1}>Oops!</Title>
      <Text>This page doesn't exist or the URL is incorrect.</Text>
      <br />
      <Button type="primary" onClick={() => navigate('/signin')} style={{ marginTop: 24 }}>
        Go Back to Sign In
      </Button>
    </div>
  );
};

export default Oops;
