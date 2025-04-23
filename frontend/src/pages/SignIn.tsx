import React, { useState } from 'react';
import { Form, Input, Button, Typography } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../hooks';
import { setAuth, setAuthMessage } from '../store/authSlice';
import GlobalMessageBanner from '../components/GlobalMessageBanner';

const { Title } = Typography;

interface LoginForm {
  email: string;
  password: string;
}

const SignIn: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5001/api/auth/login', values);
      
      if (!data.user) {
        dispatch(setAuthMessage('User not found.'));
        return;
      }
  
      if (!data.token) {
        dispatch(setAuthMessage('Incorrect password.'));
        return;
      }

      dispatch(setAuth({ ...data.user, token: data.token, password: values.password }));
      localStorage.setItem('auth', JSON.stringify({
        ...data.user,
        token: data.token,
        password: values.password,
        message: '', 
      }));

      if (data.user.role === 'hr') {
        navigate('/hr/token');
      } else {
        navigate('/onboarding'); 
      }

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message || 'Login failed.';
        dispatch(setAuthMessage(msg));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = () => {
    dispatch(setAuthMessage('')); // Clear message on input
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', paddingTop: 100 }}>
      <Title level={2}>Sign In</Title>

      <GlobalMessageBanner />

      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item label="Email" name="email" rules={[{ required: true }]}>
          <Input onChange={handleInputChange} />
        </Form.Item>
        <Form.Item label="Password" name="password" rules={[{ required: true }]}>
          <Input.Password onChange={handleInputChange} />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={loading}>
          Sign In
        </Button>
      </Form>
    </div>
  );
};

export default SignIn;
