import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUI } from '../context/UIContext';
import { Sprout, Mail, ArrowLeft, Info } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const { showToast } = useUI();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    showToast('Password reset by email is not configured yet', 'info');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-soft">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-forest-800 text-white flex items-center justify-center mx-auto shadow-sm">
            <Sprout size={24} />
          </div>
          <h1 className="font-serif font-bold text-2xl text-slate-900">Reset Password</h1>
          <p className="text-xs text-slate-500">
            Enter your email address and we'll send you instructions to reset your account password.
          </p>
        </div>

        <div className="p-6 bg-sand-50/70 border border-sand-200 rounded-2xl text-center space-y-3">
            <Info size={32} className="mx-auto text-amber-600" />
            <h2 className="font-bold text-sm text-slate-900">Reset email unavailable</h2>
            <p className="text-xs text-slate-600">
              SMTP password recovery has not been configured on this server. Please contact an administrator to reset the account.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Email Address</label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-3 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 border border-slate-300 rounded-xl focus:border-forest-700 focus:outline-none min-h-[44px]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs py-3.5 rounded-2xl shadow transition-all min-h-[44px]"
            >
              Send Reset Link
            </button>
          </form>

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-forest-800 min-h-[44px]"
          >
            <ArrowLeft size={14} />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
