import { NavigateFunction } from 'react-router-dom';

export const employeeNavItems = [
  { key: 'dashboard', label: 'Personal Info' },
  { key: 'visa', label: 'Visa Status' },
];

export const handleEmployeeNavClick = (navigate: NavigateFunction) => (key: string) => {
  switch (key) {
    case 'dashboard':
      navigate('/employee/dashboard');
      break;
    case 'visa':
      navigate('/employee/visa');
      break;
    default:
      break;
  }
};

export const employeePathToNavKey: Record<string, string> = {
  '/employee/dashboard': 'dashboard',
  '/employee/visa': 'visa',
};
