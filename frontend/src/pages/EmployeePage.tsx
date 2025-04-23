import { useEffect, useState } from "react";
import { useAppSelector } from "../hooks";
import axios from "axios";
import AccountLayout from "../components/AccountLayout";
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
    }
  };

const EmployeeDashboard: React.FC = () => {
  const token = useAppSelector((state) => state.auth.token);
  const [info, setInfo] = useState<PersonalInfo | null>(null);
  const userId = useAppSelector((state) => state.auth.id);

  useEffect(() => {
    const fetch = async () => {
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
    };
    fetch();
  }, [token]);

  const handleUpdate = async (updated: PersonalInfo) => {
    await axios.put(
      "http://localhost:5001/api/onboarding/update",
      { userId, formData: updated },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  };

  if (!info) return <div>Loading...</div>;
  console.log("Initial data: ", info);
  return <AccountLayout initialData={info} onSubmit={handleUpdate} />;
};

export default EmployeeDashboard;
