'use client';

import React, { useEffect, useState } from 'react';
import {
  Apple,
  Plus,
  Camera,
  Trash2,
  Check,
  AlertTriangle,
  Clock,
  Sparkles,
  Info,
  ChevronRight,
  Filter,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChefHat,
  Loader2
} from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import { ocrService } from '../../services/ocrService';
import { InventoryItem, InventoryStatus, DateLabelType, StorageLocation } from '../../types';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';

export default function FreshTrackPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterStorage, setFilterStorage] = useState<string>('all');

  // Modals
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [safetyGuideModalOpen, setSafetyGuideModalOpen] = useState(false);
  const [recipesModalOpen, setRecipesModalOpen] = useState(false);

  // New Item Form
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Produce',
    quantity: 1,
    unit: 'units',
    storage: 'fridge' as StorageLocation,
    purchase_date: new Date().toISOString().slice(0, 10),
    expiry_date: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
    date_label: 'use_by' as DateLabelType,
    notes: ''
  });

  // Receipt OCR State
  const [receiptText, setReceiptText] = useState(
    'STORE: NATURE FRESH ORGANICS\nORGANIC WHOLE MILK 1L - 25/10/2026\nBABY SPINACH 250G - 24/10/2026\nSOURDOUGH ARTISAN LOAF - 26/10/2026\nGREEK YOGURT 400G - 29/10/2026\nCANNED SAN MARZANO TOMATOES - 15/03/2027\nSUBTOTAL: $18.40'
  );
  const [parsedDrafts, setParsedDrafts] = useState<any[]>([]);
  const [receiptOcrLoading, setReceiptOcrLoading] = useState(false);
  const [receiptOcrMessage, setReceiptOcrMessage] = useState<string | null>(null);

  const handleReceiptImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setReceiptOcrLoading(true);
      setReceiptOcrMessage('Extracting receipt text via OCR...');
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const res = await ocrService.scanImage(base64, 'receipt');
          if (res.text) {
            setReceiptText(res.text);
            const providerName = res.provider === 'gemini_vision' ? 'Gemini AI Vision' : res.provider === 'ocr_space' ? 'OCR.space' : 'OCR Engine';
            setReceiptOcrMessage(`Receipt OCR extracted via ${providerName}! Click "Run OCR Parser" below.`);
            setTimeout(() => setReceiptOcrMessage(null), 5000);
          }
        } catch (err: any) {
          alert(err.message || 'Failed to scan receipt image');
          setReceiptOcrMessage(null);
        } finally {
          setReceiptOcrLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert(err.message || 'Failed to read file');
      setReceiptOcrLoading(false);
      setReceiptOcrMessage(null);
    }
  };

  // Recipes
  const [recipes, setRecipes] = useState<any[]>([]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const res = await inventoryService.getAll();
      setItems(res);
    } catch {
      // Fallback local items
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inventoryService.create(newItem);
      setAddItemModalOpen(false);
      setNewItem({
        name: '',
        category: 'Produce',
        quantity: 1,
        unit: 'units',
        storage: 'fridge',
        purchase_date: new Date().toISOString().slice(0, 10),
        expiry_date: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
        date_label: 'use_by',
        notes: ''
      });
      loadInventory();
    } catch (err: any) {
      alert(err.message || 'Failed to add item');
    }
  };

  const handleStatusChange = async (id: string, status: InventoryStatus) => {
    try {
      await inventoryService.updateStatus(id, status);
      loadInventory();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to remove this item?')) return;
    try {
      await inventoryService.delete(id);
      loadInventory();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const handleParseReceipt = async () => {
    try {
      const drafts = await inventoryService.scanReceipt(receiptText);
      setParsedDrafts(drafts);
    } catch (err: any) {
      alert(err.message || 'Failed to parse receipt');
    }
  };

  const handleSaveReceiptDrafts = async () => {
    for (const draft of parsedDrafts) {
      const expDate = new Date(Date.now() + draft.estimatedExpiryDays * 86400000)
        .toISOString()
        .slice(0, 10);
      await inventoryService.create({
        name: draft.name,
        category: draft.category,
        quantity: draft.quantity,
        unit: draft.unit,
        storage: draft.storage,
        purchase_date: new Date().toISOString().slice(0, 10),
        expiry_date: expDate,
        date_label: draft.date_label
      });
    }
    setParsedDrafts([]);
    setReceiptModalOpen(false);
    loadInventory();
  };

  const handleFetchRecipes = async () => {
    const recs = await inventoryService.getRecipeSuggestions();
    setRecipes(recs);
    setRecipesModalOpen(true);
  };

  // Filter items
  const filteredItems = items.filter(item => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (filterStorage !== 'all' && item.storage !== filterStorage) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* 1. Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <Apple className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                FreshTrack Inventory & Expiry Monitor
              </h1>
              <p className="text-sm text-slate-600">
                Pantry tracking, smart expiration countdowns, and date-label food safety intelligence
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setSafetyGuideModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-slate-700 font-semibold text-xs border border-slate-200 hover:bg-slate-50 shadow-sm transition-all"
          >
            <HelpCircle className="w-4 h-4 text-amber-500" />
            Best-Before vs Use-By Guide
          </button>
          <button
            onClick={handleFetchRecipes}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 text-amber-800 font-semibold text-xs border border-amber-200 hover:bg-amber-100 transition-all"
          >
            <ChefHat className="w-4 h-4 text-amber-600" />
            Zero-Waste Recipes
          </button>
          <button
            onClick={() => setReceiptModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 text-teal-800 font-semibold text-xs border border-teal-200 hover:bg-teal-100 transition-all"
          >
            <Camera className="w-4 h-4 text-teal-600" />
            Receipt OCR
          </button>
          <button
            onClick={() => setAddItemModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Food Item
          </button>
        </div>
      </div>

      {/* 2. Educational Alert Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-emerald-700 shrink-0" />
          <p className="text-xs sm:text-sm text-slate-700">
            <strong>Food Safety Principle:</strong> <span className="font-semibold text-rose-700">Use-By</span> dates represent microbiological safety deadlines. <span className="font-semibold text-amber-700">Best-Before</span> dates indicate peak quality; sensory inspection (look, smell, taste) prevents premature disposal.
          </p>
        </div>
        <button
          onClick={() => setSafetyGuideModalOpen(true)}
          className="text-xs font-bold text-emerald-800 hover:underline shrink-0"
        >
          Read Full Guidance →
        </button>
      </div>

      {/* 3. Filters Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-panel">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Status:</span>
          {['all', 'fresh', 'expiring_soon', 'expired', 'consumed'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filterStatus === st
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Storage:</span>
          {['all', 'fridge', 'pantry', 'freezer'].map(loc => (
            <button
              key={loc}
              onClick={() => setFilterStorage(loc)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filterStorage === loc
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Inventory Items Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading pantry records...</div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-4">
          <Apple className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="text-lg font-bold text-slate-800">No inventory items matched</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your filters or click "Add Food Item" to record groceries.
          </p>
          <button
            onClick={() => setAddItemModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
          >
            Add New Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map(item => {
            const isExpiring = item.status === 'expiring_soon';
            const isExpired = item.status === 'expired';
            const isConsumed = item.status === 'consumed';

            return (
              <div
                key={item.id}
                className={`glass-panel rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                  isExpiring
                    ? 'border-amber-300 bg-amber-50/20'
                    : isExpired
                    ? 'border-rose-300 bg-rose-50/20'
                    : isConsumed
                    ? 'opacity-60 bg-slate-50'
                    : 'border-slate-200/90'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{item.name}</h4>
                      <p className="text-xs text-slate-500">
                        {item.quantity} {item.unit} • <span className="capitalize">{item.category}</span>
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        variant={
                          isExpired
                            ? 'rose'
                            : isExpiring
                            ? 'amber'
                            : isConsumed
                            ? 'slate'
                            : 'emerald'
                        }
                        className="uppercase text-[10px] font-extrabold"
                      >
                        {item.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="slate" className="text-[9px] uppercase">
                        {item.date_label.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  {/* Expiration Details */}
                  <div className="my-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Threshold Date:</span>
                      <span className="font-semibold text-slate-900">{item.expiry_date}</span>
                    </div>
                    {item.days_remaining !== undefined && (
                      <div className="flex items-center justify-between">
                        <span>Countdown:</span>
                        <span className={`font-bold ${item.days_remaining <= 1 ? 'text-rose-600' : 'text-amber-600'}`}>
                          {item.days_remaining < 0
                            ? `${Math.abs(item.days_remaining)} days past`
                            : item.days_remaining === 0
                            ? 'Expires today!'
                            : `${item.days_remaining} days remaining`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Safety Guidance Note */}
                  {item.safety_guidance && (
                    <div className="text-[11px] text-slate-600 bg-white/80 p-2.5 rounded-lg border border-slate-200/60 leading-relaxed">
                      <strong className="text-emerald-800">Safety Tip:</strong> {item.safety_guidance}
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {item.status !== 'consumed' && (
                      <button
                        onClick={() => handleStatusChange(item.id, 'consumed')}
                        title="Mark as Consumed"
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Consumed
                      </button>
                    )}
                    {item.status !== 'wasted' && (
                      <button
                        onClick={() => handleStatusChange(item.id, 'wasted')}
                        title="Mark as Wasted"
                        className="px-2 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700 text-[11px] transition-colors"
                      >
                        Wasted
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Add Food Item */}
      <Modal
        isOpen={addItemModalOpen}
        onClose={() => setAddItemModalOpen(false)}
        title="Add Food to FreshTrack"
        description="Record grocery details and expiration dates"
      >
        <form onSubmit={handleCreateItem} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Food Item Name *
            </label>
            <input
              type="text"
              required
              value={newItem.name}
              onChange={e => setNewItem({ ...newItem, name: e.target.value })}
              placeholder="e.g. Organic Almond Milk or Baby Carrots"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Category
              </label>
              <select
                value={newItem.category}
                onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Produce">Produce / Veggies</option>
                <option value="Dairy">Dairy & Eggs</option>
                <option value="Bakery">Bakery & Breads</option>
                <option value="Meat & Poultry">Meat & Poultry</option>
                <option value="Pantry">Pantry / Canned</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Storage Area
              </label>
              <select
                value={newItem.storage}
                onChange={e => setNewItem({ ...newItem, storage: e.target.value as StorageLocation })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="fridge">Refrigerator (&lt;4°C)</option>
                <option value="pantry">Ambient Pantry</option>
                <option value="freezer">Freezer (&lt;-18°C)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Quantity
              </label>
              <input
                type="number"
                step="any"
                min="0.1"
                required
                value={newItem.quantity}
                onChange={e => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 1 })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Unit
              </label>
              <input
                type="text"
                required
                value={newItem.unit}
                onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                placeholder="liters, grams, units"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Expiry Date *
              </label>
              <input
                type="date"
                required
                value={newItem.expiry_date}
                onChange={e => setNewItem({ ...newItem, expiry_date: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Date Label Type
              </label>
              <select
                value={newItem.date_label}
                onChange={e => setNewItem({ ...newItem, date_label: e.target.value as DateLabelType })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="use_by">Use-By (Safety strict)</option>
                <option value="best_before">Best-Before (Quality only)</option>
                <option value="expiry">Standard Expiry</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 shadow-md transition-all mt-2"
          >
            Save to Inventory
          </button>
        </form>
      </Modal>

      {/* MODAL 2: Receipt OCR Scanner */}
      <Modal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        title="Grocery Receipt Scanner & Fast Ingestion"
        description="Extract food items from supermarket receipts automatically"
        maxWidth="xl"
      >
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Receipt OCR Text (Edit or Paste)
              </label>
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-semibold border border-teal-200 transition-colors">
                {receiptOcrLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                    <span>Scanning Receipt...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-3.5 h-3.5 text-teal-600" />
                    <span>Upload Receipt Photo</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={receiptOcrLoading}
                  onChange={handleReceiptImageUpload}
                />
              </label>
            </div>

            {receiptOcrMessage && (
              <div className="text-xs px-2.5 py-1.5 bg-teal-50 border border-teal-200 text-teal-800 rounded-lg flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>{receiptOcrMessage}</span>
              </div>
            )}

            <textarea
              rows={5}
              value={receiptText}
              onChange={e => setReceiptText(e.target.value)}
              className="w-full font-mono text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Paste receipt text or upload a receipt photo above..."
            />
          </div>

          <button
            type="button"
            onClick={handleParseReceipt}
            className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            Run OCR Parser
          </button>

          {parsedDrafts.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <h4 className="text-xs font-bold uppercase text-slate-700">
                Extracted Draft Items ({parsedDrafts.length})
              </h4>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {parsedDrafts.map((draft, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{draft.name}</span>
                      <p className="text-slate-500 text-[11px]">
                        {draft.category} • Shelf life: ~{draft.estimatedExpiryDays} days ({draft.date_label})
                      </p>
                    </div>
                    <Badge variant="emerald">{draft.storage}</Badge>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleSaveReceiptDrafts}
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 shadow-sm"
              >
                Import All Extracted Items into Inventory
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* MODAL 3: Best Before vs Use By Guide */}
      <Modal
        isOpen={safetyGuideModalOpen}
        onClose={() => setSafetyGuideModalOpen(false)}
        title="Food Safety & Date Label Reference Guide"
        description="Understanding packaging dates to safely avoid unnecessary waste"
        maxWidth="xl"
      >
        <div className="space-y-4 text-xs sm:text-sm text-slate-700">
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-1.5">
            <h4 className="font-bold text-rose-800 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> USE-BY Date (Strict Safety Deadline)
            </h4>
            <p className="text-xs text-rose-900 leading-relaxed">
              Applied to highly perishable foods such as raw poultry, fresh seafood, unpasteurized dairy, and pre-cut leafy greens. <strong>Never consume past this date</strong>, even if the food looks or smells normal. Harmful pathogen toxins (such as Listeria or Salmonella) are invisible to human senses.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1.5">
            <h4 className="font-bold text-amber-800 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> BEST-BEFORE Date (Optimal Quality Guarantee)
            </h4>
            <p className="text-xs text-amber-900 leading-relaxed">
              Applied to shelf-stable groceries, dried goods, canned pulses, artisan bread, hard cheese, and yogurt. Foods past this date are <strong>usually safe to consume</strong> if packaging is intact. Conduct sensory evaluation (inspect for mold, off-odors, or sourness) before discarding.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-600" /> Safe Extension Practices
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
              <li>Freeze raw meats or sliced bread prior to their date to pause microbial activity.</li>
              <li>Cook wilting vegetables into soups, quiches, or curries at high temperatures.</li>
              <li>Keep your refrigerator consistently set below 4°C (39°F).</li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* MODAL 4: Zero-Waste AI Recipes */}
      <Modal
        isOpen={recipesModalOpen}
        onClose={() => setRecipesModalOpen(false)}
        title="Zero-Waste Recipe Suggestions"
        description="Culinary ideas utilizing ingredients expiring soon in your pantry"
        maxWidth="xl"
      >
        <div className="space-y-4">
          {recipes.map((rec, i) => (
            <div key={i} className="p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/30 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{rec.title}</h4>
                  <p className="text-xs text-slate-500">{rec.prepTimeMinutes} mins • Difficulty: {rec.difficulty}</p>
                </div>
                <Badge variant="emerald">Zero Waste</Badge>
              </div>
              <p className="text-xs text-slate-600">{rec.description}</p>
              <div className="text-[11px] text-emerald-800 bg-white p-2 rounded-lg border border-emerald-100">
                <strong>Sustainability Win:</strong> {rec.sustainabilityImpact}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
