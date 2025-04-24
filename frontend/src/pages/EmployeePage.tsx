import { useEffect, useState } from "react";
import { useAppSelector } from "../hooks";
import axios from "axios";
import MainLayout from "../components/MainLayout";
import { Tabs, Typography, Spin, message } from "antd";
import PersonalInfoForm from "../components/PersonalInfoForm";
import VisaStatus from "../components/VisaStatus";
import { PersonalInfo } from "../types";

const { Title } = Typography;
const { TabPane } = Tabs;

const defaultInfo: PersonalInfo = {
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
  references: [],
  documents: [],
  immigration: {
    isUSResident: false,
    residentStatus: undefined,
    workAuthType: undefined,
    otherVisaTitle: '',
    optReceiptUrl: '',
    authStartDate: '',
    authEndDate: '',
  },
};

const EmployeeDashboard: React.FC = () => {
  const token = useAppSelector((state) => state.auth.token);
  const userId = useAppSelector((state) => state.auth.id);
  const [info, setInfo] = useState<PersonalInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'personal' | 'visa'>('personal');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/onboarding/status", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const merged: PersonalInfo = {
          ...defaultInfo,
          ...res.data.data,
          immigration: {
            ...defaultInfo.immigration,
            ...(res.data.data?.immigration || {}),
          },
        };

        setInfo(merged);
      } catch (err) {
        console.error("Failed to fetch onboarding data", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [token]);

  const handleUpdate = async (updated: PersonalInfo) => {
    try {
      await axios.put(
        "http://localhost:5001/api/onboarding/update",
        { userId, formData: updated },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success("Profile updated successfully.");
    } catch (err) {
      console.error("Failed to update onboarding data", err);
      message.error("Update failed.");
    }
  };

  return (
    <MainLayout
      title="Employee Dashboard"
      navItems={[
        { key: 'personal', label: 'Personal Info' },
        { key: 'visa', label: 'Visa Status' },
      ]}
      selectedKey={activeTab}
      onNavClick={(key) => setActiveTab(key as 'personal' | 'visa')}
    >
      <div style={{ padding: 40 }}>
        <Title level={3}>Welcome</Title>
        {loading ? (
          <Spin />
        ) : (
          <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key as 'personal' | 'visa')}>
            <TabPane tab="Personal Info" key="personal">
              {info && <PersonalInfoForm initialData={info} onSubmit={handleUpdate} />}
            </TabPane>
            <TabPane tab="Visa Status" key="visa">
              {userId && (
                <VisaStatus
                  userId={userId}
                  onNotOpt={() => {
                    message.info('Visa tracking only applies to F1 visa holders.');
                    setActiveTab('personal');
                  }}
                />
              )}
            </TabPane>
          </Tabs>
        )}
      </div>
    </MainLayout>
  );
};

export default EmployeeDashboard;
