import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { Sprout, Lock, Mail, ArrowRight, KeyRound, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { authApi } from '../api/auth.api';

export const LoginPage: React.FC = () => {
  const { login, loginWithOtp } = useAuth();
  const { showToast } = useUI();
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  const [otpSent, setOtpSent] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      showToast('Welcome back to RJ Flowers!', 'success');
      navigate('/');
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Invalid email or password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email address', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.sendOtp({
        email: email.trim().toLowerCase(),
        type: 'LOGIN',
      });
      showToast(res.message || `Login code sent to ${email}`, 'success');
      setOtpSent(true);
      setResendCooldown(60);
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Failed to send login code', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.trim().length < 4) {
      showToast('Please enter the 6-digit verification code', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await loginWithOtp(email.trim().toLowerCase(), otp.trim());
      showToast('Welcome back to RJ Flowers!', 'success');
      navigate('/');
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Invalid or expired OTP', 'error');
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
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16 pb-24">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-soft space-y-5">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-forest-800 text-emerald-300 flex items-center justify-center mx-auto shadow-sm">
            <Sprout size={24} />
          </div>
          <h1 className="font-serif font-bold text-2xl text-slate-900">Sign In to RJ Flowers</h1>
          <p className="text-xs text-slate-500">Access your plant orders, care guides & wishlist</p>
        </div>

        {/* Tab switcher: Password vs Email OTP */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setAuthMode('PASSWORD'); setOtpSent(false); }}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'PASSWORD' 
                ? 'bg-white text-forest-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock size={13} />
            <span>Password</span>
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('OTP')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'OTP' 
                ? 'bg-white text-forest-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck size={14} />
            <span>Email OTP</span>
          </button>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs py-3 px-4 border border-slate-300 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2.5 active:scale-95 disabled:opacity-50 cursor-pointer"
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
          <span>{isGoogleLoading ? 'Connecting...' : 'Continue with Google'}</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] text-slate-400 font-medium uppercase absolute">
            or {authMode === 'PASSWORD' ? 'password' : 'otp'}
          </span>
        </div>

        {authMode === 'PASSWORD' ? (
          /* Password Form */
          <form onSubmit={handlePasswordLogin} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Mail size={13} /> Email Address
              </label>
              <input
                type="email"
                required
                placeholder="customer@rjflowers.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:border-forest-600 focus:ring-1 focus:ring-forest-600 outline-none text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Lock size={13} /> Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:border-forest-600 focus:ring-1 focus:ring-forest-600 outline-none text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In to Account'}</span>
              <ArrowRight size={14} />
            </button>
          </form>
        ) : (
          /* OTP Form */
          <div className="space-y-4 text-xs">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Mail size={13} /> Registered Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="customer@rjflowers.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:border-forest-600 focus:ring-1 focus:ring-forest-600 outline-none text-xs"
                  />
                  <p className="text-[11px] text-slate-400">We’ll send a 6-digit one-time password to your inbox</p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <KeyRound size={14} />
                  <span>{isLoading ? 'Sending Login Code...' : 'Send Login OTP'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtpLogin} className="space-y-4">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                  <p className="text-xs text-forest-800">
                    Code sent to <strong className="font-bold">{email}</strong>
                  </p>
                </div>

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
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.length < 4}
                  className="w-full bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 size={16} />
                  <span>{isLoading ? 'Verifying...' : 'Verify OTP & Log In'}</span>
                </button>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="font-medium text-slate-600 hover:text-slate-900"
                  >
                    Change Email
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0 || isLoading}
                    onClick={handleSendOtp}
                    className="flex items-center gap-1 font-bold text-forest-700 hover:underline disabled:text-slate-400 disabled:no-underline cursor-pointer"
                  >
                    <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500">
          New to RJ Flowers?{' '}
          <Link to="/register" className="font-bold text-forest-700 hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};
