import React, { ChangeEvent, useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks';
import { useNavigate } from 'react-router-dom';
import { Collapse, Typography, Tag } from 'antd';
import PersonalInfoForm from '../components/PersonalInfoForm';
import { PersonalInfo } from '../types';
import axios from 'axios';
import { setForm } from '../store/onboardingSlice.ts';
import GlobalMessageBanner from '../components/GlobalMessageBanner';
import { setAuthMessage } from '../store/authSlice';
import { ImmigrationInfo }  from '../types';
import MainLayout from '../components/MainLayout';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const OnboardingPage: React.FC = () => {
  const username = useAppSelector((state) => state.auth.username);
  const userId = useAppSelector((state) => state.auth.id);
  const role = useAppSelector((state) => state.auth.role);
  const token = useAppSelector((state) => state.auth.token);
  const authLoaded = useAppSelector((state) => state.auth.authLoaded);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState<'never submitted' | 'pending' | 'approved' | 'rejected'>('never submitted');
  const [initialData, setInitialData] = useState<PersonalInfo>({
    name: {
      firstName: '',
      middleName: '',
      lastName: '',
      preferredName: '',
      profilePicUrl: '',
      email: '',
      ssn: '',
      dob: '',
      gender: '',
    },
    address: {
      building: '',
      street: '',
      city: '',
      state: '',
      zip: '',
    },
    contact: {
      cell: '',
      work: '',
    },
    employment: {
      visaTitle: '',
      startDate: '',
      endDate: '',
    },
    emergency: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      relationship: '',
    },
    documents: [],
    immigration: {
      isUSResident: false,
      residentStatus: undefined,
      workAuthType: undefined,
      otherVisaTitle: '',
      optReceiptUrl: '',
      authStartDate: '',
      authEndDate: '',
    }
  });

  
  useEffect(() => {
    if (!authLoaded) return;
    if (role !== 'employee') {
      navigate('/signin');
      return;
    }

    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/onboarding/status', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStatus(res.data.status);
        if (res.data.data) {
          setInitialData({
            ...initialData,
            ...res.data.data,
            immigration: {
              ...initialData.immigration,
              ...(res.data.data.immigration || {}),
            },
          });
        }
        if (res.data.feedback) {
          setFeedback(res.data.feedback);
        }
      } catch (err) {
        console.error('Error fetching onboarding info:', err);
        dispatch(setAuthMessage('Failed to fetch onboarding data.'));
      }
    };

    fetchData();
  }, [authLoaded, role, token, navigate, dispatch]);




  const handleSubmit = async (data: PersonalInfo) => {
    try {
      const url =
        status === 'rejected'
          ? 'http://localhost:5001/api/onboarding/update'
          : 'http://localhost:5001/api/onboarding/submit';
  
      await axios({
        method: status === 'rejected' ? 'put' : 'post',
        url,
        data: {
          userId: userId,
          formData: data,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
  
      dispatch(setForm(data));
      setStatus('pending');
      dispatch(setAuthMessage('Onboarding form submitted successfully!'));
    } catch (err) {
      console.error('Submit error:', err);
      dispatch(setAuthMessage('Failed to submit onboarding form.'));
    }
  };

  return (
    <MainLayout title="Onboarding Application">
    <div className="p-6 max-w-6xl mx-auto">
      <Title level={3}>Applicant: {username}</Title>
      <GlobalMessageBanner />
      <div className="mb-4">
        <Text strong>Status: </Text>
        <Tag
          color={
            status === 'never submitted'
              ? 'gray'
              : status === 'pending'
              ? 'orange'
              : status === 'rejected'
              ? 'red'
              : 'green'
          }
        >
          {status}
        </Tag>
        {status === 'rejected' && feedback && (
          <div style={{ marginTop: 16, padding: 12, background: '#fff1f0', border: '1px solid #ffa39e', borderRadius: 4 }}>
            <b>Feedback:</b> {feedback}
          </div>
        )}
      </div>

      <Collapse defaultActiveKey={['1']}>
        <Panel header="Onboarding Application" key="1">
          <PersonalInfoForm initialData={initialData} onSubmit={handleSubmit} disabled={status === 'pending' || status === 'approved'} />
        </Panel>
      </Collapse>

      {status === 'approved' && (
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/employee')}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Go to Employee Dashboard
          </button>
        </div>
      )}
    </div>
    </MainLayout>
  );
};

export default OnboardingPage;

