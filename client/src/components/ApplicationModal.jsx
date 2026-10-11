import React, { useState, useEffect, useRef } from 'react';

import { STAGES_CONFIG } from '../types/index.js';
import { useJobTracker } from '../context/JobTrackerContext.jsx';
import { CompactResumeUploadModal } from './resumes/CompactResumeUploadModal.jsx';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ApplicationModal = ({ isOpen, onClose, applicationToEdit, defaultStage = 'saved' }) => {
  const { createApplication, updateApplication, resumes } = useJobTracker();
  const firstInputRef = useRef(null);

  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [stage, setStage] = useState(defaultStage);
  const [appliedDate, setAppliedDate] = useState('');
  const [resumeId, setResumeId] = useState('');

  // More details expander state
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [ctc, setCtc] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('Full-time');
  const [source, setSource] = useState('LinkedIn');
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');

  // Local state for compact upload modal
  const [isCompactUploadOpen, setIsCompactUploadOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset or initialize state
  useEffect(() => {
    if (!isOpen) return;

    if (applicationToEdit) {
      setCompanyName(applicationToEdit.company_name);
      setRole(applicationToEdit.role);
      setStage(applicationToEdit.stage);
      setAppliedDate(applicationToEdit.applied_date || '');
      setResumeId(applicationToEdit.resume_id || '');
      setCtc(applicationToEdit.ctc || '');
      setLocation(applicationToEdit.location || '');
      setJobType(applicationToEdit.job_type || 'Full-time');
      setSource(applicationToEdit.source || 'LinkedIn');
      setLink(applicationToEdit.link || '');
      setNotes(applicationToEdit.notes || '');
      // If editing has more details filled in, expand it automatically
      if (
        applicationToEdit.ctc ||
        applicationToEdit.location ||
        applicationToEdit.link ||
        applicationToEdit.notes
      ) {
        setShowMoreDetails(true);
      } else {
        setShowMoreDetails(false);
      }
    } else {
      setCompanyName('');
      setRole('');
      setStage(defaultStage);
      setAppliedDate(defaultStage === 'applied' ? new Date().toISOString().split('T')[0] : '');
      setResumeId(resumes[0]?.id || '');
      setCtc('');
      setLocation('');
      setJobType('Full-time');
      setSource('LinkedIn');
      setLink('');
      setNotes('');
      setShowMoreDetails(false);
    }

    setErrors({});

    // Autofocus first input after render
    setTimeout(() => {
      firstInputRef.current?.focus();
    }, 100);
  }, [isOpen, applicationToEdit, defaultStage, resumes]);

  // Handle stage select with auto applied_date
  const handleStageSelect = (newStage) => {
    setStage(newStage);
    if (newStage === 'applied' && !appliedDate) {
      setAppliedDate(new Date().toISOString().split('T')[0]);
    }
  };

  const validate = () => {
    const errs = {};

    if (!companyName.trim()) {
      errs.companyName = 'Company name is required';
    }

    if (!role.trim()) {
      errs.role = 'Role title is required';
    }

    if (link.trim()) {
      try {
        const url = new URL(link.trim());
        if (!['http:', 'https:'].includes(url.protocol)) {
          errs.link = 'Please enter a valid URL (https://...)';
        }
      } catch {
        errs.link = 'Please enter a valid URL';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const payload = {
        company_name: companyName.trim(),
        role: role.trim(),
        stage,
        applied_date: appliedDate || null,
        resume_id: resumeId || null,
        ctc: ctc.trim() || null,
        location: location.trim() || null,
        job_type: jobType || null,
        source: source || null,
        link: link.trim() || null,
        notes: notes.trim() || null,
      };

      if (applicationToEdit) {
        await updateApplication(applicationToEdit.id, payload);
      } else {
        await createApplication(payload);
      }
      onClose();
    } catch (err) {
      console.error('Failed to save application:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stagesList = ['saved', 'applied', 'assessment', 'interview', 'selected', 'rejected'];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        />

        {/* iOS-Style Sheet Modal Container (Radius 24px) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg rounded-[24px] bg-white dark:bg-[#0F1813] shadow-2xl p-6 sm:p-7 z-10 my-8 max-h-[calc(100vh-4rem)] overflow-y-auto text-left"
        >
          {/* Header with Title and Close Button */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E1EBE5] dark:border-[#1D2A23] mb-5">
            <h3 className="text-[20px] sm:text-[22px] font-bold tracking-tight text-[#0C1A13] dark:text-[#E8F5EE]">
              {applicationToEdit ? 'Edit application' : 'New application'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#E1EBE5]/60 dark:bg-[#142019] text-[#54635B] dark:text-[#8AA097] hover:text-[#0C1A13] dark:hover:text-[#E8F5EE] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Primary Fields Group */}
            <div className="space-y-3.5 ">
              {/* Company & Role */}
              <div className="space-y-3 ">
                <div>
                  <label className="text-[13px] text-[#54635B] dark:text-[#8AA097] block mb-1">
                    Company name
                  </label>
                  <input
                    ref={firstInputRef}
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className={`w-full h-11 px-3.5 rounded-[14px] bg-[#F7FBF8] dark:bg-[#142019] text-[15px] text-[#0C1A13] dark:text-[#E8F5EE] placeholder-[#54635B] dark:placeholder-[#8AA097] outline-none focus:ring-2 focus:ring-[#10B981]/30 transition-all ${
                      errors.companyName ? 'ring-2 ring-[#FF453A]' : ''
                    }`}
                  />

                  {errors.companyName && (
                    <p className="text-[12px] text-[#FF453A] mt-1">{errors.companyName}</p>
                  )}
                </div>

                <div>
                  <label className="text-[13px] text-[#54635B] dark:text-[#8AA097] block mb-1">
                    Role title
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    className={`w-full h-11 px-3.5 rounded-[14px] bg-[#F7FBF8] dark:bg-[#142019] text-[15px] text-[#0C1A13] dark:text-[#E8F5EE] placeholder-[#54635B] dark:placeholder-[#8AA097] outline-none focus:ring-2 focus:ring-[#10B981]/30 transition-all ${
                      errors.role ? 'ring-2 ring-[#FF453A]' : ''
                    }`}
                  />

                  {errors.role && <p className="text-[12px] text-[#FF453A] mt-1">{errors.role}</p>}
                </div>
              </div>

              {/* Stage Segmented Selector */}
              <div>
                <label className="text-[13px] text-[#54635B] dark:text-[#8AA097] block mb-1.5">
                  Pipeline stage
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 p-1 rounded-[14px] bg-[#F7FBF8] dark:bg-[#142019]">
                  {stagesList.map((st) => {
                    const cfg = STAGES_CONFIG[st];
                    const isSelected = stage === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleStageSelect(st)}
                        className={`py-2 px-1 rounded-[10px] text-[12px] font-medium transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-white dark:bg-[#0F1813] text-[#0C1A13] dark:text-[#E8F5EE] shadow-xs'
                            : 'text-[#54635B] dark:text-[#8AA097] hover:text-[#0C1A13] dark:hover:text-[#E8F5EE]'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.dotColor }} />

                        <span className="truncate max-w-full">{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Applied Date & Resume Dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] text-[#54635B] dark:text-[#8AA097] block mb-1">
                    Applied date
                  </label>
                  <input
                    type="date"
                    value={appliedDate}
                    onChange={(e) => setAppliedDate(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-[14px] bg-[#F7FBF8] dark:bg-[#142019] text-[14px] text-[#0C1A13] dark:text-[#E8F5EE] outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[13px] text-[#54635B] dark:text-[#8AA097]">Resume</label>
                    <button
                      type="button"
                      onClick={() => setIsCompactUploadOpen(true)}
                      className="text-[12px] text-[#10B981] hover:underline cursor-pointer"
                    >
                      + Upload
                    </button>
                  </div>
                  <select
                    value={resumeId}
                    onChange={(e) => setResumeId(e.target.value)}
                    className="w-full h-11 px-3 rounded-[14px] bg-[#F7FBF8] dark:bg-[#142019] text-[14px] text-[#0C1A13] dark:text-[#E8F5EE] outline-none"
                  >
                    <option value="">None attached</option>
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* "More details" Collapsible Expander */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowMoreDetails(!showMoreDetails)}
                className="flex items-center gap-1.5 text-[13px] font-medium text-[#10B981] hover:underline cursor-pointer"
              >
                <span>{showMoreDetails ? 'Fewer details' : 'More details'}</span>
                {showMoreDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              <AnimatePresence>
                {showMoreDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-3 pt-3 overflow-hidden"
                  >
                    {/* CTC & Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[13px] text-[#54635B] dark:text-[#8AA097] block mb-1">
                          CTC / Compensation
                        </label>
                        <input
                          type="text"
                          value={ctc}
                          onChange={(e) => setCtc(e.target.value)}
                          placeholder="e.g. $140,000 or 15 LPA"
                          className="w-full h-10 px-3.5 rounded-[14px] bg-[#F7FBF8] dark:bg-[#142019] text-[14px] text-[#0C1A13] dark:text-[#E8F5EE] outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[13px] text-[#54635B] dark:text-[#8AA097] block mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g. Remote / New York"
                          className="w-full h-10 px-3.5 rounded-[14px] bg-[#F7FBF8] dark:bg-[#142019] text-[14px] text-[#0C1A13] dark:text-[#E8F5EE] outline-none"
                        />
                      </div>
                    </div>

                    {/* Job Type & Source */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[13px] text-[#54635B] dark:text-[#8AA097] block mb-1">
                          Job type
                        </label>
                        <select
                          value={jobType}
                          onChange={(e) => setJobType(e.target.value)}
                          className="w-full h-10 px-3 rounded-[14px] bg-[#F7FBF8] dark:bg-[#142019] text-[14px] text-[#0C1A13] dark:text-[#E8F5EE] outline-none"
                        >
                          <option value="Full-time">Full-time</option>
                          <option value="Internship">Internship</option>
                          <option value="Contract">Contract</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[13px] text-[#54635B] dark:text-[#8AA097] block mb-1">
                          Source
                        </label>
                        <select
                          value={source}
                          onChange={(e) => setSource(e.target.value)}
                          className="w-full h-10 px-3 rounded-[14px] bg-[#F7FBF8] dark:bg-[#142019] text-[14px] text-[#0C1A13] dark:text-[#E8F5EE] outline-none"
                        >
                          <option value="LinkedIn">LinkedIn</option>
                          <option value="Referral">Referral</option>
                          <option value="Company site">Company site</option>
                          <option value="Indeed">Indeed</option>
                          <option value="Wellfound">Wellfound</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Link */}
                    <div>
                      <label className="text-[13px] text-[#54635B] dark:text-[#8AA097] block mb-1">
                        Job listing URL
                      </label>
                      <input
                        type="url"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="https://..."
                        className="w-full h-10 px-3.5 rounded-[14px] bg-[#F7FBF8] dark:bg-[#142019] text-[14px] text-[#0C1A13] dark:text-[#E8F5EE] outline-none"
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="text-[13px] text-[#54635B] dark:text-[#8AA097] block mb-1">
                        Notes
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Key contacts, referral notes, questions..."
                        rows={2}
                        className="w-full p-3 rounded-[14px] bg-[#F7FBF8] dark:bg-[#142019] text-[14px] text-[#0C1A13] dark:text-[#E8F5EE] outline-none resize-none"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions: Solid Primary Save & Cancel */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E1EBE5] dark:border-[#1D2A23]">
              <button
                type="button"
                onClick={onClose}
                className="h-11 px-5 rounded-full text-[14px] font-medium text-[#54635B] dark:text-[#8AA097] hover:text-[#0C1A13] dark:hover:text-[#E8F5EE] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-11 px-6 rounded-full bg-[#10B981] text-white text-[14px] font-medium transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isSubmitting ? 'Saving…' : applicationToEdit ? 'Save Changes' : 'Add Application'}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Compact Resume Upload Modal */}
        <CompactResumeUploadModal
          isOpen={isCompactUploadOpen}
          onClose={() => setIsCompactUploadOpen(false)}
          onUploadSuccess={(newResume) => {
            setResumeId(newResume.id);
            setIsCompactUploadOpen(false);
          }}
        />
      </div>
    </AnimatePresence>
  );
};
