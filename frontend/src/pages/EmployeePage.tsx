import { useEffect, useState } from "react";
import { useAppSelector } from "../hooks";
import axios from "axios";
import MainLayout from "../components/MainLayout";
import PersonalInfoForm from "../components/PersonalInfoForm";
import VisaStatusPage from "../components/VisaStatus";
import { PersonalInfo } from "../types";

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
  const [viewMode, setViewMode] = useState<"personal" | "visa">("personal");

  const navItems = [
    { key: "personal", label: "Personal Info" },
    { key: "visa", label: "Visa Status" },
  ];


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
    } catch (err) {
      console.error("Failed to update onboarding data", err);
    }
  };

  if (!info) return <div>Loading...</div>;

  return (
    <MainLayout
      title="Employee Home Page"
      navItems={navItems}
      selectedKey={viewMode}
      onNavClick={(key) => setViewMode(key as "personal" | "visa")}
    >
      {viewMode === "personal" ? (
        <PersonalInfoForm initialData={info} onSubmit={handleUpdate} disabled={false} />
      ) : (
        <VisaStatusPage
        userId={userId}
        onNotOpt={() => setViewMode('personal')}
      />
      )}
    </MainLayout>
  );
};

export default EmployeeDashboard;
