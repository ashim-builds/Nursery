import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';
import { useUI } from '../../context/UIContext';
import {
  Bell,
  Send,
  CheckCircle2,
  Sparkles,
  Users,
  Megaphone,
  Link as LinkIcon,
} from 'lucide-react';

export const AdminNotificationsPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'ANNOUNCEMENT' | 'PROMOTION' | 'CARE_REMINDER'>('ANNOUNCEMENT');
  const [linkUrl, setLinkUrl] = useState('');
  const { showToast, confirmAction } = useUI();

  const broadcastMutation = useMutation({
    mutationFn: (payload: any) => adminApi.broadcastNotification(payload),
    onSuccess: () => {
      showToast('Broadcast notification dispatched to all registered customers!', 'success');
      setTitle('');
      setMessage('');
      setLinkUrl('');
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to dispatch broadcast', 'error');
    },
  });

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      showToast('Please enter both title and message', 'error');
      return;
    }

    if (await confirmAction(`Broadcast notification "${title}" to all customers?`, { title: 'Broadcast notification', confirmLabel: 'Broadcast' })) {
      broadcastMutation.mutate({
        title,
        message,
        type,
        linkUrl: linkUrl || undefined,
      });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight flex items-center gap-2.5">
          <Bell className="text-forest-700" size={28} />
          <span>Customer Notifications & Announcements</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Broadcast promotional alerts, seasonal nursery discounts, or monsoon plant care reminders.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-6">
        <div className="flex items-center gap-3 p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-900">
          <Megaphone size={20} className="text-emerald-700 shrink-0" />
          <span>
            Broadcasts instantly appear in customer accounts and push notification banners across Kathmandu & Nepal.
          </span>
        </div>

        <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Notification Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 🌿 Monsoon Plant Sale is Live! Get 20% Off"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-forest-700 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Notification Category / Tag
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:bg-white focus:outline-none focus:border-forest-700"
              >
                <option value="ANNOUNCEMENT">General Announcement</option>
                <option value="PROMOTION">Special Promo / Sale</option>
                <option value="CARE_REMINDER">Monsoon & Seasonal Care Tip</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Destination Link URL (Optional)
              </label>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="/catalog?category=indoor-plants"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-forest-700"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Message Content *
            </label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write the announcement message for customers..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-forest-700"
            />
          </div>

          {/* Live Preview Bubble */}
          {title && (
            <div className="p-4 bg-sand-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Notification Customer Preview
              </span>
              <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
              <p className="text-slate-600 text-xs">{message || 'Message preview text...'}</p>
              {linkUrl && (
                <span className="text-[11px] text-forest-700 font-semibold block pt-1">
                  Tap to view → {linkUrl}
                </span>
              )}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={broadcastMutation.isPending}
              className="px-6 py-3 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs uppercase tracking-wider shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              {broadcastMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={15} />
                  <span>Send Broadcast Push</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
