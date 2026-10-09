import mongoose from 'mongoose';
import { toJSONPlugin } from './_plugins.js';

export const STAGES = ['saved', 'applied', 'assessment', 'interview', 'selected', 'rejected'];

const schema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    company_name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    ctc: { type: String, default: null },
    location: { type: String, default: null },
    job_type: { type: String, default: null },
    source: { type: String, default: null },
    link: { type: String, default: null },
    applied_date: { type: String, default: null }, // ISO date string (YYYY-MM-DD) like the Postgres `date`
    stage: { type: String, enum: STAGES, default: 'saved', required: true },
    resume_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', default: null },
    notes: { type: String, default: null },
    position: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);
schema.plugin(toJSONPlugin);

/** Serialise with the joined resume under `resumes` (mirrors `select('*, resumes(*)')`). */
export function serializeApplication(doc) {
  const json = doc.toJSON();
  const populated = doc.resume_id && typeof doc.resume_id === 'object' && doc.resume_id._id;
  if (populated) {
    json.resumes = doc.resume_id.toJSON();
    json.resume_id = String(doc.resume_id._id);
  } else {
    json.resumes = null;
    json.resume_id = doc.resume_id ? String(doc.resume_id) : null;
  }
  return json;
}

export const Application = mongoose.model('Application', schema);
