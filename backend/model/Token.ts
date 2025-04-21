import mongoose, { Document, Schema } from 'mongoose';

export interface IToken extends Document {
  email: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
}

const TokenSchema: Schema = new Schema<IToken>({
  email: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  used: {
    type: Boolean,
    default: false,
  },
});

TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IToken>('Token', TokenSchema);
