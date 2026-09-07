import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  X, 
  Package, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  CreditCard, 
  Info, 
  Sparkles,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { notificationApi, AppNotification, NotificationType } from '../../api/notification.api';
import { useAuth } from '../../context/AuthContext';

interface NotificationCenterProps {
  variant?: 'customer' | 'admin';
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ variant = 'customer' }) => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [pushStatus, setPushStatus] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('default');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Check browser push notification permission
  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setPushStatus('unsupported');
    } else {
      setPushStatus(Notification.permission as any);
    }
  }, []);

  // Fetch notifications every 15 seconds if authenticated
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getNotifications({ limit: 20 }),
    enabled: isAuthenticated,
    refetchInterval: 15000,
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  // Mark single as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mark all as read mutation
  const markAllMutation = useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: notificationApi.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!isAuthenticated) return null;

  // Web Push Subscription Helper
  const handleEnablePush = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support web notifications.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushStatus(permission as any);

      if (permission === 'granted') {
        const vapidPublicKey = await notificationApi.getVapidKey();
        
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready.catch(() => null);
          if (registration && registration.pushManager) {
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
            });
            await notificationApi.subscribePush(subscription.toJSON());
          }
        }
      }
    } catch (err) {
      console.warn('Push subscription failed or skipped:', err);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'ORDER_CREATED':
      case 'ORDER_PROCESSING':
        return <Clock className="text-amber-500" size={16} />;
      case 'ORDER_CONFIRMED':
      case 'ORDER_READY':
        return <Package className="text-emerald-500" size={16} />;
      case 'ORDER_OUT_FOR_DELIVERY':
        return <Truck className="text-sky-500" size={16} />;
      case 'ORDER_DELIVERED':
      case 'ORDER_COMPLETED':
        return <CheckCircle2 className="text-emerald-600" size={16} />;
      case 'ORDER_CANCELLED':
        return <XCircle className="text-rose-500" size={16} />;
      case 'PAYMENT_RECEIVED':
        return <CreditCard className="text-indigo-500" size={16} />;
      case 'LOW_STOCK':
        return <AlertTriangle className="text-rose-600" size={16} />;
      case 'SYSTEM_ALERT':
      default:
        return <Info className="text-slate-500" size={16} />;
    }
  };

  const handleNotificationClick = (item: AppNotification) => {
    if (!item.isRead) {
      markAsReadMutation.mutate(item.id);
    }
    setIsOpen(false);
    if (item.linkUrl) {
      navigate(item.linkUrl);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full transition-all focus:outline-none ${
          variant === 'admin'
            ? 'text-slate-600 hover:text-forest-900 hover:bg-slate-100'
            : 'text-forest-900 hover:bg-forest-100/80'
        }`}
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell size={variant === 'admin' ? 19 : 20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white bg-rose-500 rounded-full shadow-xs animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown / Slide Panel */}
      {isOpen && (
        <div 
          className={`absolute right-0 mt-2 w-80 sm:w-96 max-w-[92vw] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col transition-all animate-in fade-in zoom-in-95 duration-150 ${
            variant === 'admin' ? 'top-full' : 'top-full'
          }`}
          style={{ maxHeight: 'calc(100vh - 120px)' }}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-forest-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-emerald-400" />
              <h3 className="font-semibold text-sm tracking-wide">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllMutation.mutate()}
                  disabled={markAllMutation.isPending}
                  className="text-[11px] text-emerald-300 hover:text-white flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors font-medium"
                  title="Mark all as read"
                >
                  <CheckCheck size={14} />
                  <span className="hidden sm:inline">Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Web Push Banner (If default permission) */}
          {pushStatus === 'default' && (
            <div className="bg-sand-50 border-b border-sand-200 px-3.5 py-2.5 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-emerald-600 shrink-0" />
                <span className="text-xs text-slate-700 font-medium">
                  Enable instant order updates in browser?
                </span>
              </div>
              <button
                onClick={handleEnablePush}
                className="text-xs font-bold bg-forest-800 hover:bg-forest-900 text-white px-2.5 py-1 rounded-lg transition-colors shrink-0"
              >
                Enable
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="overflow-y-auto divide-y divide-slate-100 max-h-[380px] flex-1">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs">Loading alerts...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-sand-100 flex items-center justify-center text-slate-400 mx-auto">
                  <Bell size={20} />
                </div>
                <p className="text-sm font-semibold text-slate-700">No notifications yet</p>
                <p className="text-xs text-slate-400">
                  Updates on your orders and nursery alerts will appear here.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 relative group ${
                    item.isRead 
                      ? 'bg-white hover:bg-slate-50 opacity-80 hover:opacity-100' 
                      : 'bg-emerald-50/40 hover:bg-emerald-50/80 font-medium'
                  }`}
                >
                  {/* Icon Indicator */}
                  <div className="mt-0.5 p-2 rounded-xl bg-white shadow-xs border border-slate-100 shrink-0">
                    {getNotificationIcon(item.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className={`text-xs font-bold leading-tight truncate ${item.isRead ? 'text-slate-800' : 'text-forest-950'}`}>
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatTimeAgo(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-snug line-clamp-2">
                      {item.message}
                    </p>
                    {item.linkUrl && (
                      <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest-700 hover:text-forest-900 pt-0.5">
                        <span>View Details</span>
                        <ExternalLink size={10} />
                      </div>
                    )}
                  </div>

                  {/* Right Actions (Read dot + delete) */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1" title="Unread" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(item.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1 rounded-md transition-opacity"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <span>Showing latest updates</span>
              {variant === 'customer' ? (
                <Link
                  to="/orders"
                  onClick={() => setIsOpen(false)}
                  className="font-semibold text-forest-700 hover:text-forest-900"
                >
                  View All Orders →
                </Link>
              ) : (
                <Link
                  to="/admin/orders"
                  onClick={() => setIsOpen(false)}
                  className="font-semibold text-forest-700 hover:text-forest-900"
                >
                  View Orders Queue →
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper: Format relative time ago
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSecs < 60) return 'Just now';
  const diffInMins = Math.floor(diffInSecs / 60);
  if (diffInMins < 60) return `${diffInMins}m ago`;
  const diffInHours = Math.floor(diffInMins / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Helper: Convert Base64 URL to Uint8Array for Web Push Key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
