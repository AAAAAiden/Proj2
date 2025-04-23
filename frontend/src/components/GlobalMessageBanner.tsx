import React from 'react';
import { useAppSelector } from '../hooks';

const GlobalMessageBanner: React.FC = () => {
  const message = useAppSelector((state) => state.auth.message);

  if (!message) return null;

  return (
    <div style={{
      backgroundColor: '#fdecea',
      color: '#a61d24',
      padding: '12px 24px',
      marginBottom: 20,
      textAlign: 'center',
      borderRadius: 4,
    }}>
      {message}
    </div>
  );
};

export default GlobalMessageBanner;