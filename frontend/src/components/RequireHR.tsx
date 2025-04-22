import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks';
import React from "react";

const RequireHR: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, role, authLoaded } = useAppSelector((state) => state.auth);

  if (!authLoaded) {
    return null; // or <Spinner />
  }

  if (!token || role !== 'hr') {
    return <Navigate to="/signin" />;
  }

  return <>{children}</>;
};

export default RequireHR;
