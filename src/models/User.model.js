import { Schema, model } from 'mongoose';

const UserSchema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    refreshToken: { type: String },
    imageUrl: [{ type: String }],
  },
  { timestamps: true }
);

const User = model('User', UserSchema);

UserSchema.index({ email: 1, phone: 1 });

export default User;
