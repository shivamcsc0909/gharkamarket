import React, { useEffect, useState } from 'react';
import { Mail, Check, Clock, User as UserIcon } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { ContactRequest } from '../types';

export const ContactRequests: React.FC = () => {
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getContactRequests();
      if (res.success && res.data) setContacts(res.data);
    } catch (e) {
      console.error('Failed to load contacts:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await adminApi.updateContactRequest(id, status);
      fetchContacts();
    } catch (e) {
      console.error('Failed to update contact:', e);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">Customer Inquiries</h1>
        <p className="text-xs text-stone-500">Respond to customer feedback and helpdesk tickets.</p>
      </div>

      <div className="space-y-4">
        {contacts.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center text-stone-400 text-xs">
            No customer inquiries found.
          </div>
        ) : (
          contacts.map((c) => (
            <div key={c.id} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100">
                <div>
                  <h3 className="font-extrabold text-sm text-stone-900">{c.subject}</h3>
                  <span className="text-xs text-stone-500">From: <strong>{c.name}</strong> ({c.email}) {c.phone ? `• ${c.phone}` : ''}</span>
                </div>

                <select
                  value={c.status}
                  onChange={(e) => handleUpdateStatus(c.id, e.target.value)}
                  className="px-3 py-1 text-xs rounded-xl border border-stone-300 bg-white font-bold"
                >
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <p className="text-xs text-stone-600 bg-stone-50 p-4 rounded-2xl border border-stone-100 leading-relaxed">
                {c.message}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
