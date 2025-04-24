import { useState, ChangeEvent, useEffect, useCallback } from "react";
import axios from "axios";
import { useAppSelector } from "../hooks";
import {
  PersonalInfo,
  Document,
  ImmigrationInfo
} from "../types";

interface Props {
  initialData: PersonalInfo;
  onSubmit: (data: PersonalInfo) => void;
  disabled?: boolean;
}

export default function PersonalInfoForm({ initialData, onSubmit, disabled = false }: Props) {
  const [draft, setDraft] = useState<PersonalInfo>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const token = useAppSelector((state) => state.auth.token);
  const userId = useAppSelector((state) => state.auth.id);

  useEffect(() => {
    setDraft(initialData);
  }, [initialData]);

  const startEdit = () => {
    if (disabled) return;
    setDraft(initialData);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    if (window.confirm("Discard all changes?")) {
      setDraft(initialData);
      setIsEditing(false);
    }
  };

  const saveEdit = () => {
    onSubmit(draft);
    setIsEditing(false);
  };

  const handleChange =
    <K extends keyof PersonalInfo>(section: K, field: string) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setDraft((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: e.target.value,
        } as any,
      }));
    };

  const handleIsResidentChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const isUS = e.target.value === "yes";
    setDraft(prev => ({
      ...prev,
      immigration: {
        isUSResident: isUS,
        residentStatus: isUS ? prev.immigration.residentStatus : undefined,
        workAuthType: isUS ? undefined : prev.immigration.workAuthType,
        otherVisaTitle: "",
        optReceiptUrl: "",
        authStartDate: "",
        authEndDate: "",
      }
    }));
  };

  const handleImmigrationChange = (field: keyof ImmigrationInfo) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setDraft(prev => ({
        ...prev,
        immigration: {
          ...prev.immigration,
          [field]: value,
        } as any,
      }));
    };

  const handleOptUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId || !token) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('type', 'opt_receipt');

    try {
      const res = await axios.post(
        'http://localhost:5001/api/documents/upload',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const uploaded = res.data.document;

      setDraft((prev) => ({
        ...prev,
        immigration: {
          ...prev.immigration,
          optReceiptUrl: uploaded.url,
        },
      }));
    } catch (err) {
      console.error('OPT Upload failed', err);
    }
  };

  const handleDocUpload = (type: 'profile_picture' | 'driver_license' | 'work_auth') =>
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !userId || !token) return;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('type', type);

      try {
        const res = await axios.post(
          'http://localhost:5001/api/documents/upload',
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        const newDoc = res.data.document;
        setDraft((prev) => ({
          ...prev,
          documents: [...prev.documents, newDoc],
        }));
      } catch (err) {
        console.error('Upload failed', err);
      }
    };

    const deleteDoc = async (docId: string) => {
      if (!token || !userId) return;
      if (!window.confirm("Are you sure you want to delete this document?")) return;
    
      try {
        await axios.delete(`http://localhost:5001/api/documents/${docId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
        setDraft((prev) => ({
          ...prev,
          documents: prev.documents.filter((doc) => doc.id !== docId),
        }));
      } catch (err) {
        console.error('Delete failed', err);
      }
    };

  const previewDoc = useCallback(async (docId: string) => {
    try {
      const res = await axios.get(`http://localhost:5001/api/documents/preview/${docId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const blobUrl = window.URL.createObjectURL(res.data);
      window.open(blobUrl, '_blank');
    } catch (err) {
      console.error('Preview failed', err);
    }
  }, [token]);

  const downloadDoc = useCallback(async (docId: string, filename: string) => {
    try {
      const res = await axios.get(`http://localhost:5001/api/documents/download/${docId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download failed', err);
    }
  }, [token]);

  return (
    <form onSubmit={(e) => { e.preventDefault(); saveEdit(); }} className="space-y-8 p-8 bg-gray-100 rounded">
      <div className="flex justify-end space-x-2">
        {!isEditing ? (
          <button type="button" onClick={startEdit} disabled={disabled} className="px-4 py-2 bg-blue-600 text-white rounded">Edit</button>
        ) : (
          <>
            <button type="button" onClick={cancelEdit} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
          </>
        )}
      </div>

      {/* Name section */}
      <fieldset className="bg-white p-6 rounded shadow space-y-4">
        <legend className="text-lg font-semibold">Name</legend>
        {(["firstName", "middleName", "lastName", "preferredName", "email", "ssn", "dob", "gender"] as const).map((field) => (
          <div key={field}>
            <label className="block text-sm capitalize">{field}</label>
            <input
              name={field}
              value={draft.name[field]}
              onChange={handleChange("name", field)}
              disabled={!isEditing || disabled}
              className="mt-1 w-full border rounded px-2 py-1"
            />
          </div>
        ))}
      </fieldset>

      {/* Address */}
      <fieldset className="bg-white p-6 rounded shadow space-y-4">
        <legend className="text-lg font-semibold">Address</legend>
        {(["building", "street", "city", "state", "zip"] as const).map((field) => (
          <div key={field}>
            <label className="block text-sm capitalize">{field}</label>
            <input
              name={field}
              value={draft.address[field]}
              onChange={handleChange("address", field)}
              disabled={!isEditing || disabled}
              className="mt-1 w-full border rounded px-2 py-1"
            />
          </div>
        ))}
      </fieldset>

      {/* Contact */}
      <fieldset className="bg-white p-6 rounded shadow space-y-4">
        <legend className="text-lg font-semibold">Contact</legend>
        {(["cell", "work"] as const).map((field) => (
          <div key={field}>
            <label className="block text-sm capitalize">{field}</label>
            <input
              name={field}
              value={draft.contact[field]}
              onChange={handleChange("contact", field)}
              disabled={!isEditing || disabled}
              className="mt-1 w-full border rounded px-2 py-1"
            />
          </div>
        ))}
      </fieldset>

      {/* Employment */}
      <fieldset className="bg-white p-6 rounded shadow space-y-4">
        <legend className="text-lg font-semibold">Employment</legend>
        {(["visaTitle", "startDate", "endDate"] as const).map((field) => (
          <div key={field}>
            <label className="block text-sm capitalize">{field}</label>
            <input
              name={field}
              value={draft.employment[field]}
              onChange={handleChange("employment", field)}
              disabled={!isEditing || disabled}
              className="mt-1 w-full border rounded px-2 py-1"
            />
          </div>
        ))}
      </fieldset>

      {/* Emergency Contact */}
      <fieldset className="bg-white p-6 rounded shadow space-y-4">
        <legend className="text-lg font-semibold">Emergency Contact</legend>
        {(["firstName", "lastName", "phone", "email", "relationship"] as const).map((field) => (
          <div key={field}>
            <label className="block text-sm capitalize">{field}</label>
            <input
              name={field}
              value={draft.emergency[field]}
              onChange={handleChange("emergency", field)}
              disabled={!isEditing || disabled}
              className="mt-1 w-full border rounded px-2 py-1"
            />
          </div>
        ))}
      </fieldset>

      {/* Immigration */}
      <fieldset className="bg-white p-6 rounded shadow space-y-4">
        <legend className="text-lg font-semibold">U.S. Status & Work Authorization</legend>
        <div>
          <label className="block text-sm">U.S. Resident?</label>
          <select
            value={draft.immigration.isUSResident ? "yes" : "no"}
            onChange={handleIsResidentChange}
            disabled={!isEditing}
            className="mt-1 w-full border rounded px-2 py-1"
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        {draft.immigration.isUSResident ? (
          <div>
            <label>Status</label>
            <select
              value={draft.immigration.residentStatus || ""}
              onChange={handleImmigrationChange("residentStatus")}
              disabled={!isEditing}
              className="mt-1 w-full border rounded px-2 py-1"
            >
              <option>Green Card</option>
              <option>Citizen</option>
            </select>
          </div>
        ) : (
          <>
            <div>
              <label>Work Auth Type</label>
              <select
                value={draft.immigration.workAuthType || ""}
                onChange={handleImmigrationChange("workAuthType")}
                disabled={!isEditing}
                className="mt-1 w-full border rounded px-2 py-1"
              >
                <option>H1-B</option>
                <option>L2</option>
                <option>F1</option>
                <option>H4</option>
                <option>Other</option>
              </select>
            </div>
            {draft.immigration.workAuthType === "F1" && (
              <div>
                <label>OPT Receipt</label>
                <input type="file" onChange={handleOptUpload} disabled={!isEditing} className="mt-1" />
              </div>
            )}
            {draft.immigration.workAuthType === "Other" && (
              <div>
                <label>Other Visa Title</label>
                <input
                  type="text"
                  value={draft.immigration.otherVisaTitle}
                  onChange={handleImmigrationChange("otherVisaTitle")}
                  disabled={!isEditing}
                  className="mt-1 w-full border rounded px-2 py-1"
                />
              </div>
            )}
          </>
        )}
      </fieldset>

      {/* Documents */}
      <fieldset className="bg-white p-6 rounded shadow space-y-4">
        <legend className="text-lg font-semibold">Uploaded Documents</legend>

        {['profile_picture', 'driver_license', 'work_auth'].map((category) => (
          <div key={category} className="mb-4">
            <label className="block font-medium capitalize">{category.replace('_', ' ')}</label>
            {draft.documents
              .filter((doc) => doc.type === category)
              .map((doc) => (
                <div key={doc.id} className="flex justify-between items-center">
                  <span>{doc.name}</span>
                  {isEditing && (
                    <div className="space-x-2">
                      <button onClick={() => previewDoc(doc.id)} className="text-blue-600 underline">Preview</button>
                      <button onClick={() => downloadDoc(doc.id, doc.name)} className="text-blue-600 underline">Download</button>
                      <button onClick={() => deleteDoc(doc.id)} className="text-red-500 underline">Delete</button>
                    </div>
                  )}
                </div>
              ))}
            {isEditing && (
              <input
                type="file"
                onChange={handleDocUpload(category as 'profile_picture' | 'driver_license' | 'work_auth')}
                className="mt-2"
              />
            )}
          </div>
        ))}
      </fieldset>
    </form>
  );
}
