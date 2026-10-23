'use client';

import React, { useEffect, useState } from 'react';
import {
  Shield,
  ShieldCheck,
  Building,
  CheckCircle,
  XCircle,
  FileText,
  Activity,
  AlertTriangle,
  Clock,
  Layers
} from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { Badge } from '../../components/Badge';

export default function AdminPage() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [orgsRes, logsRes] = await Promise.allSettled([
        analyticsService.getAdminOrganizations(),
        analyticsService.getAdminModerationLogs()
      ]);
      if (orgsRes.status === 'fulfilled') setOrgs(orgsRes.value);
      if (logsRes.status === 'fulfilled') setLogs(logsRes.value);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleVerify = async (id: string, status: 'verified' | 'rejected') => {
    try {
      await analyticsService.verifyOrganization(id, status, 'Verified via Admin Security Console');
      alert(`Organization status updated to ${status}`);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Verification update failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Governance & Moderation Console
              </h1>
              <p className="text-sm text-slate-600">
                Charity NGO verification, commercial donor approvals, and security audit trail
              </p>
            </div>
          </div>
        </div>

        <Badge variant="indigo" className="font-bold py-1 px-3 text-xs uppercase">
          Admin Authorization Active
        </Badge>
      </div>

      {/* 2. Organizations Verification Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-600" />
              Registered Organizations & NGOs
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review 80G tax exemptions, food safety hygiene licenses, and daily handling capacities
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">{orgs.length} entities</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Entity Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">City / Region</th>
                <th className="py-3 px-4">Daily Capacity</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orgs.map(org => (
                <tr key={org.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {org.name}
                    <div className="text-[10px] text-slate-400 font-normal">
                      Reg: {org.registration_number || 'N/A'}
                    </div>
                  </td>
                  <td className="py-3 px-4 capitalize font-semibold">{org.org_type}</td>
                  <td className="py-3 px-4">{org.city}, {org.state}</td>
                  <td className="py-3 px-4 font-mono">{org.daily_capacity_kg} kg</td>
                  <td className="py-3 px-4">
                    <Badge variant={org.verification_status === 'verified' ? 'emerald' : org.verification_status === 'rejected' ? 'rose' : 'amber'}>
                      {org.verification_status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {org.verification_status !== 'verified' && (
                        <button
                          onClick={() => handleVerify(org.id, 'verified')}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Verify
                        </button>
                      )}
                      {org.verification_status !== 'rejected' && (
                        <button
                          onClick={() => handleVerify(org.id, 'rejected')}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Security Audit Trail Stream */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Security Audit Stream
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Immutable chronological record of privileged state changes, status transitions, and verifications
            </p>
          </div>
          <Badge variant="slate">Immutable Log</Badge>
        </div>

        <div className="space-y-2.5">
          {logs.map((log, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl border border-slate-200/80 bg-white flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-slate-900 px-2 py-0.5 rounded bg-slate-100 text-[11px]">
                  {log.action}
                </span>
                <span className="text-slate-600 font-medium">
                  Target: {log.entity_type} ({log.entity_id.slice(0, 8)}...)
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                <span>IP: {log.ip_address}</span>
                <span>{new Date(log.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
