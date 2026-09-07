import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { Sprout, Lock, Mail, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useUI();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      showToast('Welcome back to KtmBotanica!', 'success');
      navigate('/');
    } catch (err: any) {
      showToast(err.message || 'Invalid email or password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16 pb-24">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-soft space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-forest-800 text-emerald-300 flex items-center justify-center mx-auto shadow-sm">
            <Sprout size={24} />
          </div>
          <h1 className="font-serif font-bold text-2xl text-slate-900">Sign In to KtmBotanica</h1>
          <p className="text-xs text-slate-500">Access your plant orders, care guides & wishlist</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <Mail size={13} /> Email Address
            </label>
            <input
              type="email"
              required
              placeholder="customer@ktmbotanica.com"
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

          {/* Demo credential helper pill */}
          <div className="p-3 bg-forest-50/80 rounded-xl border border-forest-100 text-[11px] text-forest-800 space-y-1">
            <span className="font-bold block">Demo Accounts:</span>
            <div className="text-slate-600 space-y-0.5">
              <div><strong>Admin:</strong> admin@ktmbotanica.com / Admin@12345</div>
              <div><strong>Customer:</strong> customer@ktmbotanica.com / Customer@12345</div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In to Account'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500">
          New to KtmBotanica?{' '}
          <Link to="/register" className="font-bold text-forest-700 hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};
