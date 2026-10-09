import mongoose from 'mongoose';
import { toJSONPlugin } from './_plugins.js';

const schema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  theme: { type: String, enum: ['system', 'light', 'dark'], default: 'system' },
  browser_notifications: { type: Boolean, default: false },
});
schema.plugin(toJSONPlugin);

export const UserSettings = mongoose.model('UserSettings', schema);
