import mongoose, { Schema, Document } from 'mongoose';

export type OnboardingStatus = 'Pending' | 'Approved' | 'Rejected';

export interface IOnboardingApp extends Document {
  userId: mongoose.Types.ObjectId;
  formData: Record<string, any>;
  status: OnboardingStatus;
  feedback?: string;
}

const OnboardingAppSchema = new Schema<IOnboardingApp>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  formData: {
    name: {
      firstName: String,
      middleName: String,
      lastName: String,
      preferredName: String,
      profilePicUrl: String,
      email: String,
      ssn: String,
      dob: String,
      gender: String,
    },
    address: {
      building: String,
      street: String,
      city: String,
      state: String,
      zip: String,
    },
    contact: {
      cell: String,
      work: String,
    },
    employment: {
      visaTitle: String,
      startDate: String,
      endDate: String,
    },
    emergency: {
      firstName: String,
      lastName: String,
      phone: String,
      email: String,
      relationship: String,
    },
    references:
      {
        firstName: String,
        lastName: String,
        phone: String,
        email: String,
        relationship: String,
      },
    documents: [
      {
        id: String,
        name: String,
        url: String,
        type: String,
      }
    ],
    immigration: {
      isUSResident: Boolean,
      residentStatus: String,
      workAuthType: String,
      otherVisaTitle: String,
      optReceiptUrl: String,
      authStartDate: String,
      authEndDate: String,
    },
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  feedback: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

export default mongoose.model<IOnboardingApp>('OnboardingApp', OnboardingAppSchema);
