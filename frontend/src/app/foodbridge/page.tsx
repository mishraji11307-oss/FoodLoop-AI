'use client';

import React, { useEffect, useState } from 'react';
import {
  HeartHandshake,
  Plus,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  Sparkles,
  Search,
  Filter,
  KeyRound,
  ExternalLink,
  ChevronRight,
  Utensils,
  Navigation,
  Loader2,
  Compass,
  Route,
  ArrowRight
} from 'lucide-react';
import { donationService } from '../../services/donationService';
import { matchingService } from '../../services/matchingService';
import { authService } from '../../services/authService';
import { Donation, DonationStatus, MatchRecommendation, UserRole } from '../../types';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';

export default function FoodBridgePage() {
  const [role, setRole] = useState<UserRole>('donor');
  const [activeTab, setActiveTab] = useState<'surplus' | 'recommendations' | 'my_donations'>('surplus');
  const [donations, setDonations] = useState<Donation[]>([]);
  const [recommendations, setRecommendations] = useState<MatchRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [pickupModalOpen, setPickupModalOpen] = useState(false);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

  // Forms
  const [newDonation, setNewDonation] = useState({
    title: '',
    food_category: 'cooked',
    quantity_kg: 20,
    servings_estimate: 60,
    perishable: true,
    expiry_time: new Date(Date.now() + 10 * 3600000).toISOString(),
    pickup_address: 'GreenBites Banquet Wing, Sector 18, Vashi',
    pickup_latitude: 19.0760,
    pickup_longitude: 72.8777,
    pickup_window_start: new Date(Date.now() + 1800000).toISOString(),
    pickup_window_end: new Date(Date.now() + 3 * 3600000).toISOString(),
    dietary_attributes: ['vegetarian'],
    packaging_notes: 'Stainless steel sealed catering trays'
  });

  const [geoLoading, setGeoLoading] = useState(false);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);

  const CITY_HUBS = [
    { name: 'Mumbai (Chembur/Vashi)', lat: 19.0760, lng: 72.8777, addr: 'GreenBites Banquet Wing, Sector 18, Vashi, Navi Mumbai' },
    { name: 'Delhi NCR (Central)', lat: 28.6139, lng: 77.2090, addr: 'Central Relief Center, Connaught Place, New Delhi' },
    { name: 'Bengaluru (Koramangala)', lat: 12.9352, lng: 77.6245, addr: 'Tech Hub Cafeteria, 5th Block, Koramangala, Bengaluru' },
    { name: 'Pune (Shivaji Nagar)', lat: 18.5204, lng: 73.8567, addr: 'Convention Catering Wing, Shivaji Nagar, Pune' },
    { name: 'Hyderabad (Hitec City)', lat: 17.4474, lng: 78.3762, addr: 'Corporate Food Court, Madhapur, Hitec City, Hyderabad' }
  ];

  const handleDetectLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLoading(true);
    setGeoMessage('Detecting GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Math.round(pos.coords.latitude * 10000) / 10000;
        const lng = Math.round(pos.coords.longitude * 10000) / 10000;

        let address = `${lat}, ${lng}`;
        try {
          // Free reverse geocoding via OpenStreetMap Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            { headers: { 'Accept': 'application/json' } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data.display_name) {
              address = data.display_name.split(',').slice(0, 3).join(', ');
            }
          }
        } catch {
          // ignore network failure
        }

        setNewDonation(prev => ({
          ...prev,
          pickup_latitude: lat,
          pickup_longitude: lng,
          pickup_address: address
        }));

        setGeoMessage(`GPS Detected: ${lat}, ${lng}`);
        setTimeout(() => setGeoMessage(null), 4000);
        setGeoLoading(false);
      },
      (err) => {
        alert(`Location permission denied or unavailable: ${err.message}`);
        setGeoLoading(false);
        setGeoMessage(null);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const [otpInput, setOtpInput] = useState('');
  const [beneficiariesInput, setBeneficiariesInput] = useState('60');

  const loadData = async () => {
    try {
      setLoading(true);
      const activeRole = authService.getActiveRole();
      setRole(activeRole);

      const [donationsData, recsData] = await Promise.allSettled([
        donationService.getAll(),
        matchingService.getRecommendations()
      ]);

      if (donationsData.status === 'fulfilled') setDonations(donationsData.value);
      if (recsData.status === 'fulfilled') setRecommendations(recsData.value);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await donationService.create(newDonation);
      setCreateModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to list surplus');
    }
  };

  const handleRequestDonation = async (donationId: string) => {
    try {
      await donationService.requestDonation(
        donationId,
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'Our volunteer rescue van is in the area and ready to collect.'
      );
      alert('Surplus donation requested! Awaiting donor approval.');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to request donation');
    }
  };

  const handleConfirmPickup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonation) return;
    try {
      await donationService.confirmPickup(selectedDonation.id, otpInput, {
        temperature_celsius: 20
      });
      alert('Pickup Verified! Status updated to in_transit.');
      setPickupModalOpen(false);
      setOtpInput('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Verification failed');
    }
  };

  const handleConfirmDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonation) return;
    try {
      await donationService.confirmDelivery(selectedDonation.id, otpInput, {
        beneficiaries_served: parseInt(beneficiariesInput, 10) || selectedDonation.servings_estimate
      });
      alert('Delivery signoff complete! Food served to community.');
      setDeliveryModalOpen(false);
      setOtpInput('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Delivery verification failed');
    }
  };

  const getStatusBadge = (status: DonationStatus) => {
    switch (status) {
      case 'available':
        return <Badge variant="emerald">Available</Badge>;
      case 'requested':
        return <Badge variant="amber">Claim Requested</Badge>;
      case 'matched':
        return <Badge variant="blue">Matched with NGO</Badge>;
      case 'in_transit':
        return <Badge variant="purple">In Transit</Badge>;
      case 'delivered':
        return <Badge variant="emerald">Delivered & Served</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                FoodBridge Surplus Logistics Hub
              </h1>
              <p className="text-sm text-slate-600">
                Commercial surplus donation, explainable NGO matching, and cryptographic OTP handovers
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs sm:text-sm hover:bg-amber-700 shadow-md shadow-amber-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Post Food Surplus
          </button>
        </div>
      </div>

      {/* 2. Interactive Logistics & Nearest NGO Matching Pipeline */}
      <div className="bg-gradient-to-r from-amber-500/10 via-teal-500/10 to-emerald-500/10 rounded-3xl p-5 border border-amber-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-amber-200/50">
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-600" />
              How FoodBridge Matches Nearest NGOs & Delivers Surplus
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Live GPS auto-detection ➔ Spherical Haversine distance scoring (30km radius) ➔ Turn-by-turn routing ➔ 2-stage OTP verification
            </p>
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="self-start md:self-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-all shadow-xs"
          >
            <Navigation className="w-3.5 h-3.5" />
            Try GPS Detection
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3">
          <div className="bg-white/80 backdrop-blur rounded-2xl p-3 border border-amber-100 shadow-xs flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">Step 1</span>
                <Navigation className="w-4 h-4 text-amber-600" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">GPS Location Pin</h4>
              <p className="text-[11px] text-slate-600">
                HTML5 Geolocation locks exact Lat/Long. OpenStreetMap reverse-geocodes street address.
              </p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur rounded-2xl p-3 border border-teal-100 shadow-xs flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-full">Step 2</span>
                <Sparkles className="w-4 h-4 text-teal-600" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">Nearest NGO Match</h4>
              <p className="text-[11px] text-slate-600">
                Backend Haversine formula scores NGOs by distance (&lt;30km), capacity &amp; urgency in real time.
              </p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur rounded-2xl p-3 border border-sky-100 shadow-xs flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-full">Step 3</span>
                <Truck className="w-4 h-4 text-sky-600" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">Driver Pickup OTP</h4>
              <p className="text-[11px] text-slate-600">
                Driver navigates via Google Maps. Donor reveals 6-digit OTP after food safety inspection.
              </p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur rounded-2xl p-3 border border-emerald-100 shadow-xs flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">Step 4</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">Shelter Delivery OTP</h4>
              <p className="text-[11px] text-slate-600">
                NGO enters Delivery OTP upon serving food, completing the chain-of-custody log.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('surplus')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'surplus'
              ? 'bg-amber-50 text-amber-800 border border-amber-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Surplus Listings ({donations.length})
        </button>

        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'recommendations'
              ? 'bg-amber-50 text-amber-800 border border-amber-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          Rule-Based NGO Recommendations ({recommendations.length})
        </button>
      </div>

      {/* 3. Main Content Views */}
      {activeTab === 'surplus' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donations.map(d => (
              <div
                key={d.id}
                className="glass-panel rounded-3xl p-6 border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{d.title}</h3>
                    {getStatusBadge(d.status)}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-slate-400" />
                      <strong>{d.quantity_kg} kg</strong> (~{d.servings_estimate} meals) • <span className="capitalize">{d.food_category}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{d.pickup_address}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Expires: {new Date(d.expiry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </p>
                  </div>

                  {d.packaging_notes && (
                    <p className="text-[11px] text-slate-500 italic">
                      Notes: {d.packaging_notes}
                    </p>
                  )}
                </div>

                {/* Status-specific Action Bar */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {d.status === 'available' && (
                    <button
                      onClick={() => handleRequestDonation(d.id)}
                      className="w-full py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <HeartHandshake className="w-4 h-4" />
                      Claim Surplus for NGO
                    </button>
                  )}

                  {d.status === 'matched' && (
                    <div className="w-full space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <span>Pickup OTP:</span>
                        <span className="font-mono font-bold text-emerald-800 text-sm tracking-wider">
                          {d.pickup_otp}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedDonation(d);
                          setPickupModalOpen(true);
                        }}
                        className="w-full py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 shadow-sm transition-all flex items-center justify-center gap-1.5"
                      >
                        <Truck className="w-4 h-4" />
                        Verify Driver Pickup Handover
                      </button>
                    </div>
                  )}

                  {d.status === 'in_transit' && (
                    <div className="w-full space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-200">
                        <span>Delivery OTP:</span>
                        <span className="font-mono font-bold text-sky-800 text-sm tracking-wider">
                          {d.delivery_otp}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedDonation(d);
                          setDeliveryModalOpen(true);
                        }}
                        className="w-full py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-sm transition-all flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Confirm Shelter Delivery
                      </button>
                    </div>
                  )}

                  {d.status === 'delivered' && (
                    <div className="w-full text-center py-1.5 bg-emerald-50 rounded-xl text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      Distribution Completed
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Rule-Based NGO Recommendations */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs sm:text-sm text-amber-900">
            <strong>Transparent Matching Algorithm:</strong> Matching scores are computed deterministically from Haversine distance, recipient daily capacity, category compatibility, and expiry urgency.
          </div>

          <div className="space-y-4">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className="glass-panel p-6 rounded-2xl border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900">{rec.donation.title}</span>
                    <Badge variant="amber">{rec.donation.food_category}</Badge>
                  </div>
                  <p className="text-xs text-slate-600">
                    Target NGO: <strong>{rec.ngo.name}</strong> • Distance: <strong>{rec.distanceKm} km</strong> • Volume: {rec.donation.quantity_kg}kg (~{rec.donation.servings_estimate} meals)
                  </p>
                  <p className="text-xs text-emerald-800 font-medium bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                    <strong>Algorithmic Rationale:</strong> {rec.rationale}
                  </p>

                  <div className="grid grid-cols-4 gap-2 text-[10px] text-slate-500 pt-1">
                    <div>Distance: {rec.scoreBreakdown.distanceScore}%</div>
                    <div>Capacity: {rec.scoreBreakdown.capacityScore}%</div>
                    <div>Category: {rec.scoreBreakdown.categoryMatchScore}%</div>
                    <div>Urgency: {rec.scoreBreakdown.urgencyBonus}%</div>
                  </div>
                </div>

                <div className="flex flex-col items-center sm:items-end gap-3 shrink-0">
                  <div className="text-center sm:text-right">
                    <span className="text-2xl font-black text-amber-600">{rec.matchScore}</span>
                    <span className="text-xs text-slate-400">/100 match</span>
                  </div>
                  <button
                    onClick={() => handleRequestDonation(rec.donation.id)}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 shadow-sm transition-all"
                  >
                    Accept Match Recommendation
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: Post Food Surplus */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Post Food Surplus for Community Rescue"
        description="List commercial food batches with pickup windows and dietary tags"
      >
        <form onSubmit={handleCreateDonation} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Surplus Title *
            </label>
            <input
              type="text"
              required
              value={newDonation.title}
              onChange={e => setNewDonation({ ...newDonation, title: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              placeholder="e.g. Catered Veg Pulao & Dal (50 Servings)"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Category
              </label>
              <select
                value={newDonation.food_category}
                onChange={e => setNewDonation({ ...newDonation, food_category: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="cooked">Cooked Hot Meals</option>
                <option value="bakery">Bakery & Pastries</option>
                <option value="produce">Fresh Produce / Fruit</option>
                <option value="packaged">Packaged Dry Goods</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Quantity (Kilograms) *
              </label>
              <input
                type="number"
                step="any"
                required
                value={newDonation.quantity_kg}
                onChange={e => setNewDonation({ ...newDonation, quantity_kg: parseFloat(e.target.value) || 1 })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Estimated Servings
              </label>
              <input
                type="number"
                required
                value={newDonation.servings_estimate}
                onChange={e => setNewDonation({ ...newDonation, servings_estimate: parseInt(e.target.value, 10) || 10 })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

          {/* Pickup Address & Live Location Detection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Pickup Address & Location *
              </label>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={geoLoading}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-semibold border border-amber-200 transition-colors shadow-xs"
              >
                {geoLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                    <span>Detecting GPS...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3.5 h-3.5 text-amber-600" />
                    <span>Detect My Live GPS Location</span>
                  </>
                )}
              </button>
            </div>

            {geoMessage && (
              <p className="text-xs text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{geoMessage}</span>
              </p>
            )}

            <input
              type="text"
              required
              value={newDonation.pickup_address}
              onChange={e => setNewDonation({ ...newDonation, pickup_address: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              placeholder="e.g. GreenBites Banquet, Sector 18, Vashi"
            />

            {/* Quick Metro Hub Presets */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] text-slate-400 font-semibold">Or choose city hub:</span>
              <div className="flex flex-wrap gap-1.5">
                {CITY_HUBS.map(hub => (
                  <button
                    key={hub.name}
                    type="button"
                    onClick={() => {
                      setNewDonation({
                        ...newDonation,
                        pickup_address: hub.addr,
                        pickup_latitude: hub.lat,
                        pickup_longitude: hub.lng
                      });
                    }}
                    className={`text-[11px] px-2 py-0.5 rounded-lg border transition-colors ${
                      newDonation.pickup_latitude === hub.lat && newDonation.pickup_longitude === hub.lng
                        ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {hub.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Coordinates Badge */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200">
              <span className="font-mono">
                GPS: {newDonation.pickup_latitude.toFixed(4)}°, {newDonation.pickup_longitude.toFixed(4)}°
              </span>
              <a
                href={`https://www.google.com/maps?q=${newDonation.pickup_latitude},${newDonation.pickup_longitude}`}
                target="_blank"
                rel="noreferrer"
                className="text-amber-700 hover:underline flex items-center gap-1 font-semibold"
              >
                <Compass className="w-3 h-3" />
                Preview Pin on Map
              </a>
            </div>
          </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Packaging & Temperature Notes
            </label>
            <input
              type="text"
              value={newDonation.packaging_notes}
              onChange={e => setNewDonation({ ...newDonation, packaging_notes: e.target.value })}
              placeholder="e.g. In thermal food warmers at 65°C, sealed lids"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-600 text-white font-bold text-sm hover:bg-amber-700 shadow-md transition-all mt-2"
          >
            Publish Surplus Listing
          </button>
        </form>
      </Modal>

      {/* MODAL 2: Pickup OTP Verification */}
      <Modal
        isOpen={pickupModalOpen}
        onClose={() => setPickupModalOpen(false)}
        title="Verify Driver Food Pickup Handover"
        description="Enter the secret 6-digit OTP provided by the donor to verify physical handover"
      >
        <form onSubmit={handleConfirmPickup} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              6-Digit Pickup OTP Code *
            </label>
            <input
              type="text"
              maxLength={6}
              required
              value={otpInput}
              onChange={e => setOtpInput(e.target.value)}
              className="w-full text-center font-mono text-2xl tracking-widest py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              placeholder="••••••"
            />
            <p className="text-[11px] text-slate-500 mt-1 text-center">
              For demo testing, the OTP code is displayed on the donation card.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 shadow-md transition-all"
          >
            Confirm Handover & Set Status to In-Transit
          </button>
        </form>
      </Modal>

      {/* MODAL 3: Delivery OTP Verification */}
      <Modal
        isOpen={deliveryModalOpen}
        onClose={() => setDeliveryModalOpen(false)}
        title="Shelter Delivery Signoff"
        description="Confirm final delivery to community recipients using the delivery OTP"
      >
        <form onSubmit={handleConfirmDelivery} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              6-Digit Delivery OTP Code *
            </label>
            <input
              type="text"
              maxLength={6}
              required
              value={otpInput}
              onChange={e => setOtpInput(e.target.value)}
              className="w-full text-center font-mono text-2xl tracking-widest py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Actual Beneficiaries Served
            </label>
            <input
              type="number"
              required
              value={beneficiariesInput}
              onChange={e => setBeneficiariesInput(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 shadow-md transition-all"
          >
            Complete Delivery & Record Impact
          </button>
        </form>
      </Modal>
    </div>
  );
}
