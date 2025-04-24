import React, { useEffect, useState } from 'react';
import { Table, Typography, Spin } from 'antd';
import { useAppSelector } from '../../hooks';
import axios from 'axios';
import MainLayout from '../../components/MainLayout';
import { useNavigate, useLocation } from 'react-router-dom';
import { hrNavItems, handleHRNavClick, hrPathToNavKey } from '../../utils/hrNavigation';

const { Title } = Typography;

interface EmployeeVisaSummary {
  userId: string;
  name: string;
  email: string;
  visaStage: string; 
}

const VisaStatusSummaryPage: React.FC = () => {
  const [data, setData] = useState<EmployeeVisaSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const token = useAppSelector((state) => state.auth.token);
  const navigate = useNavigate();
  const location = useLocation();
  const selectedKey = hrPathToNavKey[location.pathname] || '';
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  useEffect(() => {
    if (location.state?.refresh) {
      setRefreshTrigger(prev => prev + 1);
    }
  }, [location.state]);
  
  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/hr/visa-summary', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setData(res.data);
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchSummaries();
  }, [token, refreshTrigger]);

  const columns = [
    {
      title: 'Employee Name',
      dataIndex: 'name',
      render: (_: any, record: EmployeeVisaSummary) => (
        <a onClick={() => navigate(`/hr/visa-review/${record.userId}`)}>{record.name}</a>
      ),
    },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Visa Status', dataIndex: 'visaStage' },
  ];

  return (
    < MainLayout
    title="HR Home Page"
    navItems={hrNavItems}
    selectedKey={selectedKey}
    onNavClick={handleHRNavClick(navigate)} >

    <div style={{ padding: 24 }}>
      <Title level={3}>Visa Review Summary</Title>
      {loading ? <Spin /> : <Table rowKey="userId" columns={columns} dataSource={data} />}
    </div>
    </MainLayout>
  );
};

export default VisaStatusSummaryPage;
