import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { Lock, ArrowRight, Sprout, AlertCircle, Shield } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { adminPasswordLogin, isAuthenticated, isAdmin, isLoading, user } = useAuth();
  const { showToast } = useUI();
  const navigate = useNavigate();

  // If already authenticated as ADMIN, redirect immediately
  if (!isLoading && (isAdmin || user?.role === 'ADMIN')) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter the admin password');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await adminPasswordLogin(password.trim());
      showToast('Welcome to Nursery Admin Panel!', 'success');
      navigate('/admin', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Incorrect admin password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-forest-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 relative overflow-hidden">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-forest-800 border border-emerald-500/40 text-emerald-400 shadow-xl mb-4">
          <Shield size={32} />
        </div>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-white tracking-tight">
          Nursery Admin Login
        </h1>
        <p className="mt-1.5 text-xs text-forest-200">
          Enter admin password to manage orders and products
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-forest-900/90 border border-forest-800 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl sm:px-10 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-950/70 border border-rose-800 text-rose-200 text-xs rounded-2xl flex items-start gap-2.5">
              <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-2">
                Admin Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400" />
                <input
                  type="password"
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password..."
                  className="w-full bg-forest-950/90 border border-forest-700 rounded-xl pl-10 pr-3.5 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-forest-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-forest-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Enter Admin Panel</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <div className="border-t border-forest-800/80 pt-4 text-center">
            <Link
              to="/"
              className="text-xs text-forest-300 hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
            >
              <span>← Back to Customer Website</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
