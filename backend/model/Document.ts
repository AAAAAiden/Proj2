import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: string; // e.g., 'profile_picture', 'driver_license', 'work_auth'
  originalName: string;
  filePath: string;
  uploadedAt: Date;
}

const DocumentSchema: Schema = new Schema<IDocument>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['profile_picture', 'driver_license', 'work_auth', 'opt_receipt', 'opt_ead', 'i983', 'i20', 'other'],
  },
  originalName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

export const DocumentModel = mongoose.model<IDocument>('Document', DocumentSchema);
