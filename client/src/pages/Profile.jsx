import React, { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Mail,
  Phone,
  Globe,
  FileText,
  Pencil,
  Camera,
  Trash2,
  Plus,
  X,
  Save,
  BriefcaseBusiness,
  Sparkles,
  AtSign,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useJobTracker } from '../context/JobTrackerContext.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { Avatar } from '../components/ui/Avatar.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Textarea } from '../components/ui/Textarea.jsx';
import { SocialLinks } from '../components/profile/SocialLinks.jsx';

const URL_FIELDS = [
  { key: 'portfolio_url', label: 'Portfolio website', placeholder: 'https://yourname.vercel.app' },
  { key: 'resume_url', label: 'Resume link (Drive / PDF)', placeholder: 'https://drive.google.com/…' },
  { key: 'github_url', label: 'GitHub', placeholder: 'https://github.com/username' },
  { key: 'linkedin_url', label: 'LinkedIn', placeholder: 'https://www.linkedin.com/in/username' },
  { key: 'twitter_url', label: 'X / Twitter', placeholder: 'https://x.com/username' },
  { key: 'leetcode_url', label: 'LeetCode', placeholder: 'https://leetcode.com/u/username' },
  { key: 'codeforces_url', label: 'Codeforces', placeholder: 'https://codeforces.com/profile/username' },
  { key: 'codechef_url', label: 'CodeChef', placeholder: 'https://www.codechef.com/users/username' },
];

const emptyForm = (user) => ({
  full_name: user?.full_name || '',
  username: user?.username || '',
  headline: user?.headline || '',
  bio: user?.bio || '',
  location: user?.location || '',
  phone: user?.phone || '',
  open_to_work: Boolean(user?.open_to_work),
  portfolio_url: user?.portfolio_url || '',
  resume_url: user?.resume_url || '',
  github_url: user?.github_url || '',
  linkedin_url: user?.linkedin_url || '',
  twitter_url: user?.twitter_url || '',
  leetcode_url: user?.leetcode_url || '',
  codeforces_url: user?.codeforces_url || '',
  codechef_url: user?.codechef_url || '',
  links: Array.isArray(user?.links) ? user.links.map((l) => ({ label: l.label || '', url: l.url || '' })) : [],
});

export const Profile = () => {
  useDocumentTitle('Profile');
  const { user, updateProfile, uploadAvatar, removeAvatar } = useAuth();
  const { applications, resumes } = useJobTracker();
  const { success, error: toastError } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(() => emptyForm(user));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const stats = useMemo(() => {
    const total = applications.length;
    const interviews = applications.filter((a) => a.stage === 'interview').length;
    const offers = applications.filter((a) => a.stage === 'selected').length;
    const active = applications.filter((a) => !['rejected', 'selected'].includes(a.stage)).length;
    return [
      { label: 'Applications', value: total },
      { label: 'In progress', value: active },
      { label: 'Interviews', value: interviews },
      { label: 'Offers', value: offers },
      { label: 'Resumes', value: resumes.length },
    ];
  }, [applications, resumes]);

  const startEditing = () => {
    setForm(emptyForm(user));
    setIsEditing(true);
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const setLink = (idx, key, value) =>
    setForm((f) => ({ ...f, links: f.links.map((l, i) => (i === idx ? { ...l, [key]: value } : l)) }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        ...form,
        links: form.links.filter((l) => l.url.trim()),
      });
      success('Profile updated', 'Your public profile has been saved.');
      setIsEditing(false);
    } catch (err) {
      toastError('Could not save profile', err?.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toastError('Photo too large', 'Please choose an image under 2 MB.');
      return;
    }
    setUploading(true);
    try {
      await uploadAvatar(file);
      success('Photo updated');
    } catch (err) {
      toastError('Upload failed', err?.message || 'Please try a JPG, PNG, WEBP or GIF.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setUploading(true);
    try {
      await removeAvatar();
      success('Photo removed');
    } catch (err) {
      toastError('Could not remove photo', err?.message);
    } finally {
      setUploading(false);
    }
  };

  const displayName = user?.full_name || user?.username || 'Your name';
  const firstName = displayName.split(' ')[0];

  return (
    <div className="space-y-10">
      {/* ---------------- Hero (portfolio style) ---------------- */}
      <section className="relative overflow-hidden apple-card p-6 sm:p-10">
        {/* soft glow */}
        <div className="pointer-events-none absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle,var(--accent-glow),transparent_65%)] opacity-70" />

        <div className="relative grid lg:grid-cols-[1fr_auto] gap-10 items-center">
          <div className="text-center lg:text-left">
            {user?.open_to_work && (
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#B45309] dark:text-[#FBBF24] text-[12px] font-semibold mb-5">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
                Open to work
              </span>
            )}
            {!user?.open_to_work && (
              <span className="eyebrow mb-5">Profile</span>
            )}

            <h1 className="text-[36px] sm:text-[52px] leading-[1.05] font-bold tracking-tight text-[#0C1A13] dark:text-[#E8F5EE]">
              Hi, I&apos;m <span className="gradient-text">{displayName}</span>
            </h1>

            {user?.headline && (
              <p className="mt-3 text-[18px] sm:text-[20px] font-medium text-[#54635B] dark:text-[#8AA097]">
                {user.headline}
              </p>
            )}

            {user?.bio && (
              <p className="mt-4 max-w-2xl mx-auto lg:mx-0 text-[15px] leading-relaxed text-[#54635B] dark:text-[#8AA097] whitespace-pre-line">
                {user.bio}
              </p>
            )}

            {/* contact chips */}
            <div className="mt-5 flex flex-wrap justify-center lg:justify-start gap-2 text-[13px] text-[#54635B] dark:text-[#8AA097]">
              {user?.username && <Chip icon={AtSign}>{user.username}</Chip>}
              {user?.location && <Chip icon={MapPin}>{user.location}</Chip>}
              {user?.email && <Chip icon={Mail}>{user.email}</Chip>}
              {user?.phone && <Chip icon={Phone}>{user.phone}</Chip>}
            </div>

            {/* CTAs */}
            <div className="mt-7 flex flex-wrap justify-center lg:justify-start gap-3">
              {user?.portfolio_url && (
                <a href={user.portfolio_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="primary" size="lg" leftIcon={<Globe className="w-4 h-4 text-black" />}>
                    <span className='text-black'>View portfolio</span>
                  </Button>
                </a>
              )}
              {user?.resume_url && (
                <a href={user.resume_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="lg" leftIcon={<FileText className="w-4 h-4" />}>
                    View resume
                  </Button>
                </a>
              )}
              <Button variant={user?.portfolio_url ? 'ghost' : 'primary'} size="lg" onClick={startEditing} leftIcon={<Pencil className="w-4 h-4" />}>
                Edit profile
              </Button>
            </div>

            <SocialLinks user={user} className="mt-7 justify-center lg:justify-start" />
          </div>

          {/* Photo with glow ring */}
          <div className="relative mx-auto">
            <div className="absolute inset-0 rounded-[32px] gradient-bg blur-2xl opacity-40 scale-105" />
            <div className="relative p-[3px] rounded-[32px] gradient-bg shadow-[0_20px_60px_var(--accent-glow)]">
              <Avatar user={user} size={220} rounded="rounded-[29px]" className="!border-0 bg-[var(--bg-elev)]" />
            </div>

            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={handleAvatarChange} />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="h-10 px-4 rounded-full bg-[var(--bg-elev)] border border-[#E1EBE5] dark:border-[#1D2A23] shadow-[var(--shadow)] text-[13px] font-semibold whitespace-nowrap text-[#0C1A13] dark:text-[#E8F5EE] flex items-center gap-2 hover:border-[#10B981] cursor-pointer disabled:opacity-60"
              >
                <Camera className="w-4 h-4" />
                {uploading ? 'Uploading…' : user?.avatar_url ? 'Change photo' : 'Add photo'}
              </button>
              {user?.avatar_url && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={uploading}
                  title="Remove photo"
                  className="w-10 h-10 rounded-full bg-[var(--bg-elev)] border border-[#E1EBE5] dark:border-[#1D2A23] shadow-[var(--shadow)] text-[#FF453A] flex items-center justify-center hover:border-[#FF453A] cursor-pointer disabled:opacity-60"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Stat cards ---------------- */}
      <section>
        <span className="eyebrow">By the numbers</span>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="apple-card p-5 text-center hover:-translate-y-1 hover:shadow-[var(--shadow-glow)] transition-all"
            >
              <div className="text-[36px] font-bold leading-none gradient-text font-[Outfit]">{s.value}</div>
              <div className="mt-2 text-[12px] font-medium uppercase tracking-wider text-[#54635B] dark:text-[#8AA097]">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------------- About / details ---------------- */}
      <section className="grid md:grid-cols-2 gap-4">
        <div className="apple-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#059669] dark:text-[#34D399]" />
            <h2 className="text-[17px] font-bold">About {firstName}</h2>
          </div>
          <p className="text-[14px] leading-relaxed text-[#54635B] dark:text-[#8AA097] whitespace-pre-line">
            {user?.bio || 'Add a short bio so recruiters and teammates know what you are about.'}
          </p>
        </div>
        <div className="apple-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <BriefcaseBusiness className="w-4 h-4 text-[#059669] dark:text-[#34D399]" />
            <h2 className="text-[17px] font-bold">Links &amp; profiles</h2>
          </div>
          <dl className="space-y-2 text-[14px]">
            {URL_FIELDS.filter((f) => user?.[f.key]).map((f) => (
              <div key={f.key} className="flex items-center justify-between gap-3">
                <dt className="text-[#54635B] dark:text-[#8AA097] shrink-0">{f.label}</dt>
                <dd className="truncate">
                  <a href={user[f.key]} target="_blank" rel="noopener noreferrer" className="text-[#059669] dark:text-[#34D399] hover:underline truncate">
                    {user[f.key].replace(/^https?:\/\//, '')}
                  </a>
                </dd>
              </div>
            ))}
            {(user?.links || []).map((l, i) => (
              <div key={`extra-${i}`} className="flex items-center justify-between gap-3">
                <dt className="text-[#54635B] dark:text-[#8AA097] shrink-0">{l.label || 'Link'}</dt>
                <dd className="truncate">
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-[#059669] dark:text-[#34D399] hover:underline truncate">
                    {l.url.replace(/^https?:\/\//, '')}
                  </a>
                </dd>
              </div>
            ))}
            {URL_FIELDS.every((f) => !user?.[f.key]) && !(user?.links || []).length && (
              <p className="text-[#54635B] dark:text-[#8AA097]">No links yet — click “Edit profile” to add your portfolio, GitHub, LinkedIn and coding profiles.</p>
            )}
          </dl>
        </div>
      </section>

      {/* ---------------- Edit drawer / modal ---------------- */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setIsEditing(false)}
          >
            <motion.form
              onSubmit={handleSave}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto apple-card rounded-t-[24px] sm:rounded-[24px] p-6 sm:p-8 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[22px] font-bold">Edit profile</h2>
                  <p className="text-[13px] text-[#54635B] dark:text-[#8AA097]">This information appears on your profile page and in the footer.</p>
                </div>
                <button type="button" onClick={() => setIsEditing(false)} className="w-9 h-9 rounded-full hover:bg-[var(--accent-soft)] flex items-center justify-center cursor-pointer" aria-label="Close">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Full name" value={form.full_name} onChange={set('full_name')} placeholder="Rudra Patel" />
                <Input label="Username" value={form.username} onChange={set('username')} placeholder="rp7163" leftIcon={<AtSign className="w-4 h-4" />} maxLength={30} />
                <Input label="Headline" value={form.headline} onChange={set('headline')} placeholder="Computer Engineer · Full-stack developer" className="sm:col-span-2" />
                <Input label="Location" value={form.location} onChange={set('location')} placeholder="Ahmedabad, Gujarat" leftIcon={<MapPin className="w-4 h-4" />} />
                <Input label="Phone" value={form.phone} onChange={set('phone')} placeholder="+91 …" leftIcon={<Phone className="w-4 h-4" />} />
              </div>

              <Textarea label="Bio" value={form.bio} onChange={set('bio')} rows={4} maxLength={600} placeholder="A few lines about you, what you build and what you are looking for." />

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input type="checkbox" checked={form.open_to_work} onChange={(e) => setForm((f) => ({ ...f, open_to_work: e.target.checked }))} className="w-4 h-4 accent-[#059669]" />
                <span className="text-[14px] font-medium">Show the “Open to work” badge on my profile</span>
              </label>

              <div>
                <h3 className="text-[15px] font-bold mb-3">Links &amp; social profiles</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {URL_FIELDS.map((f) => (
                    <Input key={f.key} label={f.label} value={form[f.key]} onChange={set(f.key)} placeholder={f.placeholder} type="url" />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[15px] font-bold">Other links</h3>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setForm((f) => ({ ...f, links: [...f.links, { label: '', url: '' }] }))} leftIcon={<Plus className="w-4 h-4" />}>
                    Add link
                  </Button>
                </div>
                {form.links.length === 0 && (
                  <p className="text-[13px] text-[#54635B] dark:text-[#8AA097]">Add anything else — Coding Ninjas, Medium, YouTube, Dribbble…</p>
                )}
                <div className="space-y-3">
                  {form.links.map((l, idx) => (
                    <div key={idx} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-end">
                      <Input label={idx === 0 ? 'Label' : undefined} value={l.label} onChange={(e) => setLink(idx, 'label', e.target.value)} placeholder="Coding Ninjas" />
                      <Input label={idx === 0 ? 'URL' : undefined} value={l.url} onChange={(e) => setLink(idx, 'url', e.target.value)} placeholder="https://…" type="url" />
                      <button type="button" onClick={() => setForm((f) => ({ ...f, links: f.links.filter((_, i) => i !== idx) }))} className="h-12 w-12 rounded-[12px] flex items-center justify-center text-[#FF453A] hover:bg-[#FF453A]/10 cursor-pointer" aria-label="Remove link">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E1EBE5] dark:border-[#1D2A23]">
                <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button type="submit" variant="primary" isLoading={saving} leftIcon={<Save className="w-4 h-4" />}>
                  Save changes
                </Button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Chip = ({ icon: Icon, children }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-elev-2)] border border-[#E1EBE5] dark:border-[#1D2A23]">
    <Icon className="w-3.5 h-3.5 text-[#059669] dark:text-[#34D399]" />
    {children}
  </span>
);

export default Profile;
