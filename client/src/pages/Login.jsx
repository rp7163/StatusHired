import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { Footer } from '../components/layout/Footer.jsx';
import {
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  Database,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ShieldCheck,
  RotateCcw,
  ArrowLeft,
  Mail,
  AlertCircle,
} from 'lucide-react';
import { DatabaseSetupModal } from '../components/DatabaseSetupModal.jsx';
import { StatusHiredLogo } from '../components/ui/StatusHiredLogo.jsx';
import { BiometricEnrollmentModal } from '../components/BiometricEnrollmentModal.jsx';
import { isPlatformBiometricsAvailable, getBiometricEnrollment } from '../lib/biometrics.js';

export const Login = () => {
  useDocumentTitle({
    title: 'Sign In · StatusHired',
    description: 'Sign in to StatusHired to track job applications, manage resumes, and organize interview stages in your career pipeline.',
    canonicalPath: '/login',
    robots: 'index, follow',
  });
  const { user, isConfigured, signInWithEmail, signUpWithEmail, verifyOtp, resendVerificationOtp } =
    useAuth();

  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // One-time Security Sign-Up Step states
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState(null);

  // Optional one-time biometric prompt for newly registered user
  const [pendingBiometricUser, setPendingBiometricUser] = useState(null);

  const [showKeyInstructions, setShowKeyInstructions] = useState(false);
  const [isDbSetupModalOpen, setIsDbSetupModalOpen] = useState(false);

  // Timer effect for resend cooldown
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCooldown]);

  const validate = () => {
    const errs = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const checkAndOfferBiometrics = async (userId, userEmail) => {
    try {
      const supported = await isPlatformBiometricsAvailable();
      const existing = getBiometricEnrollment(userId);
      if (supported && !existing.isEnrolled) {
        setPendingBiometricUser({ id: userId, email: userEmail });
      }
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});
    setDeliveryNote(null);

    try {
      if (mode === 'signin') {
        const { error } = await signInWithEmail(email.trim(), password);
        if (error) {
          const msg = error.message.toLowerCase().includes('invalid')
            ? 'Incorrect email or password. Please try again.'
            : error.message;
          setErrors({ general: msg });
        }
      } else {
        // Sign-up: server emails a 6-digit code. Account is created only after it is verified.
        const { error, data } = await signUpWithEmail(email.trim(), password);
        if (error) {
          setErrors({ general: error.message });
          return;
        }
        if (data?.devNote) {
          // Email is not configured on the server (development): the code is in the server terminal
          setDeliveryNote('Email is not configured on the server. Your 6-digit code was printed in the server terminal.');
        }
        setIsVerifyingOtp(true);
        setOtpCode('');
        setResendSuccess(false);
        setResendCooldown(30);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const cleanOtp = otpCode.trim();
    if (!cleanOtp) {
      setErrors({ otp: 'Please enter the 6-digit verification code.' });
      return;
    }

    if (cleanOtp.length !== 6) {
      setErrors({ otp: 'The verification code must be 6 digits.' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const { data, error } = await verifyOtp(email.trim(), cleanOtp);
      if (error) {
        setErrors({ otp: error.message });
      } else if (data?.user) {
        setIsVerifyingOtp(false);
        await checkAndOfferBiometrics(data.user.id, email.trim());
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setIsLoading(true);
    setResendSuccess(false);
    setErrors({});
    setDeliveryNote(null);

    try {
      const { error } = await resendVerificationOtp(email.trim());
      if (error) {
        setDeliveryNote(error.message);
        return;
      }
      setResendSuccess(true);
      setResendCooldown(30);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'signin' ? 'signup' : 'signin'));
    setErrors({});
    setIsVerifyingOtp(false);
    setDeliveryNote(null);
  };

  // Safe redirect AFTER all hooks have executed unconditionally
  if (user && !pendingBiometricUser) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F7FBF8] dark:bg-[#060A08] text-[#0C1A13] dark:text-[#E8F5EE] flex flex-col justify-center items-center px-4 py-12 transition-colors !overflow-y-hidden">
      <div className="w-full max-w-[420px] flex flex-col items-center">
        {/* Top App Branding */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="mb-3.5">
            <StatusHiredLogo size={56} />
          </div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#0C1A13] dark:text-[#E8F5EE]">
            Status<span className="text-[#10B981]">Hired</span>
          </h1>
          <p className="text-[15px] text-[#54635B] dark:text-[#8AA097] mt-1">
            Every application. One calm place to get hired.
          </p>
        </div>

        {/* Server / Database Status Banner */}
        <div className="w-full mb-4 p-4 rounded-[20px] bg-white dark:bg-[#0F1813] shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:border dark:border-[#1D2A23] transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isConfigured ? 'bg-[#10f348] animate-pulse w-3 h-3' : 'bg-red-500 animate-plus w-3 h-3'
                }`}
              />

              <span className="text-[15px] font-semibold text-[#0C1A13] dark:text-[#E8F5EE]">
                {isConfigured ? 'Ready to use' : 'Please wait 1 minute before signing up'}
              </span>
            </div>
            {/* {!isConfigured && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDbSetupModalOpen(true)}
                  className="text-[12px] text-[#10B981] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  How to start the server?
                </button>
                <span className="text-[#54635B] text-[12px]">•</span>
                <button
                  type="button"
                  onClick={() => setShowKeyInstructions(!showKeyInstructions)}
                  className="text-[12px] text-[#10B981] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  Quick steps{' '}
                  {showKeyInstructions ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )} */}
          </div>

          {/* {showKeyInstructions && !isConfigured && (
            <div className="mt-4 pt-3 border-t border-[#E1EBE5] dark:border-[#1D2A23] text-[12px] text-[#54635B] dark:text-[#8AA097] space-y-2">
              <p className="font-medium text-[#0C1A13] dark:text-[#E8F5EE]">
                To connect the app to your MongoDB backend:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 pl-1">
                <li>
                  Run a local MongoDB or create a free cluster at{' '}
                  <a
                    href="https://www.mongodb.com/atlas"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#10B981] hover:underline"
                  >
                    mongodb.com/atlas
                  </a>
                </li>
                <li>
                  Copy <code className="bg-[#F7FBF8] dark:bg-[#142019] px-1 py-0.5 rounded font-mono">server/.env.example</code>{' '}
                  to <code className="bg-[#F7FBF8] dark:bg-[#142019] px-1 py-0.5 rounded font-mono">server/.env</code>
                </li>
                <li>
                  Set <strong>MONGODB_URI</strong> and a random <strong>JWT_SECRET</strong>
                </li>
                <li>
                  Start the API:{' '}
                  <code className="bg-[#F7FBF8] dark:bg-[#142019] px-1 py-0.5 rounded font-mono">cd server && npm run dev</code>
                </li>
                <li>Refresh this page — the indicator turns green when the API is connected</li>
              </ol>
              <button
                type="button"
                onClick={() => setIsDbSetupModalOpen(true)}
                className="w-full mt-2 py-1.5 px-3 rounded-[10px] bg-[#10B981]/10 text-[#10B981] text-xs font-medium hover:bg-[#10B981]/15 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Database className="w-3.5 h-3.5" />
                Open Full Setup Guide
              </button>
            </div>
          )} */}
        </div>

        {/* Form Card */}
        <div className="w-full bg-white dark:bg-[#0F1813] rounded-[22px] p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border dark:border-[#1D2A23] transition-colors">
          {isVerifyingOtp ? (
            /* One-Time Email Verification (OTP sent to user's email) */
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center mx-auto mb-1">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#0C1A13] dark:text-[#E8F5EE]">Verify Your Email</h3>
                <p className="text-[13.5px] text-[#54635B] dark:text-[#8AA097] leading-relaxed">
                  We sent a 6-digit confirmation code to{' '}
                  <strong className="text-[#0C1A13] dark:text-[#E8F5EE] font-semibold">{email}</strong>. Check
                  your inbox and enter the code below to complete sign-up.
                </p>

                {deliveryNote && (
                  <div className="mt-2 p-2.5 rounded-[12px] bg-[#FF9F0A]/10 border border-[#FF9F0A]/20 text-[12px] text-[#FF9F0A] flex items-start gap-2 text-left">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{deliveryNote}</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-[#54635B] dark:text-[#8AA097] block text-center">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    autoFocus
                    className="w-full h-12 px-4 rounded-[12px] bg-[#F7FBF8] dark:bg-[#142019] text-[#0C1A13] dark:text-[#E8F5EE] text-center font-mono text-[24px] tracking-[0.3em] placeholder:text-[#54635B] dark:placeholder:text-[#8AA097] outline-none focus:ring-2 focus:ring-[#10B981] transition-all"
                  />

                  {errors.otp && (
                    <p className="text-xs text-[#FF453A] mt-1 text-center font-medium">{errors.otp}</p>
                  )}
                </div>

                {resendSuccess && (
                  <div className="p-2.5 rounded-[12px] bg-[#30D158]/10 text-[#30D158] text-xs text-center flex items-center justify-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>A new 6-digit verification code was sent to your email!</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length !== 6}
                  className="w-full h-[44px] rounded-full bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-white text-[15px] font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify &amp; Create Account</span>
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 flex items-center justify-between text-xs text-[#54635B] dark:text-[#8AA097]">
                <button
                  type="button"
                  onClick={() => setIsVerifyingOtp(false)}
                  className="hover:underline flex items-center gap-1 cursor-pointer text-[#54635B] hover:text-[#0C1A13] dark:hover:text-[#E8F5EE]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Change email
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isLoading}
                  className="text-[#10B981] hover:underline font-medium disabled:opacity-50 cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                </button>
              </div>
            </div>
          ) : (
            /* Standard Email & Password Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-[#54635B] dark:text-[#8AA097] block">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className="w-full h-12 px-4 rounded-[12px] bg-[#F7FBF8] dark:bg-[#142019] text-[#0C1A13] dark:text-[#E8F5EE] text-[15px] placeholder:text-[#54635B] dark:placeholder:text-[#8AA097] outline-none focus:ring-2 focus:ring-[#10B981] transition-all"
                />

                {errors.email && <p className="text-xs text-[#FF453A] mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-medium text-[#54635B] dark:text-[#8AA097] block">
                    Password
                  </label>
                  {mode === 'signup' && (
                    <span className="text-[11px] text-[#54635B] dark:text-[#8AA097]">Min. 6 characters</span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    className="w-full h-12 pl-4 pr-11 rounded-[12px] bg-[#F7FBF8] dark:bg-[#142019] text-[#0C1A13] dark:text-[#E8F5EE] text-[15px] placeholder:text-[#54635B] dark:placeholder:text-[#8AA097] outline-none focus:ring-2 focus:ring-[#10B981] transition-all"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#54635B] dark:text-[#8AA097] hover:text-[#0C1A13] dark:hover:text-[#E8F5EE] p-1 cursor-pointer focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-[#FF453A] mt-1">{errors.password}</p>}
              </div>

              {/* One-Time Security Notice on Sign-Up */}
              {mode === 'signup' && (
                <div className="p-3 rounded-[12px] bg-[#10B981]/8 border border-[#10B981]/15 flex items-start gap-2.5 text-[12px] text-[#0C1A13] dark:text-[#E8F5EE] leading-relaxed">
                  <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                  <span>
                    <strong>1-Time Security:</strong> A 6-digit confirmation code will be sent to your email to verify ownership. Your account is only created after the code is verified.
                  </span>
                </div>
              )}

              {/* General Error message */}
              {errors.general && (
                <div className="p-3 rounded-[12px] bg-[#FF453A]/10 text-[#FF453A] text-xs font-medium">
                  {errors.general}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mx-auto px-4  h-[40px] rounded-2xl bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-white text-[15px] font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-xs mt-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin !min-w-10" />
                ) : mode === 'signin' ? (
                  'Sign in'
                ) : (
                  'Send Verification Code'
                )}
              </button>
              
            </form>
          )}
        </div>

        {/* Bottom Toggle Link */}
        {!isVerifyingOtp && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-[14px] text-[#10B981] hover:underline font-medium cursor-pointer"
            >
              {mode === 'signin' ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
            </button>
          </div>
        )}
      </div>

      {/* Option 2: One-Time Device Biometrics Setup Modal */}
      <BiometricEnrollmentModal
        isOpen={Boolean(pendingBiometricUser)}
        userId={pendingBiometricUser?.id || ''}
        userEmail={pendingBiometricUser?.email || ''}
        onComplete={() => setPendingBiometricUser(null)}
        onSkip={() => setPendingBiometricUser(null)}
      />

      <DatabaseSetupModal isOpen={isDbSetupModalOpen} onClose={() => setIsDbSetupModalOpen(false)} />
      {/* <Footer className=" w-full !mt-3 border-none bg-inherit" /> */}
      <Footer
        copyrightText="Designed and developed by"
        authorName="Rudra Patel"
        content="If you are unable to sign in, contact "
        feedbackEmail = '23bcp401@sot.pdpu.ac.in'
        className="w-full !mt-3 border-none bg-inherit"
      />
    </div>
  );
};
