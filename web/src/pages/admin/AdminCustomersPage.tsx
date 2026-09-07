import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';
import {
  Users,
  Search,
  RotateCw,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  CreditCard,
} from 'lucide-react';

export const AdminCustomersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-customers-list', search, page],
    queryFn: () =>
      adminApi.getCustomers({
        search: search.trim() || undefined,
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
            <Users className="text-forest-700" size={28} />
            <span>Customer Directory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            View registered plant enthusiasts, order history count, and lifetime customer value.
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

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers by name, phone, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-forest-700"
          />
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
      {!isLoading && (!data?.customers || data.customers.length === 0) && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Users size={40} className="mx-auto text-slate-300" />
          <h3 className="font-serif font-bold text-lg text-slate-800">No Customers Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or register a new customer on the storefront.
          </p>
        </div>
      )}

      {/* DESKTOP TABLE VIEW */}
      {!isLoading && data?.customers && data.customers.length > 0 && (
        <div className="hidden md:block bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sand-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4 text-center">Orders Placed</th>
                <th className="py-3.5 px-4 text-right">Lifetime Spend</th>
                <th className="py-3.5 px-4 text-right">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {data.customers.map((c: any) => (
                <tr key={c.id} className="hover:bg-sand-50/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-forest-100 text-forest-800 flex items-center justify-center font-bold text-xs shrink-0">
                        {c.fullName?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{c.fullName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {c.id.substring(0, 8)}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-slate-800">{c.email || 'No email'}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{c.phoneNumber || 'No phone'}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.role === 'ADMIN'
                          ? 'bg-rose-100 text-rose-800'
                          : c.role === 'STAFF'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {c.role}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center font-bold font-mono text-slate-900">
                    {c._count?.orders ?? c.orderCount ?? 0}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-bold text-forest-900">
                    रू {Number(c.totalSpent || 0).toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 text-right text-slate-400 text-[11px]">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MOBILE CARD VIEW */}
      {!isLoading && data?.customers && data.customers.length > 0 && (
        <div className="md:hidden space-y-3">
          {data.customers.map((c: any) => (
            <div
              key={c.id}
              className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-forest-100 text-forest-800 flex items-center justify-center font-bold text-sm">
                    {c.fullName?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{c.fullName}</h3>
                    <span className="text-[10px] text-slate-400">
                      Joined {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    c.role === 'ADMIN' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {c.role}
                </span>
              </div>

              <div className="space-y-1 bg-sand-50/80 p-2.5 rounded-2xl border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-medium text-slate-900">{c.email || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-mono text-slate-800">{c.phoneNumber || '—'}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block">Orders</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {c._count?.orders ?? c.orderCount ?? 0}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Lifetime Spend</span>
                  <span className="font-serif font-bold text-sm text-forest-950 font-mono">
                    रू {Number(c.totalSpent || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
