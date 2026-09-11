import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { Sprout, Lock, Mail, User, Phone, MapPin, ArrowRight, KeyRound, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { authApi } from '../api/auth.api';

export const RegisterPage: React.FC = () => {
  const { registerWithOtp } = useAuth();
  const { showToast } = useUI();
  const navigate = useNavigate();

  // Step 1: Form details, Step 2: OTP verification
  const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Pokhara');
  const [otp, setOtp] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // Countdown timer for resending OTP
  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Strict Name Validation: No numbers allowed
    if (!/^[a-zA-Z\s\.\'-]+$/.test(fullName.trim())) {
      showToast('Full Name cannot contain numbers or special symbols', 'error');
      return;
    }

    // Strict Phone Validation: 10 digits starting with 9
    if (phoneNumber && !/^[9][0-9]{9}$/.test(phoneNumber.trim())) {
      showToast('Phone number must be exactly 10 digits and start with 9', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.sendOtp({
        email: email.trim().toLowerCase(),
        type: 'REGISTER',
        fullName: fullName.trim(),
      });
      showToast(res.message || `Verification code sent to ${email}`, 'success');
      setStep('OTP');
      setResendCooldown(60);
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Failed to send verification code', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    try {
      const res = await authApi.sendOtp({
        email: email.trim().toLowerCase(),
        type: 'REGISTER',
        fullName: fullName.trim(),
      });
      showToast(res.message || `New code sent to ${email}`, 'success');
      setResendCooldown(60);
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Failed to resend code', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.trim().length < 4) {
      showToast('Please enter the 6-digit verification code', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await registerWithOtp({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        otp: otp.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
      });
      showToast('Welcome to the RJ Flowers community!', 'success');
      navigate('/');
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Verification failed. Please check the code and try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const url = await authApi.getGoogleAuthUrl();
      if (url) {
        window.location.href = url;
      } else {
        showToast('Google OAuth is not configured yet on this server.', 'info');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Google OAuth connection failed', 'error');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 pb-24">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-soft space-y-5">
        
        {step === 'DETAILS' ? (
          <>
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-forest-800 text-emerald-300 flex items-center justify-center mx-auto shadow-sm">
                <Sprout size={24} />
              </div>
              <h1 className="font-serif font-bold text-2xl text-slate-900">Create Account</h1>
              <p className="text-xs text-slate-500">Join RJ Flowers & Nursery community with Email verification</p>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs py-3 px-4 border border-slate-300 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2.5 active:scale-95 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isGoogleLoading ? 'Connecting...' : 'Sign up with Google'}</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] text-slate-400 font-medium uppercase absolute">
                or sign up with email
              </span>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center gap-1">
                  <User size={13} /> Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suman Shakya"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:border-forest-600 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center gap-1">
                  <Mail size={13} /> Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="suman@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:border-forest-600 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center gap-1">
                  <Lock size={13} /> Password (min. 6 chars) *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:border-forest-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <Phone size={13} /> Mobile No. (10 digits)
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="98XXXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:border-forest-600 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <MapPin size={13} /> City
                  </label>
                  <input
                    type="text"
                    placeholder="Pokhara"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:border-forest-600 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center gap-1">
                  <MapPin size={13} /> Street Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Arghau Chowk, near RJ Flowers"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:border-forest-600 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Sending verification code...' : 'Get Verification Code (OTP)'}</span>
                <ArrowRight size={14} />
              </button>
            </form>
          </>
        ) : (
          /* Step 2: OTP Verification */
          <div className="space-y-5">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-forest-800 flex items-center justify-center mx-auto shadow-xs">
                <KeyRound size={24} />
              </div>
              <h1 className="font-serif font-bold text-2xl text-slate-900">Verify Your Email</h1>
              <p className="text-xs text-slate-600">
                We sent a 6-digit code to <strong className="text-forest-800 font-semibold">{email}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyAndRegister} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center justify-center gap-1">
                  Enter 6-digit Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] font-mono border-2 border-forest-600 bg-emerald-50/40 rounded-2xl focus:ring-4 focus:ring-emerald-100 outline-none"
                />
                <p className="text-[11px] text-center text-slate-400">Code is valid for 10 minutes</p>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length < 4}
                className="w-full bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 size={16} />
                <span>{isLoading ? 'Verifying & Registering...' : 'Verify OTP & Complete Registration'}</span>
              </button>
            </form>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
              <button
                type="button"
                onClick={() => setStep('DETAILS')}
                className="flex items-center gap-1 font-medium text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft size={13} /> Edit details
              </button>

              <button
                type="button"
                disabled={resendCooldown > 0 || isLoading}
                onClick={handleResendOtp}
                className="flex items-center gap-1 font-bold text-forest-700 hover:underline disabled:text-slate-400 disabled:no-underline cursor-pointer"
              >
                <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
              </button>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-forest-700 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
