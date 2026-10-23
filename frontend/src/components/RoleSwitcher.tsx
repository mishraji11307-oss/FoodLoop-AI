'use client';

import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { UserRole } from '../types';
import { UserCheck, Shield, UtensilsCrossed, HeartHandshake } from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const [activeRole, setActiveRoleState] = useState<UserRole>('household');

  useEffect(() => {
    setActiveRoleState(authService.getActiveRole());
  }, []);

  const handleRoleChange = (role: UserRole) => {
    authService.setActiveRole(role);
    setActiveRoleState(role);
    // Reload window so active role is immediately reflected across all components
    window.location.reload();
  };

  const roles: { id: UserRole; name: string; label: string; icon: any }[] = [
    { id: 'household', name: 'Aarav Sharma', label: 'Household Consumer', icon: UserCheck },
    { id: 'donor', name: 'GreenBites Bakery', label: 'Surplus Donor', icon: UtensilsCrossed },
    { id: 'ngo', name: 'Annadaata Relief', label: 'Charity NGO', icon: HeartHandshake },
    { id: 'admin', name: 'Admin Center', label: 'System Admin', icon: Shield },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/80 text-xs">
      <span className="text-[11px] font-semibold text-slate-500 uppercase px-2 tracking-wider hidden lg:inline">
        Persona:
      </span>
      {roles.map(r => {
        const Icon = r.icon;
        const isActive = activeRole === r.id;
        return (
          <button
            key={r.id}
            onClick={() => handleRoleChange(r.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all duration-150 ${
              isActive
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
            title={`Switch to ${r.label} (${r.name})`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">{r.label.split(' ')[0]}</span>
          </button>
        );
      })}
    </div>
  );
};
