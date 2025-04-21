import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Typography } from 'antd';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from '../hooks';
import { setAuthMessage } from '../store/authSlice';

const { Title } = Typography;

const Register: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const messageStatus = useAppSelector((state) => state.auth.message);
  const token = new URLSearchParams(location.search).get('token');
  const [email, setEmail] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/auth/check-token?token=${token}`);
        setEmail(res.data.email);
        form.setFieldsValue({ email: res.data.email });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        if (axios.isAxiosError(err)) {
            const backendMessage = err.response?.data?.message || 'Invalid or expired registration token.';
            dispatch(setAuthMessage(` ${backendMessage}`));
          } else {
            dispatch(setAuthMessage(' Failed to validate registration token.'));
          }
          setInvalid(true);
      }
    };

    if (token) checkToken();
    else {
      setInvalid(true);
      dispatch(setAuthMessage(' No registration token provided.'));
    }
  }, [token, dispatch, form]);

  const onFinish = async (values: { name: string; email: string; password: string }) => {
    setLoading(true);
    dispatch(setAuthMessage(''));
    try {
      await axios.post('http://localhost:5001/api/auth/register', {
        ...values,
        email,
        token,
      });
      dispatch(setAuthMessage(' Registration successful! You may now log in.'));
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const backendMessage = err.response?.data?.message || 'Unknown error occurred';
        dispatch(setAuthMessage(` ${backendMessage}`));
      } else {
        dispatch(setAuthMessage(' Unexpected error occurred.'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (invalid) {
    return <Navigate to="/signin" replace />;
  }

  console.log('Current email in form:', email);
  return (
    <div style={{ maxWidth: 400, margin: 'auto', paddingTop: 80 }}>
      <Title level={2}>Register</Title>
      <Form layout="vertical" onFinish={onFinish} form={form}>
        <Form.Item label="Username" name="username" rules={[{ required: true }]}> 
          <Input />
        </Form.Item>
        <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}> 
          <Input disabled/>
        </Form.Item>
        <Form.Item label="Password" name="password" rules={[{ required: true }]}> 
          <Input.Password />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={loading}>
          Register
        </Button>
        <Button onClick={() => navigate('/signin')} block>
            Back to Sign In
        </Button>
      </Form>

      {messageStatus && (
        <div style={{ marginTop: 20, color: 'red', textAlign: 'center' }}>
          {messageStatus}
        </div>
      )}
    </div>
  );
};

export default Register;