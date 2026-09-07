import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';
import {
  ShieldAlert,
  RotateCw,
  Search,
  Activity,
  Code,
  Clock,
  User,
} from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const [limit, setLimit] = useState(50);
  const [search, setSearch] = useState('');

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ['admin-audit-logs-page', limit],
    queryFn: () => adminApi.getAuditLogs(limit),
  });

  const filteredLogs = logs?.filter((log: any) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      log.action?.toLowerCase().includes(query) ||
      log.resource?.toLowerCase().includes(query) ||
      log.user?.fullName?.toLowerCase().includes(query) ||
      log.user?.email?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="text-forest-700" size={28} />
            <span>Security & Operational Audit Logs</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Immutable system trails of administrative stock adjustments, order modifications, and coupon events.
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
            placeholder="Filter logs by action, user, or resource..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-forest-700"
          />
        </div>

        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-semibold focus:bg-white focus:outline-none"
        >
          <option value="25">Show 25 records</option>
          <option value="50">Show 50 records</option>
          <option value="100">Show 100 records</option>
        </select>
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
      {!isLoading && (!filteredLogs || filteredLogs.length === 0) && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Activity size={40} className="mx-auto text-slate-300" />
          <h3 className="font-serif font-bold text-lg text-slate-800">No Audit Logs</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Administrative actions will be automatically audited and indexed here.
          </p>
        </div>
      )}

      {/* DESKTOP TABLE VIEW */}
      {!isLoading && filteredLogs && filteredLogs.length > 0 && (
        <div className="hidden md:block bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sand-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Admin / Staff User</th>
                <th className="py-3.5 px-4">Target Resource</th>
                <th className="py-3.5 px-4">Payload / Details</th>
                <th className="py-3.5 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredLogs.map((log: any) => (
                <tr key={log.id} className="hover:bg-sand-50/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-slate-900 bg-sand-100 px-2 py-0.5 rounded text-[11px]">
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-900 block">
                      {log.user?.fullName || log.userId || 'System'}
                    </span>
                    <span className="text-[10px] text-slate-400">{log.user?.email || 'System Agent'}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-forest-800">{log.resource}</span>
                    {log.resourceId && (
                      <span className="font-mono text-[10px] text-slate-400 block">
                        #{log.resourceId.substring(0, 10)}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 max-w-md font-mono text-[11px] text-slate-600 truncate">
                    {log.details ? (
                      typeof log.details === 'string' ? (
                        log.details
                      ) : (
                        JSON.stringify(log.details)
                      )
                    ) : (
                      '—'
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right text-slate-400 text-[11px] shrink-0 font-mono">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MOBILE CARD VIEW */}
      {!isLoading && filteredLogs && filteredLogs.length > 0 && (
        <div className="md:hidden space-y-3">
          {filteredLogs.map((log: any) => (
            <div
              key={log.id}
              className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900 bg-sand-100 px-2.5 py-0.5 rounded-lg text-xs">
                  {log.action}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Actor:</span>
                  <span className="font-semibold text-slate-800">
                    {log.user?.fullName || 'System Admin'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Resource:</span>
                  <span className="font-mono text-forest-800 font-semibold">{log.resource}</span>
                </div>
              </div>

              {log.details && (
                <div className="bg-sand-50/80 p-2 rounded-xl text-[10px] font-mono text-slate-600 truncate">
                  {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
