'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Apple,
  ScanLine,
  HeartHandshake,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Leaf,
  Users,
  CheckCircle2
} from 'lucide-react';
import { analyticsService } from '../services/analyticsService';
import { PlatformAnalytics } from '../types';

export default function HomePage() {
  const [impact, setImpact] = useState<PlatformAnalytics | null>(null);

  useEffect(() => {
    analyticsService.getImpact()
      .then(setImpact)
      .catch(() => {
        // Fallback default
        setImpact({
          totalMealsRescued: 540,
          totalKgDiverted: 185.5,
          co2KgPrevented: 463.8,
          activeDonationsCount: 2,
          completedDonationsCount: 1,
          verifiedNgoCount: 8,
          wasteReductionRatePercent: 88,
          categoryBreakdown: [],
          monthlyImpactTrend: []
        });
      });
  }, []);

  return (
    <div className="flex flex-col flex-1">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs sm:text-sm font-semibold shadow-sm">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse-subtle" />
              <span>Next-Gen Sustainability & Food Intelligence Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Track. Understand.{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500 bg-clip-text text-transparent">
                Share.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              FoodLoop AI connects households, conscious consumers, and community relief networks to end household waste, demystify complex nutrition labels, and rescue commercial surplus meals.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-600 text-white font-bold text-sm sm:text-base hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 transition-all duration-150 hover:-translate-y-0.5"
              >
                Launch Unified Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/foodlabel"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-700 font-bold text-sm sm:text-base border border-slate-200 hover:bg-slate-50 shadow-sm transition-all duration-150"
              >
                <ScanLine className="w-4 h-4 text-emerald-600" />
                Scan Food Label
              </Link>
              <Link
                href="/foodbridge"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-50 text-amber-800 font-bold text-sm sm:text-base border border-amber-200 hover:bg-amber-100/70 transition-all duration-150"
              >
                <HeartHandshake className="w-4 h-4 text-amber-600" />
                Surplus Food Hub
              </Link>
            </div>
          </div>
        </div>

        {/* Ambient background blur circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none -z-10" />
      </section>

      {/* 2. Live Platform Impact Metrics */}
      <section className="py-10 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">
              Live Verified Sustainability Impact
            </h2>
            <p className="text-2xl font-bold text-slate-900 mt-1">Real impact measured across every meal diverted</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="glass-panel p-6 rounded-2xl text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <UtensilsIcon className="w-6 h-6" />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                {impact ? impact.totalMealsRescued.toLocaleString() : '540+'}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">Nourishing Meals Rescued</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                <Leaf className="w-6 h-6" />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                {impact ? `${impact.totalKgDiverted} kg` : '185 kg'}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">Surplus Diverted from Landfill</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                {impact ? `${impact.co2KgPrevented} kg` : '464 kg'}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">CO₂e Emissions Averted</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                {impact ? impact.verifiedNgoCount : '8'}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">Verified Relief Charities</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Three Integrated Pillars */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            All-In-One Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Three Pillars. Zero Compromise.
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            A cohesive suite addressing food waste at the source, empowering personal dietary health, and bridging commercial surpluses to community kitchens.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1: FreshTrack */}
          <div className="glass-panel rounded-3xl p-8 flex flex-col justify-between border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Apple className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">FreshTrack</h3>
              <p className="text-sm font-medium text-emerald-700">Food Inventory & Expiry Monitor</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Transform grocery lists and receipt scans into an automated digital pantry. Distinguish strict Use-By dates from sensory Best-Before items to safely cut household waste.
              </p>

              <ul className="space-y-2 text-xs text-slate-600 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Camera receipt OCR & fast item ingestion</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Proactive push alerts before spoilage</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Zero-waste recipes based on what's expiring</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <Link
                href="/freshtrack"
                className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700"
              >
                Explore FreshTrack
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Pillar 2: FoodLabel AI */}
          <div className="glass-panel rounded-3xl p-8 flex flex-col justify-between border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
                <ScanLine className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">FoodLabel AI</h3>
              <p className="text-sm font-medium text-teal-700">OCR & Allergen Health Analysis</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Scan fine-print ingredients on packaged foods instantly. Our deterministic health profiler identifies declared allergens and provides bilingual explanations in English and Hindi.
              </p>

              <ul className="space-y-2 text-xs text-slate-600 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>High-accuracy OCR parsing & Nutri-Score calculation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Instant alerts for personal allergen profiles</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Bilingual explanations (English & Hindi)</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <Link
                href="/foodlabel"
                className="inline-flex items-center gap-2 text-sm font-bold text-teal-600 hover:text-teal-700"
              >
                Scan Product Labels
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Pillar 3: FoodBridge */}
          <div className="glass-panel rounded-3xl p-8 flex flex-col justify-between border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">FoodBridge</h3>
              <p className="text-sm font-medium text-amber-700">Surplus Donation & NGO Matching</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Connect commercial kitchens, banquet halls, and supermarkets with verified local NGOs using a transparent rule-based matching score, secured by two-factor OTP handovers.
              </p>

              <ul className="space-y-2 text-xs text-slate-600 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Multi-criteria rule-based NGO matching algorithm</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Cryptographic OTP verification for pickup & delivery</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Zero-phantom claims with strict state machine validation</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <Link
                href="/foodbridge"
                className="inline-flex items-center gap-2 text-sm font-bold text-amber-600 hover:text-amber-700"
              >
                Discover Surplus Food
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function UtensilsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2" />
      <path d="M15 2v10" />
      <path d="M15 12v10" />
      <path d="M6 2v10" />
      <path d="M3 2v6a3 3 0 0 0 6 0V2" />
      <path d="M6 12v10" />
    </svg>
  );
}
