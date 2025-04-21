import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks';
import { JSX } from "react";

const RequireHR = ({ children }: { children: JSX.Element }) => {
  const role = useAppSelector((state) => state.auth.role);
  return role === 'hr' ? children : <Navigate to="/signin" replace />;
};

export default RequireHR;
