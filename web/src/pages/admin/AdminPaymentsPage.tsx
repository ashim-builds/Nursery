import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';
import {
  CreditCard,
  Search,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowDownLeft,
} from 'lucide-react';

export const AdminPaymentsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [method, setMethod] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-payments-list', search, method, status, page],
    queryFn: () =>
      adminApi.getPayments({
        search: search.trim() || undefined,
        method: method || undefined,
        status: status || undefined,
        page,
        limit: 20,
      }),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight flex items-center gap-2.5">
            <CreditCard className="text-forest-700" size={28} />
            <span>Payment Transactions Ledger</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Reconcile digital payment gateways (Khalti, FonePay) and Cash On Delivery collections.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors shadow-xs"
        >
          <RotateCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 text-xs">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search payment ID, order #, transaction ref..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-forest-700"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={method}
            onChange={(e) => {
              setMethod(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-semibold focus:bg-white focus:outline-none"
          >
            <option value="">All Gateways</option>
            <option value="CASH">Cash On Delivery</option>
            <option value="KHALTI">Khalti</option>
            <option value="FONEPAY_QR">Fonepay QR</option>
            <option value="CARD">Debit / Credit Card</option>
          </select>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-semibold focus:bg-white focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PAID">PAID</option>
            <option value="PENDING">PENDING</option>
            <option value="FAILED">FAILED</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!data?.payments || data.payments.length === 0) && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <CreditCard size={40} className="mx-auto text-slate-300" />
          <h3 className="font-serif font-bold text-lg text-slate-800">No Payment Records Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Payment transactions will appear here as orders are placed and settled.
          </p>
        </div>
      )}

      {/* DESKTOP TABLE VIEW */}
      {!isLoading && data?.payments && data.payments.length > 0 && (
        <div className="hidden md:block bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sand-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Transaction ID & Order</th>
                <th className="py-3.5 px-4">Method / Gateway</th>
                <th className="py-3.5 px-4">Gateway Ref</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {data.payments.map((p: any) => (
                <tr key={p.id} className="hover:bg-sand-50/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-slate-900 block">
                      #{p.id.substring(0, 10)}
                    </span>
                    <span className="text-[11px] text-forest-700">
                      Order: {p.order?.orderNumber || p.orderId || 'N/A'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 bg-sand-100 px-2 py-0.5 rounded text-[11px]">
                      {p.method}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                    {p.gatewayRef || p.transactionId || '—'}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    रू {Number(p.amount).toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        p.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right text-slate-400 text-[11px]">
                    {new Date(p.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MOBILE CARD VIEW */}
      {!isLoading && data?.payments && data.payments.length > 0 && (
        <div className="md:hidden space-y-3">
          {data.payments.map((p: any) => (
            <div
              key={p.id}
              className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-slate-900 block">
                    #{p.id.substring(0, 10)}
                  </span>
                  <span className="text-[11px] text-forest-700">
                    Order: {p.order?.orderNumber || p.orderId || 'N/A'}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    p.status === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800'
                      : p.status === 'PENDING'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {p.status}
                </span>
              </div>

              <div className="flex justify-between items-center bg-sand-50/80 p-2.5 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">Gateway</span>
                  <span className="font-bold text-slate-800">{p.method}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">Settled Amount</span>
                  <span className="font-serif font-bold text-slate-900 font-mono">
                    रू {Number(p.amount).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                <span>Ref: {p.gatewayRef || 'COD Manual'}</span>
                <span>{new Date(p.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
