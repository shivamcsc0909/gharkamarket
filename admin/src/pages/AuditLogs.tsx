import React, { useEffect, useState } from 'react';
import { ShieldAlert, Search, Clock } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { AuditLog } from '../types';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchAction, setSearchAction] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const res = await adminApi.getAuditLogs({ action: searchAction });
        if (res.success && res.data) setLogs(res.data);
      } catch (e) {
        console.error('Failed to load audit logs:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, [searchAction]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Security & Audit Logs</h1>
          <p className="text-xs text-stone-500">Immutable trace of sensitive administrative operations and logins.</p>
        </div>

        <div className="relative max-w-xs">
          <input
            type="text"
            value={searchAction}
            onChange={(e) => setSearchAction(e.target.value)}
            placeholder="Filter action (e.g. login, product)..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs text-stone-600">
          <thead className="bg-stone-50 border-b border-stone-200 text-[10px] uppercase font-bold text-stone-500">
            <tr>
              <th className="p-4">Admin Email</th>
              <th className="p-4">Action</th>
              <th className="p-4">Entity</th>
              <th className="p-4">IP Address</th>
              <th className="p-4">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 font-medium">
            {isLoading ? (
              <tr><td colSpan={5} className="p-8 text-center text-stone-400">Loading audit logs...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-stone-400">No audit logs found.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-stone-50 transition-colors">
                  <td className="p-4 font-bold text-stone-900">{log.admin_email}</td>
                  <td className="p-4">
                    <span className="font-mono text-brand-700 bg-brand-50 px-2 py-0.5 rounded text-[11px] font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-[11px]">{log.entity} {log.entity_id ? `(#${log.entity_id})` : ''}</td>
                  <td className="p-4 font-mono text-stone-400 text-[10px]">{log.ip_address || '127.0.0.1'}</td>
                  <td className="p-4 text-stone-500 text-[10px]">
                    {new Date(log.created_at).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
