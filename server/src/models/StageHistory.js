import mongoose from 'mongoose';
import { toJSONPlugin } from './_plugins.js';

const schema = new mongoose.Schema({
  application_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true, index: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  from_stage: { type: String, default: null },
  to_stage: { type: String, required: true },
  changed_at: { type: Date, default: Date.now },
});
schema.plugin(toJSONPlugin);

export const StageHistory = mongoose.model('StageHistory', schema);
