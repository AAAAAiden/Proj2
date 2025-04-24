import React from 'react';
import { Spin } from 'antd';
import PersonalInfoForm from './PersonalInfoForm';
import { PersonalInfo } from '../types';

interface Props {
  info: PersonalInfo | null;
  onUpdate: (data: PersonalInfo) => void;
}

const EmployeeDashboardRoute: React.FC<Props> = ({ info, onUpdate }) => {
  if (!info) return <Spin style={{ marginTop: 40 }} />;
  return <PersonalInfoForm initialData={info} onSubmit={onUpdate} />;
};

export default EmployeeDashboardRoute;
