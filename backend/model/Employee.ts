import mongoose, { Document, Schema } from 'mongoose';

export interface IContact {
  firstName: string;
  lastName: string;
  middleName?: string;
  phone: string;
  email: string;
  relationship: string;
}

export interface IDocument {
  type: 'profile_picture' | 'driver_license' | 'work_auth';
  filename: string;
  path: string;
}

export interface IEmployee extends Document {
  userId: mongoose.Types.ObjectId;
  name: {
    firstName: string;
    lastName: string;
    middleName?: string;
    preferredName?: string;
    email: string;
  };
  profilePicture?: string;
  contactInfo: {
    cellPhone?: string;
    workPhone?: string;
  };
  address: {
    building?: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  ssn?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'prefer_not_to_say';
  workAuth: {
    citizenshipStatus: 'Citizen' | 'Green Card' | 'Visa';
    visaTitle?: string;
    visaType?: 'H1-B' | 'L2' | 'F1' | 'H4' | 'Other';
    otherTitle?: string;
    startDate?: Date;
    endDate?: Date;
    optReceiptPath?: string;
  };
  reference?: IContact;
  emergencyContacts: IContact[];
  documents: IDocument[];
}

const ContactSchema = {
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  middleName: String,
  phone: { type: String, required: true },
  email: { type: String, required: true },
  relationship: { type: String, required: true },
};

const EmployeeSchema = new Schema<IEmployee>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  name: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    middleName: String,
    preferredName: String,
    email: { type: String, required: true },
  },
  profilePicture: String,
  contactInfo: {
    cellPhone: String,
    workPhone: String,
  },
  address: {
    building: String,
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
  },
  ssn: String,
  dateOfBirth: Date,
  gender: { type: String, enum: ['male', 'female', 'prefer_not_to_say'] },
  workAuth: {
    citizenshipStatus: { type: String, enum: ['Citizen', 'Green Card', 'Visa'], required: true },
    visaTitle: String,
    visaType: { type: String, enum: ['H1-B', 'L2', 'F1', 'H4', 'Other'] },
    otherTitle: String,
    startDate: Date,
    endDate: Date,
    optReceiptPath: String,
  },
  reference: {
    firstName: String,
    lastName: String,
    middleName: String,
    phone: String,
    email: String,
    relationship: String,
  },
  emergencyContacts: [ContactSchema],
  documents: [
    {
      type: {
        type: String,
        enum: ['profile_picture', 'driver_license', 'work_auth'],
        required: true,
      },
      filename: { type: String, required: true },
      path: { type: String, required: true },
    },
  ],
});

export default mongoose.model<IEmployee>('Employee', EmployeeSchema);
