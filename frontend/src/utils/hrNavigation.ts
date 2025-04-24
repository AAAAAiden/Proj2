import { NavigateFunction } from 'react-router-dom';

export const hrNavItems = [
  { key: 'home', label: 'Home' },
  { key: 'profiles', label: 'Employee Profiles' },
  { key: 'visa', label: 'Visa Status Management' },
  { key: 'token', label: 'Hiring Management' },
  { key: 'review', label: 'Onboarding Review' },
];

export const handleHRNavClick = (navigate: NavigateFunction) => (key: string) => {
  switch (key) {
    case 'home':
      navigate('/hr/home');
      break;
    case 'profiles':
      navigate('/hr/profiles');
      break;
    case 'visa':
      navigate('/hr/visa');
      break;
    case 'token':
      navigate('/hr/token');
      break;
    case 'review':
      navigate('/hr/review');
      break;
    default:
      break;
  }
};

export const hrPathToNavKey: Record<string, string> = {
    '/hr/home': 'home',
    '/hr/profiles': 'profiles',
    '/hr/visa': 'visa',
    '/hr/token': 'token',
    '/hr/review': 'review',
  };