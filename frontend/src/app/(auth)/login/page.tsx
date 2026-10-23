'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../../../services/authService';
import { UserRole } from '../../../types';
import { Sparkles, ArrowRight, UserCheck, UtensilsCrossed, HeartHandshake, Shield, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'household@foodloop.ai',
      password: 'password123'
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      setError(null);
      await authService.login(data.email, data.password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (role: UserRole, email: string) => {
    authService.setActiveRole(role);
    router.push('/dashboard');
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 mx-auto flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign in to FoodLoop AI
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Or choose a fast one-click demo persona below
          </p>
        </div>

        {/* Fast Persona Switcher for Hackathon Testing */}
        <div className="glass-panel p-4 rounded-2xl border-emerald-200/80 bg-emerald-50/50 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 text-center">
            One-Click Instant Demo Profiles
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickDemoLogin('household', 'household@foodloop.ai')}
              type="button"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-800 font-semibold border border-slate-200 transition-all text-left shadow-sm"
            >
              <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-[11px] font-bold">Household</p>
                <p className="text-[10px] text-slate-500">Aarav Sharma</p>
              </div>
            </button>

            <button
              onClick={() => handleQuickDemoLogin('donor', 'donor@greenbites.com')}
              type="button"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-800 font-semibold border border-slate-200 transition-all text-left shadow-sm"
            >
              <UtensilsCrossed className="w-4 h-4 text-teal-600 shrink-0" />
              <div>
                <p className="text-[11px] font-bold">Commercial Donor</p>
                <p className="text-[10px] text-slate-500">GreenBites Bakery</p>
              </div>
            </button>

            <button
              onClick={() => handleQuickDemoLogin('ngo', 'director@annadaata.org')}
              type="button"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-800 font-semibold border border-slate-200 transition-all text-left shadow-sm"
            >
              <HeartHandshake className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <p className="text-[11px] font-bold">Charity NGO</p>
                <p className="text-[10px] text-slate-500">Annadaata Relief</p>
              </div>
            </button>

            <button
              onClick={() => handleQuickDemoLogin('admin', 'admin@foodloop.ai')}
              type="button"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-800 font-semibold border border-slate-200 transition-all text-left shadow-sm"
            >
              <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <p className="text-[11px] font-bold">Platform Admin</p>
                <p className="text-[10px] text-slate-500">Moderation Hub</p>
              </div>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Standard Credentials Form */}
        <form className="glass-panel p-6 rounded-2xl space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Email Address
            </label>
            <input
              type="email"
              {...register('email')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="you@domain.com"
            />
            {errors.email && (
              <p className="text-xs text-rose-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Password
            </label>
            <input
              type="password"
              {...register('password')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-xs text-rose-600 mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-center text-xs text-slate-500 pt-2">
            Don't have an account yet?{' '}
            <Link href="/register" className="text-emerald-600 font-bold hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
