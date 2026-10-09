import mongoose from 'mongoose';
import { toJSONPlugin } from './_plugins.js';

const schema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    application_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', default: null },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: null },
    remind_at: { type: Date, required: true },
    is_done: { type: Boolean, default: false },
    notified: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);
schema.plugin(toJSONPlugin);

/** Serialise with the joined application summary under `applications`. */
export function serializeReminder(doc) {
  const json = doc.toJSON();
  const app = doc.application_id;
  if (app && typeof app === 'object' && app._id) {
    json.applications = { id: String(app._id), company_name: app.company_name, role: app.role, stage: app.stage };
    json.application_id = String(app._id);
  } else {
    json.applications = null;
    json.application_id = app ? String(app) : null;
  }
  return json;
}

export const Reminder = mongoose.model('Reminder', schema);
