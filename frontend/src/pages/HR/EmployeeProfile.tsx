import React, { useEffect, useState, useCallback } from 'react';
import { Input, Table, Typography, Spin } from 'antd';
import axios from 'axios';
import { debounce } from 'lodash';
import { useAppSelector } from '../../hooks';
import { ColumnsType } from 'antd/es/table';
import MainLayout from '../../components/MainLayout';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { hrNavItems, handleHRNavClick, hrPathToNavKey } from '../../utils/hrNavigation';

const { Title } = Typography;

interface EmployeeSummary {
  _id: string;
  name: {
    firstName: string;
    lastName: string;
    preferredName: string;
  };
  contact: {
    cell: string;
    work: string;
  };
  employment: {
    visaTitle: string;
  };
  email: string;
  ssn: string;
}

const EmployeeProfilesPage: React.FC = () => {
  const token = useAppSelector(state => state.auth.token);
  const [employees, setEmployees] = useState<EmployeeSummary[]>([]);
  const [filtered, setFiltered] = useState<EmployeeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const selectedKey = hrPathToNavKey[location.pathname] || '';
  
  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/hr/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sorted = res.data.sort((a: EmployeeSummary, b: EmployeeSummary) =>
        a.name.lastName.localeCompare(b.name.lastName)
      );
      console.log('Fetched employees:', res.data);
      setEmployees(sorted);
      setFiltered(sorted);
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [token]);

  const handleSearch = useCallback(
    debounce((value: string) => {
      const lower = value.toLowerCase();
      setFiltered(
        employees.filter(emp =>
          [emp.name.firstName, emp.name.lastName, emp.name.preferredName].some(name =>
            name.toLowerCase().includes(lower)
          )
        )
      );
    }, 300),
    [employees]
  );

  const columns: ColumnsType<EmployeeSummary> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.lastName.localeCompare(b.name.lastName),
      render: (_, record) => (
        <a href={`/hr/profile/${record._id}`} target="_blank" rel="noopener noreferrer">
          {`${record.name.firstName} ${record.name.lastName}`}
        </a>
      )
    },
    { title: 'SSN', dataIndex: 'ssn', key: 'ssn' },
    { title: 'Work Auth', dataIndex: ['employment', 'visaTitle'], key: 'visaTitle' },
    { title: 'Phone', dataIndex: ['contact', 'cell'], key: 'phone' },
    { title: 'Email', dataIndex: 'email', key: 'email' }
  ];

  return (
    < MainLayout
    title="HR Home Page"
    navItems={hrNavItems}
    selectedKey={selectedKey}
    onNavClick={handleHRNavClick(navigate)} >

    <div style={{ padding: '40px', maxWidth: 1400, margin: 'auto' }} aria-label="Employee Profiles">
      <Title level={2}>Employee Profiles</Title>
      <Input.Search
        placeholder="Search by first, last, or preferred name"
        allowClear
        onChange={e => handleSearch(e.target.value)}
        style={{ marginBottom: 24, width: 400 }}
      />
      {loading ? (
        <Spin />
      ) : (
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'No employees found.' }}
        />
      )}
    </div>
    </MainLayout>
  );
};

export default EmployeeProfilesPage;
