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
    type: Schema.Types.Mixed,
    required: true,
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
