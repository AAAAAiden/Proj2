import { Schema, model, Document } from 'mongoose';

// Raw user fields
export interface IUser {
  username: string;
  email: string;
  password: string;
  role: 'employee' | 'hr';
}

// Mongoose document version
export interface IUserDocument extends IUser, Document {
  _id: string; // This is KEY to fix your ._id typing issue
}

const UserSchema = new Schema<IUserDocument>({
  username: { type: String, required: true, unique: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+@.+\..+/, 'Please enter a valid email address'],
  },
  password: { type: String, required: true },
  role: { type: String, enum: ['employee', 'hr'], default: 'employee' },
});

const User = model<IUserDocument>('User', UserSchema);
export default User;
