import mongoose from 'mongoose';
import { toJSONPlugin } from './_plugins.js';

const schema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    file_path: { type: String, required: true },
    size_bytes: { type: Number, default: null },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);
schema.plugin(toJSONPlugin);

export const Resume = mongoose.model('Resume', schema);
