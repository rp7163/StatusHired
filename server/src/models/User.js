import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { toJSONPlugin } from './_plugins.js';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password_hash: { type: String, required: true, select: false },
    full_name: { type: String, default: null },
    username: { type: String, default: null, trim: true },
    avatar_path: { type: String, default: null },
    avatar_type: { type: String, default: null },
    headline: { type: String, default: null },
    bio: { type: String, default: null },
    location: { type: String, default: null },
    phone: { type: String, default: null },
    portfolio_url: { type: String, default: null },
    resume_url: { type: String, default: null },
    github_url: { type: String, default: null },
    linkedin_url: { type: String, default: null },
    twitter_url: { type: String, default: null },
    leetcode_url: { type: String, default: null },
    codeforces_url: { type: String, default: null },
    codechef_url: { type: String, default: null },
    // free-form extra links: [{ label, url }]
    links: { type: [{ label: String, url: String, _id: false }], default: [] },
    open_to_work: { type: Boolean, default: true },
    email_confirmed: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password_hash);
};

userSchema.statics.hashPassword = (plain) => bcrypt.hash(plain, 10);

userSchema.plugin(toJSONPlugin);
userSchema.set('toJSON', {
  ...userSchema.get('toJSON'),
  transform(doc, ret) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.password_hash;
    // public URL for the avatar (served by GET /api/users/:id/avatar)
    ret.avatar_url = ret.avatar_path ? `/api/users/${ret.id}/avatar?v=${new Date(ret.updated_at || Date.now()).getTime()}` : null;
    delete ret.avatar_path;
    delete ret.avatar_type;
    // mimic the shape the UI used before (user.user_metadata.full_name)
    ret.user_metadata = { full_name: ret.full_name || null, avatar_url: ret.avatar_url };
    return ret;
  },
});

export const User = mongoose.model('User', userSchema);
