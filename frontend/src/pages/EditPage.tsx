import { useState, useEffect } from "react";
import PersonalInfoForm from "../components/PersonalInfoForm";
import { PersonalInfo } from "../types";

export default function EditPersonalInfoPage() {
  // const [info, setInfo] = useState<PersonalInfo | null>(null);
  let info = {
    "name": {
      "firstName": "Kaiyuan",
      "middleName": "Li",
      "lastName": "Lin",
      "preferredName": "Kai",
      "profilePicUrl": "https://example.com/profiles/kaiyuan.jpg",
      "email": "kaiyuan.lin@example.com",
      "ssn": "123-45-6789",
      "dob": "1995-08-15",
      "gender": "Male"
    },
    "address": {
      "building": "Apt 12B",
      "street": "1234 University Ave",
      "city": "Los Angeles",
      "state": "CA",
      "zip": "90007"
    },
    "contact": {
      "cell": "+1-213-555-0123",
      "work": "+1-213-555-0456"
    },
    "employment": {
      "visaTitle": "F-1 OPT",
      "startDate": "2024-09-01",
      "endDate": "2025-08-31"
    },
    "emergency": {
      "firstName": "Alex",
      "lastName": "Wang",
      "phone": "+1-310-555-0789",
      "email": "alex.wang@example.com",
      "relationship": "Friend"
    },
    "documents": [
      {
        "id": "doc-001",
        "name": "Driver’s License",
        "url": "https://example.com/docs/drivers_license.pdf"
      },
      {
        "id": "doc-002",
        "name": "Work Authorization",
        "url": "https://example.com/docs/work_auth.pdf"
      }
    ]
  }
  

  // useEffect(() => {
  //   fetch("/api/personal-info")
  //     .then((res) => res.json())
  //     .then((data: PersonalInfo) => setInfo(data));
  // }, []);

  // if (!info) return <div>Loading…</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <PersonalInfoForm
          initialData={info}
          onSubmit={(updated) => {
            // fetch("/api/personal-info", {
            //   method: "PUT",
            //   headers: { "Content-Type": "application/json" },
            //   body: JSON.stringify(updated),
            // }).then(() => setInfo(updated));
          }}
        />
      </div>
    </div>
  );
}