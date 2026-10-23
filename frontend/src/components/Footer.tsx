import React from 'react';
import Link from 'next/link';
import { Heart, Sparkles, Github, ShieldCheck, FileText, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white/70 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                FL
              </div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">FoodLoop AI</span>
            </div>
            <p className="text-sm text-slate-600 max-w-md">
              FoodLoop AI — Track. Understand. Share. An open-source, full-stack platform uniting household inventory optimization, AI nutrition label analysis, and reliable surplus food donation logistics.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-medium border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" /> MIT Licensed Open Source
              </span>
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md font-medium border border-amber-200">
                Zero-Waste Initiative
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Core Modules</h4>
            <ul className="space-y-2 text-sm text-slate-600 font-medium">
              <li>
                <Link href="/freshtrack" className="hover:text-emerald-600 transition-colors">
                  FreshTrack Expiry Monitor
                </Link>
              </li>
              <li>
                <Link href="/foodlabel" className="hover:text-emerald-600 transition-colors">
                  FoodLabel AI Scanner
                </Link>
              </li>
              <li>
                <Link href="/foodbridge" className="hover:text-emerald-600 transition-colors">
                  FoodBridge Surplus Hub
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-emerald-600 transition-colors">
                  Unified Impact Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Compliance & Docs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Documentation</h4>
            <ul className="space-y-2 text-sm text-slate-600 font-medium">
              <li className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <a href="/docs/ARCHITECTURE.md" target="_blank" className="hover:text-emerald-600 transition-colors">
                  Architecture Overview
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <a href="/docs/API.md" target="_blank" className="hover:text-emerald-600 transition-colors">
                  REST API Reference
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5 text-slate-400" />
                <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-emerald-600 transition-colors">
                  Open Source GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 FoodLoop AI Contributors. Free, accessible, and community-driven.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for global hunger relief & sustainability.
          </p>
        </div>
      </div>
    </footer>
  );
};
