import React, { useState } from 'react';
import { X, Sparkles, Check, TrendingUp, DollarSign, Shield, Zap, Calculator, ArrowUpRight } from 'lucide-react';
import { PricingTier } from '../types/asset';
import { formatCurrency } from '../utils/assetCalculations';
import confetti from 'canvas-confetti';

interface MonetizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: PricingTier;
  onSelectTier: (tier: PricingTier) => void;
  totalAssetsCount: number;
}

export const MonetizationModal: React.FC<MonetizationModalProps> = ({
  isOpen,
  onClose,
  currentTier,
  onSelectTier,
  totalAssetsCount,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [fleetSize, setFleetSize] = useState<number>(Math.max(150, totalAssetsCount * 15));
  const [avgCostPerDevice, setAvgCostPerDevice] = useState<number>(1850);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  if (!isOpen) return null;

  // ROI calculations
  // Industry Gartner benchmark: ~10% of unmanaged corporate laptops & devices disappear or are forgotten during remote work/exit
  const estimatedHardwareLossPrevented = Math.round(fleetSize * 0.09 * avgCostPerDevice);
  // SaaS ghost license reclamation: approx $65/seat/year on 20% unused software
  const estimatedSaaSSaved = Math.round(fleetSize * 0.22 * 420);
  const totalAnnualSavings = estimatedHardwareLossPrevented + estimatedSaaSSaved;

  const annualAppCost = billingCycle === 'annual' ? 1490 : 149 * 12;
  const netROI = Math.round(((totalAnnualSavings - annualAppCost) / annualAppCost) * 100);

  const handleActivatePlan = (tier: PricingTier) => {
    onSelectTier(tier);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl">
      <div className="w-full max-w-2xl bg-[#141720] rounded-[32px] border border-white/10 flex flex-col max-h-[94vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="h-16 px-5 bg-[#171b26]/90 border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">
                Monetization Architecture &amp; Commercial Tiers
              </h3>
              <p className="text-[11px] text-slate-400">
                How this IT Asset App Generates Predictable B2B SaaS Profit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs">
          {/* Active plan status alert */}
          {showSavedFeedback && (
            <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 p-3 rounded-2xl flex items-center justify-between text-xs animate-in fade-in duration-200">
              <span className="font-semibold">Plan tier updated successfully! All features unlocked.</span>
              <Check className="w-4 h-4" />
            </div>
          )}

          {/* Business Profit Breakdown & Strategy Guide */}
          <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-950 p-4 rounded-2xl border border-blue-800/40 space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>How To Monetize & Profit From This App</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Companies pay premium subscriptions for IT Asset Management because hardware loss during remote work is devastatingly expensive. You can monetize this app across three reliable profit channels:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-amber-400 font-bold text-xs block">1. Annual SaaS</span>
                <span className="text-slate-400 text-[11px]">Charge $1,490 to $4,990/yr per company for unlimited technician mobile seats.</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-blue-400 font-bold text-xs block">2. Barcode Label Kit</span>
                <span className="text-slate-400 text-[11px]">Upsell pre-printed metallic anodized aluminum QR asset tags with 65% profit margins.</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-emerald-400 font-bold text-xs block">3. IT Onboarding Setup</span>
                <span className="text-slate-400 text-[11px]">Offer turnkey physical inventory audits & Jamf/Intune sync at $2,500/engagement.</span>
              </div>
            </div>
          </div>

          {/* Interactive ROI Calculator for Enterprise Pitching */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-slate-100 text-xs">
                  Enterprise Client ROI Calculator (Pitch Weapon)
                </span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {netROI}% ROI
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Managed Fleet Size</span>
                  <span className="font-mono text-slate-200 font-bold">{fleetSize} Hardware Assets</span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="1000"
                  step="25"
                  value={fleetSize}
                  onChange={(e) => setFleetSize(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Avg Device Value</span>
                  <span className="font-mono text-slate-200 font-bold">{formatCurrency(avgCostPerDevice)}</span>
                </div>
                <input
                  type="range"
                  min="800"
                  max="4000"
                  step="100"
                  value={avgCostPerDevice}
                  onChange={(e) => setAvgCostPerDevice(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800/80">
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Lost Hardware Saved</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {formatCurrency(estimatedHardwareLossPrevented)}/yr
                </span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Ghost SaaS Cut</span>
                <span className="text-sm font-bold text-blue-400 font-mono">
                  {formatCurrency(estimatedSaaSSaved)}/yr
                </span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 block">Net Company Value</span>
                <span className="text-sm font-bold text-amber-400 font-mono">
                  {formatCurrency(totalAnnualSavings)}/yr
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Tier Selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-slate-100 text-xs">Choose Workspace Plan</span>
              <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    billingCycle === 'monthly' ? 'bg-slate-800 text-white' : 'text-slate-400'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    billingCycle === 'annual' ? 'bg-blue-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Annual (Save 20%)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Starter Tier */}
              <div className={`rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                currentTier === 'starter'
                  ? 'bg-slate-950 border-blue-500 ring-2 ring-blue-500/20'
                  : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-200 text-xs">Starter Hook</span>
                    {currentTier === 'starter' && (
                      <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-bold">Active</span>
                    )}
                  </div>
                  <div className="text-xl font-bold text-slate-100 font-mono mb-2">
                    Free
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">
                    For small startups & IT evaluation pilots.
                  </p>
                  <ul className="space-y-1.5 text-[11px] text-slate-300">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-blue-400" />
                      <span>Up to 25 hardware assets</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-blue-400" />
                      <span>1 IT Technician login</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-blue-400" />
                      <span>Basic barcode lookup</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => handleActivatePlan('starter')}
                  className="mt-4 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  {currentTier === 'starter' ? 'Current Plan' : 'Select Starter'}
                </button>
              </div>

              {/* Pro Tier */}
              <div className={`rounded-2xl p-4 border transition-all flex flex-col justify-between relative ${
                currentTier === 'pro'
                  ? 'bg-slate-950 border-blue-500 ring-2 ring-blue-500/20'
                  : 'bg-gradient-to-b from-blue-950/30 to-slate-950 border-blue-700/50'
              }`}>
                <div className="absolute -top-2.5 right-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                  Most Profitable
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-100 text-xs">IT Pro</span>
                    {currentTier === 'pro' && (
                      <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-bold">Active</span>
                    )}
                  </div>
                  <div className="text-xl font-bold text-slate-100 font-mono mb-2">
                    {billingCycle === 'annual' ? '$124' : '$149'}
                    <span className="text-xs text-slate-400 font-normal"> /mo</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Full mobile scanner and digital custody handovers.
                  </p>
                  <ul className="space-y-1.5 text-[11px] text-slate-300">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-blue-400" />
                      <span>Up to 350 hardware assets</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-blue-400" />
                      <span>Live Android Barcode / QR Scanner</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-blue-400" />
                      <span>Digital Touchscreen Signature receipts</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-blue-400" />
                      <span>Printable asset stickers (Zebra/Brother)</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => handleActivatePlan('pro')}
                  className="mt-4 w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all active:scale-95"
                >
                  {currentTier === 'pro' ? 'Current Plan' : 'Activate Pro'}
                </button>
              </div>

              {/* Enterprise Fleet Tier */}
              <div className={`rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                currentTier === 'enterprise'
                  ? 'bg-slate-950 border-amber-500 ring-2 ring-amber-500/20'
                  : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-200 text-xs">Enterprise Fleet</span>
                    {currentTier === 'enterprise' && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-bold">Active</span>
                    )}
                  </div>
                  <div className="text-xl font-bold text-slate-100 font-mono mb-2">
                    {billingCycle === 'annual' ? '$415' : '$499'}
                    <span className="text-xs text-slate-400 font-normal"> /mo</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Datacenter multi-rack audits and MDM automation.
                  </p>
                  <ul className="space-y-1.5 text-[11px] text-slate-300">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                      <span>Unlimited Hardware & Licenses</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                      <span>Physical Warehouse Floor Audit Mode</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                      <span>GAAP Straight-Line Depreciation Ledger</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                      <span>Jamf / Microsoft Intune Sync Ready</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => handleActivatePlan('enterprise')}
                  className="mt-4 w-full py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-semibold transition-all active:scale-95 shadow-md shadow-amber-500/20"
                >
                  {currentTier === 'enterprise' ? 'Current Plan' : 'Activate Enterprise'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            Enterprise subscription invoice billing available via Wire / ACH / Stripe.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
