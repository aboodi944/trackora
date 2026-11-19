import React from 'react';
import { LayoutDashboard, Laptop, ScanBarcode, ClipboardCheck, KeyRound, Sparkles } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export type TabType = 'dashboard' | 'assets' | 'audit' | 'licenses' | 'pricing';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenScanner: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenScanner,
}) => {
  const { t } = useLanguage();

  return (
    <nav className="bg-[#12151c]/95 backdrop-blur-xl border-t border-white/[0.07] px-2 pt-2 pb-safe flex items-center justify-around z-30 select-none shrink-0 h-[76px] shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
      {/* 1. Dashboard Tab */}
      <button
        onClick={() => onSelectTab('dashboard')}
        className="flex-1 min-h-[52px] flex flex-col items-center justify-center transition-all group"
      >
        <div
          className={`flex items-center justify-center px-4 py-1 rounded-full transition-all duration-200 ${
            currentTab === 'dashboard'
              ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-400/30'
              : 'text-slate-400 group-hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
        </div>
        <span
          className={`text-[11px] tracking-tight mt-1 transition-colors ${
            currentTab === 'dashboard' ? 'text-blue-300 font-bold' : 'text-slate-400 font-medium'
          }`}
        >
          {t('tabOverview')}
        </span>
      </button>

      {/* 2. Assets / Inventory Tab */}
      <button
        onClick={() => onSelectTab('assets')}
        className="flex-1 min-h-[52px] flex flex-col items-center justify-center transition-all group"
      >
        <div
          className={`flex items-center justify-center px-4 py-1 rounded-full transition-all duration-200 ${
            currentTab === 'assets'
              ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-400/30'
              : 'text-slate-400 group-hover:text-slate-200'
          }`}
        >
          <Laptop className="w-5 h-5" />
        </div>
        <span
          className={`text-[11px] tracking-tight mt-1 transition-colors ${
            currentTab === 'assets' ? 'text-blue-300 font-bold' : 'text-slate-400 font-medium'
          }`}
        >
          {t('tabHardware')}
        </span>
      </button>

      {/* 3. Center Material 3 Floating Action Button (FAB) for Barcode Scanner */}
      <div className="flex-1 flex items-center justify-center">
        <button
          onClick={onOpenScanner}
          className="w-13 h-13 rounded-[20px] bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-400 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 active:scale-95 transition-all border border-white/20 hover:brightness-110 -translate-y-2 ring-4 ring-[#12151c]"
          title={t('scanBarcode')}
          aria-label={t('scanBarcode')}
        >
          <ScanBarcode className="w-6 h-6 animate-pulse" />
        </button>
      </div>

      {/* 4. Floor Audit Tab */}
      <button
        onClick={() => onSelectTab('audit')}
        className="flex-1 min-h-[52px] flex flex-col items-center justify-center transition-all group"
      >
        <div
          className={`flex items-center justify-center px-4 py-1 rounded-full transition-all duration-200 ${
            currentTab === 'audit'
              ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-400/30'
              : 'text-slate-400 group-hover:text-slate-200'
          }`}
        >
          <ClipboardCheck className="w-5 h-5" />
        </div>
        <span
          className={`text-[11px] tracking-tight mt-1 transition-colors ${
            currentTab === 'audit' ? 'text-emerald-300 font-bold' : 'text-slate-400 font-medium'
          }`}
        >
          {t('tabAudit')}
        </span>
      </button>

      {/* 5. Software & SaaS Licenses */}
      <button
        onClick={() => onSelectTab('licenses')}
        className="flex-1 min-h-[52px] flex flex-col items-center justify-center transition-all group"
      >
        <div
          className={`flex items-center justify-center px-4 py-1 rounded-full transition-all duration-200 ${
            currentTab === 'licenses'
              ? 'bg-purple-500/20 text-purple-400 ring-1 ring-purple-400/30'
              : 'text-slate-400 group-hover:text-slate-200'
          }`}
        >
          <KeyRound className="w-5 h-5" />
        </div>
        <span
          className={`text-[11px] tracking-tight mt-1 transition-colors ${
            currentTab === 'licenses' ? 'text-purple-300 font-bold' : 'text-slate-400 font-medium'
          }`}
        >
          {t('tabLicenses')}
        </span>
      </button>

      {/* 6. Monetization / SaaS Tier */}
      <button
        onClick={() => onSelectTab('pricing')}
        className="flex-1 min-h-[52px] flex flex-col items-center justify-center transition-all group"
      >
        <div
          className={`flex items-center justify-center px-4 py-1 rounded-full transition-all duration-200 ${
            currentTab === 'pricing'
              ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-400/30'
              : 'text-slate-400 group-hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-5 h-5" />
        </div>
        <span
          className={`text-[11px] tracking-tight mt-1 transition-colors ${
            currentTab === 'pricing' ? 'text-amber-300 font-bold' : 'text-slate-400 font-medium'
          }`}
        >
          {t('tabPlans')}
        </span>
      </button>
    </nav>
  );
};
