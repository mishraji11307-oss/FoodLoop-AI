'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Apple,
  ScanLine,
  HeartHandshake,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  Leaf,
  Layers
} from 'lucide-react';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { authService } from '../../services/authService';
import { analyticsService } from '../../services/analyticsService';
import { inventoryService } from '../../services/inventoryService';
import { donationService } from '../../services/donationService';
import {
  UserRole,
  PlatformAnalytics,
  InventoryItem,
  Donation
} from '../../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function DashboardPage() {
  const [role, setRole] = useState<UserRole>('household');
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [expiringItems, setExpiringItems] = useState<InventoryItem[]>([]);
  const [activeDonations, setActiveDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const active = authService.getActiveRole();
    setRole(active);

    Promise.allSettled([
      analyticsService.getImpact(),
      inventoryService.getAll({ status: 'expiring_soon' }),
      donationService.getAll()
    ]).then(([analyticsRes, invRes, donRes]) => {
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value);
      if (invRes.status === 'fulfilled') setExpiringItems(invRes.value.slice(0, 4));
      if (donRes.status === 'fulfilled') setActiveDonations(donRes.value);
      setLoading(false);
    });
  }, []);

  const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Operational Command Hub
            </h1>
            <Badge variant="emerald" className="uppercase font-bold">
              {role} View
            </Badge>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Real-time telemetry across FreshTrack, FoodLabel AI, and FoodBridge logistics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/freshtrack"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm hover:bg-emerald-700 shadow-sm transition-all"
          >
            <Apple className="w-4 h-4" />
            FreshTrack
          </Link>
          <Link
            href="/foodlabel"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
          >
            <ScanLine className="w-4 h-4 text-emerald-600" />
            Scanner
          </Link>
          <Link
            href="/foodbridge"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 text-amber-800 font-bold text-xs sm:text-sm border border-amber-200 hover:bg-amber-100 transition-all"
          >
            <HeartHandshake className="w-4 h-4 text-amber-600" />
            FoodBridge
          </Link>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Meals Rescued"
          value={analytics ? analytics.totalMealsRescued.toLocaleString() : '540'}
          subtitle="Redirected to families in need"
          icon={HeartHandshake}
          trend="+18%"
          trendUp={true}
          colorScheme="emerald"
        />
        <StatCard
          title="Food Diverted from Landfills"
          value={analytics ? `${analytics.totalKgDiverted} kg` : '185 kg'}
          subtitle="Organic mass saved"
          icon={Leaf}
          trend="+12%"
          trendUp={true}
          colorScheme="sky"
        />
        <StatCard
          title="CO₂e Emissions Prevented"
          value={analytics ? `${analytics.co2KgPrevented} kg` : '464 kg'}
          subtitle="Estimated greenhouse savings"
          icon={TrendingUp}
          trend="+22%"
          trendUp={true}
          colorScheme="amber"
        />
        <StatCard
          title="Waste Prevention Rate"
          value={analytics ? `${analytics.wasteReductionRatePercent}%` : '88%'}
          subtitle="Household consumption ratio"
          icon={ShieldCheck}
          trend="+6%"
          trendUp={true}
          colorScheme="indigo"
        />
      </div>

      {/* 3. Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Monthly Rescue Trajectory</h3>
              <p className="text-xs text-slate-500">Cumulative meals and kg diverted over time</p>
            </div>
            <Badge variant="emerald">Live Telemetry</Badge>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.monthlyImpactTrend || []}>
                <defs>
                  <linearGradient id="colorKg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Area type="monotone" dataKey="kg" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorKg)" name="Weight (kg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900">Food Categories</h3>
              <Badge variant="amber">Distribution</Badge>
            </div>
            <p className="text-xs text-slate-500 mb-4">Volume breakdown of rescued food items</p>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics?.categoryBreakdown || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="kg"
                  >
                    {(analytics?.categoryBreakdown || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
            {(analytics?.categoryBreakdown || []).map((cat, idx) => (
              <div key={cat.category} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-slate-600 font-medium truncate">{cat.category}</span>
                <span className="text-slate-900 font-bold ml-auto">{cat.kg}kg</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Role-Specific Action Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FreshTrack Alert Center */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">FreshTrack Expiring Monitor</h3>
                <p className="text-xs text-slate-500">Items requiring immediate culinary attention</p>
              </div>
            </div>
            <Link
              href="/freshtrack"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              View All ({expiringItems.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {expiringItems.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No items are currently expiring soon. Your pantry is well managed!
              </div>
            ) : (
              expiringItems.map(item => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-amber-200/70 bg-amber-50/40 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{item.name}</span>
                      <Badge variant="amber" className="text-[10px] uppercase font-bold">
                        {item.date_label.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.quantity} {item.unit} in {item.storage}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-700">
                      {item.days_remaining !== undefined ? `${item.days_remaining}d left` : 'Expiring'}
                    </span>
                    <p className="text-[11px] text-slate-400">{item.expiry_date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* FoodBridge Live Surplus Listings */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">FoodBridge Active Surplus</h3>
                <p className="text-xs text-slate-500">Available donations and pickup schedules</p>
              </div>
            </div>
            <Link
              href="/foodbridge"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Surplus Hub
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {activeDonations.slice(0, 3).map(d => (
              <div
                key={d.id}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-white flex items-center justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{d.title}</span>
                    <Badge variant={d.status === 'available' ? 'emerald' : d.status === 'matched' ? 'blue' : 'amber'}>
                      {d.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {d.quantity_kg} kg (~{d.servings_estimate} meals) • {d.food_category}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600">
                    OTP: {d.pickup_otp}
                  </span>
                  <p className="text-[10px] text-slate-400">Pickup window open</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
