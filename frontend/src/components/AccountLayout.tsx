// src/components/AccountLayout.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PersonalInfoForm from "./PersonalInfoForm";
import VisaStatusPage from "./VisaStatus";
import type { PersonalInfo } from "../types";
import { useAppDispatch } from "../hooks";
import { clearAuth } from "../store/authSlice";

type ViewMode = "personal" | "visa";

interface Props {
  initialData: PersonalInfo;
  onSubmit: (data: PersonalInfo) => void;
}

export default function AccountLayout({ initialData, onSubmit }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("personal");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    sessionStorage.clear(); 
    dispatch(clearAuth());        
    navigate("/signin");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* NAV BAR */}
      <nav className="bg-white shadow">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode("personal")}
              className={`px-4 py-2 rounded ${
                viewMode === "personal"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Personal Info
            </button>
            <button
              onClick={() => setViewMode("visa")}
              className={`px-4 py-2 rounded ${
                viewMode === "visa"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Visa Status
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </nav>
      <main className="flex-grow container mx-auto px-4 py-6">
        {viewMode === "personal" ? (
          <PersonalInfoForm
            initialData={initialData}
            onSubmit={onSubmit}
            disabled={false}
          />
        ) : (
          <VisaStatusPage />
        )}
      </main>
    </div>
  );
}
