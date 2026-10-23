'use client';

import React, { useEffect, useState } from 'react';
import {
  ScanLine,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  Languages,
  Clock,
  Settings,
  Camera,
  Activity,
  FileText,
  Heart,
  Upload,
  Loader2,
  Barcode,
  Search,
  Database,
  ExternalLink,
  Globe
} from 'lucide-react';
import { foodLabelService } from '../../services/foodLabelService';
import { ocrService } from '../../services/ocrService';
import { openFoodFactsService, NormalizedFoodProduct } from '../../services/openFoodFactsService';
import { FoodLabelScan } from '../../types';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';

export default function FoodLabelPage() {
  const [productName, setProductName] = useState('Honey Almond Protein Granola');
  const [rawText, setRawText] = useState(
    'INGREDIENTS: Whole grain rolled oats, cane sugar, honey, almonds, peanuts, sunflower seeds, sea salt, soy lecithin, tocopherols (Vitamin E preservative E306).\nCONTAINS: PEANUTS, TREE NUTS (ALMONDS), SOY.\nPER 100g: Calories 450kcal, Protein 12g, Carbohydrate 58g, Sugars 22g, Total Fat 18g, Saturated Fat 4g, Sodium 160mg.'
  );
  const [brand, setBrand] = useState('NatureHarvest');
  const [loading, setLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<FoodLabelScan | null>(null);
  const [history, setHistory] = useState<FoodLabelScan[]>([]);
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'hi'>('en');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrMessage, setOcrMessage] = useState<string | null>(null);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setOcrLoading(true);
      setOcrMessage('Extracting packaging text with OCR...');

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const res = await ocrService.scanImage(base64, 'label');
          if (res.text) {
            setRawText(res.text);

            // Smart auto-fill for product name and brand
            if (/kurkure/i.test(res.text)) {
              setProductName('Kurkure Masala Munch');
              setBrand('PepsiCo India');
            } else if (/maggi/i.test(res.text)) {
              setProductName('Maggi 2-Minute Noodles');
              setBrand('Nestlé');
            } else if (/lays|lay's/i.test(res.text)) {
              setProductName("Lay's Potato Chips");
              setBrand('PepsiCo India');
            } else if (/britannia/i.test(res.text)) {
              setProductName('Britannia Biscuits');
              setBrand('Britannia');
            } else if (/amul/i.test(res.text)) {
              setProductName('Amul Butter');
              setBrand('Amul');
            } else {
              const firstLine = res.text.split('\n')[0]?.trim();
              if (firstLine && firstLine.length > 2 && firstLine.length < 50) {
                setProductName(firstLine.replace(/is a Registered.*/i, '').trim());
              }
            }

            const providerName = res.provider === 'gemini_vision' ? 'Gemini AI Vision' : res.provider === 'ocr_space' ? 'OCR.space API' : 'OCR Engine';
            setOcrMessage(`Extracted successfully via ${providerName}!`);
            setTimeout(() => setOcrMessage(null), 5000);
          }
        } catch (err: any) {
          alert(err.message || 'Failed to extract text from image');
          setOcrMessage(null);
        } finally {
          setOcrLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert(err.message || 'Failed to read image file');
      setOcrLoading(false);
      setOcrMessage(null);
    }
  };

  // Open Food Facts Barcode State
  const [barcodeInput, setBarcodeInput] = useState('');
  const [offLoading, setOffLoading] = useState(false);
  const [offError, setOffError] = useState<string | null>(null);
  const [offProduct, setOffProduct] = useState<NormalizedFoodProduct | null>(null);

  const handleBarcodeLookup = async (codeToLookup?: string) => {
    const code = (codeToLookup || barcodeInput).trim();
    if (!code) return;

    try {
      setOffLoading(true);
      setOffError(null);
      const res = await openFoodFactsService.getProductByBarcode(code);

      if (!res.success || !res.data) {
        setOffError(res.message || 'Product not found in Open Food Facts');
        return;
      }

      const p = res.data;
      setOffProduct(p);
      setProductName(p.name);
      setBrand(p.brand);

      // Reconstruct packaging raw text with verified ingredients and nutrition
      const nutritionLines: string[] = [];
      if (p.nutritionPer100g.calories) nutritionLines.push(`Calories ${p.nutritionPer100g.calories}kcal`);
      if (p.nutritionPer100g.protein) nutritionLines.push(`Protein ${p.nutritionPer100g.protein}g`);
      if (p.nutritionPer100g.carbs) nutritionLines.push(`Carbohydrate ${p.nutritionPer100g.carbs}g`);
      if (p.nutritionPer100g.sugars) nutritionLines.push(`Sugars ${p.nutritionPer100g.sugars}g`);
      if (p.nutritionPer100g.fat) nutritionLines.push(`Total Fat ${p.nutritionPer100g.fat}g`);
      if (p.nutritionPer100g.saturatedFat) nutritionLines.push(`Saturated Fat ${p.nutritionPer100g.saturatedFat}g`);
      if (p.nutritionPer100g.salt) nutritionLines.push(`Sodium ${Math.round((p.nutritionPer100g.salt / 2.5) * 1000)}mg`);

      const allergenPart = p.allergens.length > 0 ? `\nCONTAINS: ${p.allergens.join(', ').toUpperCase()}.` : '';
      const ingredientsPart = p.ingredients ? `INGREDIENTS: ${p.ingredients}` : `PRODUCT: ${p.name}`;
      const nutritionPart = nutritionLines.length > 0 ? `\nPER 100g: ${nutritionLines.join(', ')}.` : '';

      const generatedRawText = `${ingredientsPart}${allergenPart}${nutritionPart}`;
      setRawText(generatedRawText);

      // Auto-trigger analysis immediately
      const analysisRes = await foodLabelService.scanLabel({
        product_name: p.name,
        brand: p.brand,
        raw_text: generatedRawText,
        user_allergens: userAllergens,
        image_url: p.image || undefined
      });

      setCurrentResult(analysisRes);
      loadHistory();
    } catch (err: any) {
      setOffError(err.message || 'Barcode lookup failed');
    } finally {
      setOffLoading(false);
    }
  };

  // Allergen Preferences Modal
  const [prefsModalOpen, setPrefsModalOpen] = useState(false);
  const [userAllergens, setUserAllergens] = useState<string[]>(['peanuts', 'gluten']);

  const ALLERGEN_OPTIONS = [
    { id: 'peanuts', label: 'Peanuts' },
    { id: 'tree_nuts', label: 'Tree Nuts (Almonds, Cashews)' },
    { id: 'milk', label: 'Dairy / Lactose' },
    { id: 'gluten', label: 'Gluten / Wheat' },
    { id: 'soy', label: 'Soy' },
    { id: 'eggs', label: 'Eggs' },
    { id: 'fish', label: 'Fish' },
    { id: 'shellfish', label: 'Crustaceans / Shellfish' },
    { id: 'sesame', label: 'Sesame' }
  ];

  const loadHistory = async () => {
    try {
      const res = await foodLabelService.getHistory();
      setHistory(res);
      if (res.length > 0 && !currentResult) {
        setCurrentResult(res[0]);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadHistory();
    foodLabelService.getAllergenPreferences()
      .then(prefs => {
        if (prefs?.allergens) setUserAllergens(prefs.allergens);
      })
      .catch(() => {});
  }, []);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    try {
      setLoading(true);
      const res = await foodLabelService.scanLabel({
        product_name: productName,
        brand,
        raw_text: rawText,
        user_allergens: userAllergens
      });
      setCurrentResult(res);
      loadHistory();
    } catch (err: any) {
      alert(err.message || 'Scan analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleAllergen = (id: string) => {
    if (userAllergens.includes(id)) {
      setUserAllergens(userAllergens.filter(a => a !== id));
    } else {
      setUserAllergens([...userAllergens, id]);
    }
  };

  const handleSavePreferences = async () => {
    try {
      await foodLabelService.updateAllergenPreferences(userAllergens);
      setPrefsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save allergen settings');
    }
  };

  const getNutriGradeBadge = (grade?: string) => {
    const map: Record<string, string> = {
      A: 'bg-emerald-600 text-white',
      B: 'bg-teal-500 text-white',
      C: 'bg-amber-500 text-white',
      D: 'bg-orange-500 text-white',
      E: 'bg-rose-600 text-white'
    };
    return map[grade || 'C'] || 'bg-slate-500 text-white';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600">
              <ScanLine className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                FoodLabel AI — Vision & Nutrition Intelligence
              </h1>
              <p className="text-sm text-slate-600">
                OCR text extraction, Nutri-Score grading, declared-allergen alerting, and bilingual explanations
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPrefsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-slate-700 font-semibold text-xs border border-slate-200 hover:bg-slate-50 shadow-sm transition-all"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            My Allergen Profile ({userAllergens.length})
          </button>
        </div>
      </div>

      {/* 2. Main Ingestion & Scanner Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form & Raw OCR Editor */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card A: Open Food Facts Global Barcode Lookup */}
          <div className="glass-panel p-5 rounded-2xl space-y-3.5 border-teal-500/30">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Barcode className="w-4 h-4 text-teal-600" />
                Barcode Lookup & Global DB
              </h3>
              <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 flex items-center gap-1">
                <Globe className="w-3 h-3 text-teal-600" />
                Open Food Facts
              </span>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={e => setBarcodeInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleBarcodeLookup();
                    }
                  }}
                  placeholder="Enter barcode e.g. 3017620422003"
                  className="w-full pl-8 pr-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <Barcode className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
              <button
                type="button"
                disabled={offLoading || !barcodeInput.trim()}
                onClick={() => handleBarcodeLookup()}
                className="px-3.5 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 disabled:opacity-50 flex items-center gap-1.5 transition-all shadow-sm shrink-0"
              >
                {offLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span>Fetch</span>
              </button>
            </div>

            {/* Quick Demo Preset Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[10px] text-slate-400 font-semibold">Try sample:</span>
              {[
                { label: 'Nutella', code: '3017620422003' },
                { label: "Lay's", code: '8901491101837' },
                { label: 'Oreo', code: '7622210449283' },
                { label: 'Maggi', code: '8901058852485' },
              ].map(item => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setBarcodeInput(item.code);
                    handleBarcodeLookup(item.code);
                  }}
                  className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 border border-slate-200 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {offError && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                {offError}
              </p>
            )}

            {/* Data Attribution Badge as required */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
              <span className="flex items-center gap-1">
                <Database className="w-3 h-3 text-slate-400" />
                Data sourced from Open Food Facts (ODbL)
              </span>
              <a
                href="https://world.openfoodfacts.org"
                target="_blank"
                rel="noreferrer"
                className="text-teal-600 hover:underline flex items-center gap-0.5"
              >
                openfoodfacts.org <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          <form onSubmit={handleScan} className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-teal-600" />
                Input Food Label
              </h3>
              <span className="text-[11px] text-slate-400">Editable OCR Extraction</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={e => setProductName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                placeholder="e.g. Granola Crunch"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Brand / Manufacturer
              </label>
              <input
                type="text"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                placeholder="e.g. NatureHarvest"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Raw Packaging Text / Ingredients *
                </label>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-semibold border border-teal-200 transition-colors">
                  {ocrLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                      <span>Scanning Image...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-3.5 h-3.5 text-teal-600" />
                      <span>Upload Photo / OCR</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={ocrLoading}
                    onChange={handleImageFileChange}
                  />
                </label>
              </div>

              {ocrMessage && (
                <div className="text-xs px-2.5 py-1.5 bg-teal-50 border border-teal-200 text-teal-800 rounded-lg flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>{ocrMessage}</span>
                </div>
              )}

              <textarea
                rows={7}
                required
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                className="w-full font-mono text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                placeholder="Paste OCR text or label ingredients here, or upload an image above..."
              />
              <p className="text-[11px] text-slate-400 mt-1">
                FoodLabel AI parses declared allergens, nutrition facts, and preservatives from this raw text.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Analyzing Label...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze Nutrition & Allergens
                </>
              )}
            </button>
          </form>

          {/* Past Scan History Preview */}
          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Recent Scans History</h4>
            <div className="space-y-2">
              {history.slice(0, 4).map(h => (
                <div
                  key={h.id}
                  onClick={() => setCurrentResult(h)}
                  className={`cursor-pointer p-3 rounded-xl border transition-all flex items-center justify-between text-xs ${
                    currentResult?.id === h.id
                      ? 'border-teal-500 bg-teal-50/50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <p className="font-bold text-slate-900">{h.product_name}</p>
                    <p className="text-[11px] text-slate-500">Score: {h.health_score}/100 • Grade {h.nutri_grade}</p>
                  </div>
                  <Badge variant={h.nutri_grade === 'A' || h.nutri_grade === 'B' ? 'emerald' : 'amber'}>
                    Grade {h.nutri_grade}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis Card */}
        <div className="lg:col-span-7 space-y-6">
          {currentResult ? (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border-teal-200/80 shadow-md">
              {/* Product Header & NutriGrade Indicator */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-start gap-4">
                  {offProduct?.imageSmall && (
                    <img
                      src={offProduct.imageSmall}
                      alt={offProduct.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0 bg-white"
                    />
                  )}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-extrabold text-slate-900">
                        {currentResult.product_name}
                      </h2>
                      {currentResult.brand && (
                        <Badge variant="slate">{currentResult.brand}</Badge>
                      )}
                      {offProduct?.novaGroup && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          offProduct.novaGroup === 1 ? 'bg-emerald-100 text-emerald-800' :
                          offProduct.novaGroup === 2 ? 'bg-teal-100 text-teal-800' :
                          offProduct.novaGroup === 3 ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          NOVA {offProduct.novaGroup}
                        </span>
                      )}
                      {offProduct?.ecoscore && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Eco-Score {offProduct.ecoscore.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <span>Processed by FoodLabel AI Profiling Engine</span>
                      {offProduct && (
                        <>
                          <span>•</span>
                          <span className="text-teal-600 font-medium">Open Food Facts Verified</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Nutri-Score</p>
                    <p className="text-lg font-extrabold text-slate-900">
                      {currentResult.health_score}<span className="text-xs text-slate-400">/100</span>
                    </p>
                  </div>
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-2xl shadow-md ${getNutriGradeBadge(
                      currentResult.nutri_grade
                    )}`}
                  >
                    {currentResult.nutri_grade}
                  </div>
                </div>
              </div>

              {/* Personal Allergen Danger Alert */}
              {currentResult.userAllergenConflict && (
                <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-rose-900">Allergen Safety Conflict Detected!</h4>
                    <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">
                      This food item declares <strong>{currentResult.matchingUserAllergens?.join(', ')}</strong>, which matches your registered allergen profile. Consumption is not recommended.
                    </p>
                  </div>
                </div>
              )}

              {/* Bilingual Explanation Toggle */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Languages className="w-4 h-4 text-teal-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      AI Food Literacy Summary
                    </span>
                  </div>
                  <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 text-xs font-semibold">
                    <button
                      onClick={() => setActiveLanguage('en')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        activeLanguage === 'en'
                          ? 'bg-teal-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setActiveLanguage('hi')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        activeLanguage === 'hi'
                          ? 'bg-teal-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      हिंदी (Hindi)
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-800 leading-relaxed font-medium">
                  {activeLanguage === 'en' ? currentResult.explanation_en : currentResult.explanation_hi}
                </p>
              </div>

              {/* Extracted Ingredients & Detected Allergens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Declared Allergens
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {currentResult.detected_allergens.length > 0 ? (
                      currentResult.detected_allergens.map(a => (
                        <Badge key={a} variant="rose" className="font-bold">
                          {a}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">None declared</span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Preservatives / Additives
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {currentResult.preservatives_additives.length > 0 ? (
                      currentResult.preservatives_additives.map(p => (
                        <Badge key={p} variant="amber">
                          {p}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">No common preservatives detected</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Nutrition Facts Table */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Nutrition Profile Breakdown (Per 100g)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-slate-400">Energy</p>
                    <p className="text-base font-extrabold text-slate-900 mt-0.5">
                      {currentResult.nutrition_facts?.calories || '--'} kcal
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-slate-400">Protein</p>
                    <p className="text-base font-extrabold text-slate-900 mt-0.5">
                      {currentResult.nutrition_facts?.protein_g || '--'} g
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-slate-400">Sugars</p>
                    <p className="text-base font-extrabold text-slate-900 mt-0.5">
                      {currentResult.nutrition_facts?.sugar_g || '--'} g
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-slate-400">Sodium</p>
                    <p className="text-base font-extrabold text-slate-900 mt-0.5">
                      {currentResult.nutrition_facts?.sodium_mg || '--'} mg
                    </p>
                  </div>
                </div>
              </div>

              {/* Ingredients List */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Parsed Ingredient Glossary ({currentResult.ingredients.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {currentResult.ingredients.map((ing, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-16 rounded-3xl text-center space-y-3 text-slate-400">
              <ScanLine className="w-12 h-12 mx-auto text-slate-300" />
              <h3 className="text-base font-bold text-slate-700">No Food Label Analyzed Yet</h3>
              <p className="text-xs max-w-sm mx-auto">
                Paste ingredient text or click "Analyze Nutrition & Allergens" on the left to inspect product health.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ALLERGEN PREFERENCES MODAL */}
      <Modal
        isOpen={prefsModalOpen}
        onClose={() => setPrefsModalOpen(false)}
        title="Personal Allergen & Sensitivity Settings"
        description="Select the ingredients you are allergic to for automated safety warnings"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {ALLERGEN_OPTIONS.map(opt => {
              const checked = userAllergens.includes(opt.id);
              return (
                <div
                  key={opt.id}
                  onClick={() => toggleAllergen(opt.id)}
                  className={`cursor-pointer p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    checked
                      ? 'border-rose-500 bg-rose-50 text-rose-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{opt.label}</span>
                  {checked && <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleSavePreferences}
            className="w-full py-2.5 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 shadow-md transition-all mt-4"
          >
            Save Allergen Preferences
          </button>
        </div>
      </Modal>
    </div>
  );
}
