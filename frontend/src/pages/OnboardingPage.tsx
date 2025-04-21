import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks';
import { useNavigate } from 'react-router-dom';
import { Collapse, Typography, Tag, Button } from 'antd';
import PersonalInfoForm from '../components/PersonalInfoForm';
import { PersonalInfo } from '../types';
import axios from 'axios';
import { setForm } from '../store/onboardingSlice.ts'; // assuming you have this slice

const { Title, Text } = Typography;
const { Panel } = Collapse;

const OnboardingPage: React.FC = () => {
  const username = useAppSelector((state) => state.auth.username);
  const userId = useAppSelector((state) => state.auth.id);
  const role = useAppSelector((state) => state.auth.role);
  const token = useAppSelector((state) => state.auth.token);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

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
  });

  useEffect(() => {
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
          setInitialData(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching onboarding info:', err);
      }
    };

    fetchData();
  }, [role, token, navigate]);

  const handleSubmit = async (data: PersonalInfo) => {
    try {
      await axios.post('http://localhost:5001/api/onboarding/submit', 
      {
        userId: userId,
        formData: data
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch(setForm(data));
      setStatus('pending');
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Title level={3}>Applicant: {username}</Title>
      <div className="mb-4">
        <Text strong>Status: </Text>
        <Tag color={status === 'never submitted' ? 'gray' : status === 'pending' ? 'orange' : status === 'rejected' ? 'red' : 'green'}>
          {status}
        </Tag>
      </div>

      <Collapse defaultActiveKey={['1']}>
        <Panel header="Onboarding Application" key="1">
          <PersonalInfoForm initialData={initialData} onSubmit={() => {}} />
          <Button
            type="primary"
            className="mt-4"
            onClick={() => handleSubmit(initialData)}
          >
            Submit Application
          </Button>
        </Panel>
      </Collapse>
    </div>
  );
};

export default OnboardingPage;
