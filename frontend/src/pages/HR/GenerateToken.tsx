import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Typography, Table } from 'antd';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setAuthMessage } from '../../store/authSlice';
import GlobalMessageBanner from '../../components/GlobalMessageBanner';

const { Title } = Typography;

interface TokenRecord {
  name: string;
  email: string;
  token: string;
  status: string;
  createdAt: string;
  registrationLink: string;
}

const GenerateToken: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<TokenRecord[]>([]);
  const token = useAppSelector((state) => state.auth.token);
  const dispatch = useAppDispatch();

  const fetchHistory = async () => {
    try {
      const res = await axios.get<TokenRecord[]>(
        'http://localhost:5001/api/hr/hiring/token',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setHistory(res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data;
        const backendMessage =
          typeof errorData === 'string'
            ? errorData
            : errorData?.message || 'Unknown error occurred';

        console.error('Fetch token history error:', backendMessage);
        dispatch(setAuthMessage(backendMessage));
      } else {
        console.error('Unexpected error:', err);
        dispatch(setAuthMessage('Unexpected error occurred.'));
      }
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onFinish = async (values: { name: string; email: string }) => {
    setLoading(true);
    dispatch(setAuthMessage(''));
    try {
      await axios.post(
        'http://localhost:5001/api/hr/hiring/token',
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(setAuthMessage('Registration token sent successfully!'));
      fetchHistory();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const backendMessage = err.response?.data?.message || 'Unknown error occurred';
        dispatch(setAuthMessage(`${backendMessage}`));
      } else {
        dispatch(setAuthMessage('Unexpected error occurred.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Registration Link',
      dataIndex: 'registrationLink',
      key: 'registrationLink',
      render: (link: string) => (
        <a href={link} target="_blank" rel="noopener noreferrer">
          {link}
        </a>
      ),
    },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt' },
  ];

  return (
    <div style={{ maxWidth: 700, margin: 'auto', paddingTop: 80 }}>
      <Title level={2}>Generate Registration Token</Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item label="Employee Name" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Employee Email" name="email" rules={[{ required: true, type: 'email' }]}>
          <Input />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Generate Token and Send Email
        </Button>
      </Form>

      <GlobalMessageBanner />

      <Title level={4} style={{ marginTop: 40 }}>Token History</Title>
      <Table
        columns={columns}
        dataSource={history}
        rowKey={(record) => record.token}
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

export default GenerateToken;
