// src/components/PersonalInfoForm.tsx
import { useState, ChangeEvent, FormEvent } from "react";
import {
  PersonalInfo,
  NameInfo,
  AddressInfo,
  ContactInfo,
  EmploymentInfo,
  EmergencyContact,
  Document,
} from "../types";

interface Props {
  initialData: PersonalInfo;
  onSubmit: (data: PersonalInfo) => void;
}

export default function PersonalInfoForm({ initialData, onSubmit }: Props) {
  const [draft, setDraft] = useState<PersonalInfo>(initialData);
  const [isEditing, setIsEditing] = useState(false);

  const startEdit = () => {
    setDraft(initialData);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    if (window.confirm("Discard all changes?")) {
      setDraft(initialData);
      setIsEditing(false);
    }
  };

  // Save: call parent and exit edit mode
  const saveEdit = () => {
    onSubmit(draft);
    setIsEditing(false);
  };

  // Generic handler for nested fields
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

  // Profile pic upload
  const handlePicUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDraft((prev) => ({
      ...prev,
      name: {
        ...prev.name,
        profilePicUrl: URL.createObjectURL(file),
      },
    }));
  };

  // New document upload
  const handleDocUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newDoc: Document = {
      id: `${Date.now()}`,
      name: file.name,
      url: URL.createObjectURL(file),
    };
    setDraft((prev) => ({
      ...prev,
      documents: [...prev.documents, newDoc],
    }));
  };

  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        saveEdit();
      }}
      className="space-y-8 p-8 bg-gray-100 rounded"
    >
      {/* Header buttons */}
      <div className="flex justify-end space-x-2">
        {!isEditing ? (
          <button
            type="button"
            onClick={startEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Edit
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={cancelEdit}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Save
            </button>
          </>
        )}
      </div>

      {/* Name Section */}
      <fieldset className="bg-white p-6 rounded shadow space-y-4">
        <legend className="text-lg font-semibold">Name</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(["firstName", "middleName", "lastName", "preferredName"] as const).map((field) => (
            <div key={field}>
              <label className="block text-sm capitalize">{field}</label>
              <input
                name={field}
                value={draft.name[field]}
                onChange={handleChange("name", field)}
                disabled={!isEditing}
                className="mt-1 w-full border rounded px-2 py-1"
              />
            </div>
          ))}

          {/* Profile picture */}
          <div className="col-span-full">
            <label className="block text-sm">Profile Picture</label>
            {isEditing ? (
              <input type="file" onChange={handlePicUpload} className="mt-1" />
            ) : (
              draft.name.profilePicUrl && (
                <img
                  src={draft.name.profilePicUrl}
                  alt="Profile"
                  className="w-24 h-24 rounded-full mt-2"
                />
              )
            )}
          </div>

          {/* Email, SSN, DOB, Gender */}
          <div>
            <label className="block text-sm">Email</label>
            <input
              name="email"
              type="email"
              value={draft.name.email}
              onChange={handleChange("name", "email")}
              disabled={!isEditing}
              className="mt-1 w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm">SSN</label>
            <input
              name="ssn"
              value={draft.name.ssn}
              onChange={handleChange("name", "ssn")}
              disabled={!isEditing}
              className="mt-1 w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm">Date of Birth</label>
            <input
              name="dob"
              type="date"
              value={draft.name.dob}
              onChange={handleChange("name", "dob")}
              disabled={!isEditing}
              className="mt-1 w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm">Gender</label>
            <select
              name="gender"
              value={draft.name.gender}
              onChange={handleChange("name", "gender")}
              disabled={!isEditing}
              className="mt-1 w-full border rounded px-2 py-1"
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
        </div>
      </fieldset>

      {/* Address Section */}
      <fieldset className="bg-white p-6 rounded shadow space-y-4">
        <legend className="text-lg font-semibold">Address</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(["building", "street", "city", "state", "zip"] as const).map((field) => (
            <div key={field}>
              <label className="block text-sm capitalize">{field}</label>
              <input
                name={field}
                value={draft.address[field]}
                onChange={handleChange("address", field)}
                disabled={!isEditing}
                className="mt-1 w-full border rounded px-2 py-1"
              />
            </div>
          ))}
        </div>
      </fieldset>

      {/* Contact Info */}
      <fieldset className="bg-white p-6 rounded shadow space-y-4">
        <legend className="text-lg font-semibold">Contact Info</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm">Cell Phone</label>
            <input
              name="cell"
              type="tel"
              value={draft.contact.cell}
              onChange={handleChange("contact", "cell")}
              disabled={!isEditing}
              className="mt-1 w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm">Work Phone</label>
            <input
              name="work"
              type="tel"
              value={draft.contact.work}
              onChange={handleChange("contact", "work")}
              disabled={!isEditing}
              className="mt-1 w-full border rounded px-2 py-1"
            />
          </div>
        </div>
      </fieldset>

      {/* Employment */}
      <fieldset className="bg-white p-6 rounded shadow space-y-4">
        <legend className="text-lg font-semibold">Employment</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm">Visa Title</label>
            <input
              name="visaTitle"
              value={draft.employment.visaTitle}
              onChange={handleChange("employment", "visaTitle")}
              disabled={!isEditing}
              className="mt-1 w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm">Start Date</label>
            <input
              name="startDate"
              type="date"
              value={draft.employment.startDate}
              onChange={handleChange("employment", "startDate")}
              disabled={!isEditing}
              className="mt-1 w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm">End Date</label>
            <input
              name="endDate"
              type="date"
              value={draft.employment.endDate}
              onChange={handleChange("employment", "endDate")}
              disabled={!isEditing}
              className="mt-1 w-full border rounded px-2 py-1"
            />
          </div>
        </div>
      </fieldset>

      {/* Emergency Contact */}
      <fieldset className="bg-white p-6 rounded shadow space-y-4">
        <legend className="text-lg font-semibold">Emergency Contact</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(["firstName", "lastName", "phone", "email", "relationship"] as const).map((field) => (
            <div key={field}>
              <label className="block text-sm capitalize">{field}</label>
              <input
                name={field}
                value={(draft.emergency as any)[field]}
                onChange={handleChange("emergency", field)}
                disabled={!isEditing}
                className="mt-1 w-full border rounded px-2 py-1"
              />
            </div>
          ))}
        </div>
      </fieldset>

      {/* Documents */}
      <fieldset className="bg-white p-6 rounded shadow space-y-4">
        <legend className="text-lg font-semibold">Documents</legend>
        <div className="space-y-2">
          {draft.documents.map((doc) => (
            <div key={doc.id} className="flex justify-between items-center">
              <span>{doc.name}</span>
              <div className="space-x-2">
                <a href={doc.url} download className="underline">
                  Download
                </a>
                <a href={doc.url} target="_blank" rel="noopener" className="underline">
                  Preview
                </a>
              </div>
            </div>
          ))}
        </div>
        {isEditing && (
          <input type="file" onChange={handleDocUpload} className="mt-2" />
        )}
      </fieldset>
    </form>
  );
}
