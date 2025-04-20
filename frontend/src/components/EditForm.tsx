import { useState, ChangeEvent, FormEvent } from "react";

interface FormData {
  name: string;
  email: string;
}

interface EditFormProps {
  initialData: FormData;
  onSubmit: (data: FormData) => void;
}

const EditForm: React.FC<EditFormProps> = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState<FormData>(initialData);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded shadow space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Edit Information</h2>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        Save Changes
      </button>
    </form>
  );
};

export default EditForm;
