import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, message } from 'antd';
import axios from 'axios';

const { Title } = Typography;

const Register: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [tokenValid, setTokenValid] = useState<boolean | null>(null); // null = loading
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false);
        setTokenError('Missing registration token.');
        return;
      }

      try {
        const res = await axios.get(`http://localhost:5001/api/auth/check-token?token=${token}`);
        setTokenValid(true);
        form.setFieldsValue({ email: res.data.email });
      } catch (err) {
        setTokenValid(false);
        if (axios.isAxiosError(err)) {
          const msg = err.response?.data?.message || 'Failed to validate token.';
          setTokenError(msg);
        } else {
          setTokenError('Unknown error validating token.');
        }
      }
    };

    verifyToken();
  }, [token, form]);

  interface RegisterForm {
    email: string;
    username: string;
    password: string;
  }
  const onFinish = async (values: RegisterForm) => {
    try {
      await axios.post('http://localhost:5001/api/auth/register', {
        ...values,
        token,
      });
      message.success('Registration successful!');
      navigate('/signin');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      message.error('Registration failed.');
    }
  };

  if (tokenValid === null) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 500, margin: 'auto', paddingTop: 100 }}>
      <Title level={2}>Register</Title>

      {!tokenValid && (
        <div style={{ color: 'red', marginBottom: 16 }}>{tokenError}</div>
      )}

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Email" name="email" rules={[{ required: true }]}>
          <Input disabled readOnly />
        </Form.Item>
        <Form.Item label="Name" name="username" rules={[{ required: true }]}>
          <Input disabled={!tokenValid} />
        </Form.Item>
        <Form.Item label="Password" name="password" rules={[{ required: true }]}>
          <Input.Password disabled={!tokenValid} />
        </Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          disabled={!tokenValid}
        >
          Register
        </Button>
      </Form>
    </div>
  );
};

export default Register;
