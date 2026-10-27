import React, { useEffect, useState } from 'react';
import { Building2, Phone, Mail, Clock, CheckCircle2, MessageSquare } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { CorporateLead } from '../types';

export const CorporateLeads: React.FC = () => {
  const [leads, setLeads] = useState<CorporateLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getCorporateLeads();
      if (res.success && res.data) setLeads(res.data);
    } catch (e) {
      console.error('Failed to load leads:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleUpdateStatus = async (id: number, status: string, notes?: string) => {
    try {
      await adminApi.updateCorporateLead(id, status, notes);
      fetchLeads();
    } catch (e) {
      console.error('Update lead failed:', e);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">Corporate B2B Inquiries</h1>
        <p className="text-xs text-stone-500">Manage incoming requests from office pantries, HRs, and corporate teams.</p>
      </div>

      <div className="space-y-4">
        {leads.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center text-stone-400 text-xs">
            No corporate inquiries received yet.
          </div>
        ) : (
          leads.map((lead) => (
            <div key={lead.id} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-brand-600" />
                    <h3 className="font-extrabold text-base text-stone-900">{lead.company_name}</h3>
                    <span className="text-[10px] text-stone-500 font-bold bg-stone-100 px-2 py-0.5 rounded-md">
                      {lead.employee_count} employees
                    </span>
                  </div>
                  <span className="text-xs text-stone-500 block mt-0.5">Contact: <strong>{lead.contact_person}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={lead.status}
                    onChange={(e) => handleUpdateStatus(lead.id, e.target.value, lead.admin_notes)}
                    className="px-3 py-1.5 text-xs rounded-xl border border-stone-300 bg-white font-bold"
                  >
                    <option value="new">New Inquiry</option>
                    <option value="contacted">Contacted</option>
                    <option value="in_progress">In Progress / Proposal Sent</option>
                    <option value="closed">Closed / Converted</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                  <span className="font-bold text-stone-700 block">Requirement</span>
                  <p className="text-stone-900 font-semibold">{lead.snack_requirement}</p>
                  <p className="text-stone-500">Budget: {lead.estimated_budget || 'Flexible'}</p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                  <span className="font-bold text-stone-700 block">Contact Info</span>
                  <p className="text-stone-900 font-mono">{lead.phone}</p>
                  <p className="text-stone-500 truncate">{lead.email}</p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                  <span className="font-bold text-stone-700 block">Message / Request</span>
                  <p className="text-stone-600 line-clamp-3">{lead.message || 'No additional notes provided.'}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
