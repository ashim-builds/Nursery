import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';
import { useUI } from '../../context/UIContext';
import {
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  RotateCw,
  MessageSquare,
  Eye,
  Filter,
} from 'lucide-react';

export const AdminReviewsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [page, setPage] = useState(1);
  const { showToast, confirmAction } = useUI();
  const queryClient = useQueryClient();

  const isApprovedParam =
    statusFilter === 'approved' ? true : statusFilter === 'pending' ? false : undefined;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-reviews-list', statusFilter, page],
    queryFn: () => adminApi.getReviews({ isApproved: isApprovedParam, page, limit: 20 }),
  });

  const moderateMutation = useMutation({
    mutationFn: ({ id, isApproved }: { id: string; isApproved: boolean }) =>
      adminApi.moderateReview(id, isApproved),
    onSuccess: () => {
      showToast('Review moderation status updated', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-reviews-list'] });
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to moderate review', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteReview(id),
    onSuccess: () => {
      showToast('Review removed', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-reviews-list'] });
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to delete review', 'error');
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight flex items-center gap-2.5">
            <Star className="text-forest-700" size={28} />
            <span>Customer Reviews & Photos Moderation</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Moderate plant reviews, verified purchaser ratings, and user-submitted plant photos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status filter pills */}
          <div className="flex bg-slate-200/80 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'all' ? 'bg-white text-forest-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'pending' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'approved' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Approved
            </button>
          </div>

          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            <RotateCw size={14} />
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!data?.reviews || data.reviews.length === 0) && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <MessageSquare size={40} className="mx-auto text-slate-300" />
          <h3 className="font-serif font-bold text-lg text-slate-800">No Reviews In Queue</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Customer reviews submitted from product detail pages will show up here for moderation.
          </p>
        </div>
      )}

      {/* DESKTOP TABLE VIEW */}
      {!isLoading && data?.reviews && data.reviews.length > 0 && (
        <div className="hidden md:block bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sand-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Plant & Reviewer</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4">Comment</th>
                <th className="py-3.5 px-4">Photo</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {data.reviews.map((r: any) => (
                <tr key={r.id} className="hover:bg-sand-50/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{r.product?.title || 'Botanical Plant'}</span>
                    <span className="text-[11px] text-slate-500">{r.customerName}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          fill={i < r.rating ? 'currentColor' : 'none'}
                          className={i < r.rating ? 'text-amber-400' : 'text-slate-200'}
                        />
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs text-slate-600">
                    <p className="line-clamp-2">{r.comment}</p>
                  </td>

                  <td className="py-3.5 px-4">
                    {r.plantPhotoUrl ? (
                      <img
                        src={r.plantPhotoUrl}
                        alt="Customer plant"
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      />
                    ) : (
                      <span className="text-slate-300 text-[11px]">None</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        r.isApproved
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {r.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    {!r.isApproved ? (
                      <button
                        onClick={() => moderateMutation.mutate({ id: r.id, isApproved: true })}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors shadow-xs"
                        title="Approve Review"
                      >
                        Approve
                      </button>
                    ) : (
                      <button
                        onClick={() => moderateMutation.mutate({ id: r.id, isApproved: false })}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-[11px] transition-colors"
                        title="Unpublish / Move to Pending"
                      >
                        Hide
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        if (await confirmAction('Delete review permanently?', { title: 'Delete review', confirmLabel: 'Delete' })) {
                          deleteMutation.mutate(r.id);
                        }
                      }}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Review"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MOBILE CARD VIEW */}
      {!isLoading && data?.reviews && data.reviews.length > 0 && (
        <div className="md:hidden space-y-3">
          {data.reviews.map((r: any) => (
            <div
              key={r.id}
              className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3 text-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{r.product?.title || 'Botanical Plant'}</h3>
                  <p className="text-slate-500">By {r.customerName}</p>
                </div>

                <div className="flex items-center gap-0.5 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      fill={i < r.rating ? 'currentColor' : 'none'}
                      className={i < r.rating ? 'text-amber-400' : 'text-slate-200'}
                    />
                  ))}
                </div>
              </div>

              <p className="text-slate-700 bg-sand-50/80 p-3 rounded-2xl border border-slate-100 italic">
                "{r.comment}"
              </p>

              {r.plantPhotoUrl && (
                <img
                  src={r.plantPhotoUrl}
                  alt="Customer plant"
                  className="w-full h-32 rounded-2xl object-cover border border-slate-200"
                />
              )}

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    r.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {r.isApproved ? 'Approved' : 'Pending Moderation'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                      onClick={async () => {
                        if (await confirmAction('Delete review permanently?', { title: 'Delete review', confirmLabel: 'Delete' })) {
                        deleteMutation.mutate(r.id);
                      }
                    }}
                    className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-rose-600"
                  >
                    <Trash2 size={14} />
                  </button>
                  {!r.isApproved ? (
                    <button
                      onClick={() => moderateMutation.mutate({ id: r.id, isApproved: true })}
                      className="px-3.5 py-2 rounded-xl bg-forest-800 text-white font-bold text-xs shadow-xs"
                    >
                      Approve
                    </button>
                  ) : (
                    <button
                      onClick={() => moderateMutation.mutate({ id: r.id, isApproved: false })}
                      className="px-3 py-2 rounded-xl bg-amber-100 text-amber-800 font-bold text-xs"
                    >
                      Hide
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
