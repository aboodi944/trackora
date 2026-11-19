import React from 'react';
import { 
  Laptop, Server, Wifi, ShieldAlert, DollarSign, 
  ArrowUpRight, Clock, Plus, ScanBarcode, ClipboardCheck,
  ChevronRight, AlertTriangle, CheckCircle2, TrendingDown, Layers, Sparkles, Cloud, Smartphone
} from 'lucide-react';
import { ITAsset, SoftwareLicense, PricingTier } from '../types/asset';
import { calculateDepreciation, formatCurrency, getDaysUntilWarranty, getStatusDetails } from '../utils/assetCalculations';
import { DashboardWidget } from './DashboardWidget';
import { useLanguage } from '../i18n/LanguageContext';

interface DashboardViewProps {
  assets: ITAsset[];
  licenses: SoftwareLicense[];
  activeTier: PricingTier;
  onOpenScanner: () => void;
  onOpenAudit: () => void;
  onOpenAddModal: () => void;
  onSelectAsset: (asset: ITAsset) => void;
  onOpenLicenses: () => void;
  onOpenMonetization: () => void;
  onOpenDrive?: () => void;
  onOpenPlayStore?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  assets,
  licenses,
  activeTier,
  onOpenScanner,
  onOpenAudit,
  onOpenAddModal,
  onSelectAsset,
  onOpenLicenses,
  onOpenMonetization,
  onOpenDrive,
  onOpenPlayStore,
}) => {
  const { t, isRtl } = useLanguage();

  // Financial summaries
  const totalOriginalCost = assets.reduce((sum, a) => sum + a.purchaseCost, 0);
  const currentTotalBookValue = assets.reduce(
    (sum, a) => sum + calculateDepreciation(a).currentBookValue,
    0
  );

  const inUseCount = assets.filter((a) => a.status === 'in_use').length;
  const availableCount = assets.filter((a) => a.status === 'available').length;
  const maintenanceCount = assets.filter((a) => a.status === 'maintenance').length;

  // Alerts
  const expiringWarranties = assets.filter((a) => {
    const w = getDaysUntilWarranty(a.warrantyExpires);
    return w.isNear || w.isExpired;
  });

  return (
    <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 text-xs font-sans pb-24 md:pb-6">
      {/* Material 3 High-Level Financial Asset Valuation Card */}
      <div className="bg-[#171a22] p-4 sm:p-5 rounded-[28px] border border-white/[0.08] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3.5">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">
              {t('fleetValuationTitle')}
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono tracking-tight mt-1">
              {formatCurrency(currentTotalBookValue)}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold">
              {assets.length} {t('activeAssets')}
            </span>
            <div className="text-[11px] text-slate-400 font-mono mt-1.5">
              {t('origCost')}: {formatCurrency(totalOriginalCost)}
            </div>
          </div>
        </div>

        {/* 3 Material 3 Metric Sub-tiles */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/[0.06]">
          <div className="bg-[#101217]/80 p-2.5 rounded-2xl border border-white/[0.05]">
            <span className="text-[10px] text-slate-400 block truncate">
              {t('deployedInUse')}
            </span>
            <span className="text-base font-bold text-emerald-400 font-mono">
              {inUseCount}
            </span>
          </div>
          <div className="bg-[#101217]/80 p-2.5 rounded-2xl border border-white/[0.05]">
            <span className="text-[10px] text-slate-400 block truncate">
              {t('inStockReady')}
            </span>
            <span className="text-base font-bold text-blue-400 font-mono">
              {availableCount}
            </span>
          </div>
          <div className="bg-[#101217]/80 p-2.5 rounded-2xl border border-white/[0.05]">
            <span className="text-[10px] text-slate-400 block truncate">
              {t('repairBench')}
            </span>
            <span className="text-base font-bold text-amber-400 font-mono">
              {maintenanceCount}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Recharts Asset Status Distribution Widget */}
      <DashboardWidget assets={assets} />

      {/* Android Material 3 Quick Action Cards */}
      <div>
        <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block mb-2 px-1">
          {t('quickWorkflowsTitle')}
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={onOpenScanner}
            className="p-3.5 rounded-2xl bg-[#171a22] hover:bg-[#1e222d] border border-white/[0.07] hover:border-blue-500/40 text-left transition-all active:scale-95 group shadow-sm"
          >
            <div className="w-9 h-9 rounded-[14px] bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <ScanBarcode className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-100 text-xs block">
              {t('scanBarcode')}
            </span>
            <span className="text-[10px] text-slate-400 truncate block mt-0.5">
              {t('cameraInstantAudit')}
            </span>
          </button>

          <button
            onClick={onOpenAudit}
            className="p-3.5 rounded-2xl bg-[#171a22] hover:bg-[#1e222d] border border-white/[0.07] hover:border-emerald-500/40 text-left transition-all active:scale-95 group shadow-sm"
          >
            <div className="w-9 h-9 rounded-[14px] bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-100 text-xs block">
              {t('tabAudit')}
            </span>
            <span className="text-[10px] text-slate-400 truncate block mt-0.5">
              {t('verifyWarehouseRack')}
            </span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="p-3.5 rounded-2xl bg-[#171a22] hover:bg-[#1e222d] border border-white/[0.07] hover:border-slate-600 text-left transition-all active:scale-95 group shadow-sm"
          >
            <div className="w-9 h-9 rounded-[14px] bg-white/[0.07] text-slate-200 border border-white/10 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-100 text-xs block">
              {t('addAsset')}
            </span>
            <span className="text-[10px] text-slate-400 truncate block mt-0.5">
              {t('tagOnboardDevice')}
            </span>
          </button>

          <button
            onClick={onOpenMonetization}
            className="p-3.5 rounded-2xl bg-[#171a22] hover:bg-[#1e222d] border border-white/[0.07] hover:border-amber-500/40 text-left transition-all active:scale-95 group shadow-sm"
          >
            <div className="w-9 h-9 rounded-[14px] bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-amber-300 text-xs block">
              {t('tabPlans')}
            </span>
            <span className="text-[10px] text-amber-400/80 truncate block mt-0.5">
              {t('saasRoiPitchTool')}
            </span>
          </button>
        </div>

        {/* Cloud & Native Mobile Ecosystem Integrations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2.5">
          {onOpenDrive && (
            <button
              onClick={onOpenDrive}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-950/40 to-[#171a22] hover:from-sky-900/40 hover:to-[#1e222d] border border-sky-500/25 hover:border-sky-400/50 flex items-center justify-between text-left transition-all active:scale-[0.98] shadow-sm group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Cloud className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-slate-100 text-xs block truncate">
                    {t('googleDriveSync')}
                  </span>
                  <span className="text-[10px] text-sky-300/80 block truncate">
                    {t('googleDriveDesc')}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-sky-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          {onOpenPlayStore && (
            <button
              onClick={onOpenPlayStore}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-[#171a22] hover:from-emerald-900/40 hover:to-[#1e222d] border border-emerald-500/25 hover:border-emerald-400/50 flex items-center justify-between text-left transition-all active:scale-[0.98] shadow-sm group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-slate-100 text-xs block truncate">
                    {t('playStoreKit')}
                  </span>
                  <span className="text-[10px] text-emerald-300/80 block truncate">
                    Android Bundle (.AAB) & Console Checklist
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>

      {/* Actionable Alerts (Expiring Warranties or Repairs) */}
      {expiringWarranties.length > 0 && (
        <div className="bg-[#1f1a14] border border-amber-500/30 rounded-[24px] p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{t('warrantyAlertTitle')} ({expiringWarranties.length})</span>
            </div>
          </div>

          <div className="space-y-1.5">
            {expiringWarranties.slice(0, 2).map((a) => {
              const w = getDaysUntilWarranty(a.warrantyExpires);
              return (
                <div
                  key={a.id}
                  onClick={() => onSelectAsset(a)}
                  className="bg-[#14120e] p-2.5 rounded-xl border border-amber-500/20 flex items-center justify-between gap-2 cursor-pointer hover:border-amber-400/40 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-blue-400">{a.tag}</span>
                      <span className="text-slate-200 font-medium truncate">{a.model}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {a.warrantyExpires} ({w.isExpired ? t('expired') : `${w.days} ${t('daysLeft')}`})
                    </span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-500 shrink-0 ${isRtl ? 'rotate-180' : ''}`} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Software Licenses Summary Card */}
      <div
        onClick={onOpenLicenses}
        className="bg-[#171a22] border border-white/[0.08] hover:border-purple-500/40 p-4 rounded-[24px] transition-all cursor-pointer flex items-center justify-between gap-3 shadow-sm"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-slate-100 text-xs">
              {t('softwareLicensesTitle')}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 truncate">
              {t('softwareLicensesSubtitle')}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-blue-400 font-semibold text-xs shrink-0">
          <span>{t('manage')}</span>
          <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Featured Fleet Items */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
            {t('featuredFleetTitle')}
          </span>
          <span className="text-[11px] text-slate-500">
            {t('tapForDossier')}
          </span>
        </div>

        <div className="space-y-2">
          {assets.slice(0, 4).map((asset) => {
            const statusInfo = getStatusDetails(asset.status);
            const dep = calculateDepreciation(asset);
            return (
              <div
                key={asset.id}
                onClick={() => onSelectAsset(asset)}
                className="bg-[#171a22] hover:bg-[#1e222d] border border-white/[0.07] hover:border-white/15 p-3 sm:p-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-[0.99] shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-[#101217] border border-white/[0.08] flex items-center justify-center text-slate-300 shrink-0">
                    <Laptop className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-blue-400">{asset.tag}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold border ${statusInfo.bg}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="text-slate-100 font-semibold truncate text-xs mt-1">
                      {asset.manufacturer} {asset.model}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {asset.assignedUser ? `${asset.assignedUser}` : asset.location}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-xs text-slate-100">
                    {formatCurrency(dep.currentBookValue)}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {t('bookValue')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
