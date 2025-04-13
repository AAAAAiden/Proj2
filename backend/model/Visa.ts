import mongoose, { Document, Schema } from 'mongoose';

type Status = 'Pending' | 'Approved' | 'Rejected';

interface VisaDocument {
  path: string;
  status: Status;
  feedback: string;
}

export interface IVisaStatus extends Document {
  userId: mongoose.Types.ObjectId;
  optReceipt?: VisaDocument;
  optEAD?: VisaDocument;
  i983?: VisaDocument;
  i20?: VisaDocument;
}

const visaDocSchema = new Schema<VisaDocument>({
  path: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], required: true },
  feedback: { type: String, default: '' },
}, { _id: false });

const VisaStatusSchema = new Schema<IVisaStatus>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  optReceipt: visaDocSchema,
  optEAD: visaDocSchema,
  i983: visaDocSchema,
  i20: visaDocSchema,
}, {
  timestamps: true,
});

export default mongoose.model<IVisaStatus>('VisaStatus', VisaStatusSchema);
