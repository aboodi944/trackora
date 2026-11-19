import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Wifi, BatteryCharging, Sparkles, Download, RotateCcw } from 'lucide-react';
import { PricingTier } from '../types/asset';
import { useLanguage } from '../i18n/LanguageContext';
import { PWAInstallButton } from './PWAInstallButton';

interface AndroidFrameProps {
  children: React.ReactNode;
  activeTier: PricingTier;
  onOpenMonetization: () => void;
  onResetData: () => void;
  onExportData: () => void;
  onOpenPlayStore?: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  activeTier,
  onOpenMonetization,
  onResetData,
  onExportData,
  onOpenPlayStore,
}) => {
  const { t, isRtl, dir } = useLanguage();
  const [isMobileMode, setIsMobileMode] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const hours = d.getHours().toString().padStart(2, '0');
      const minutes = d.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0d0f14] text-slate-100 flex flex-col font-sans selection:bg-blue-600">
      {/* Top Preview Control Bar for Enterprise Admins */}
      <div className="bg-[#13161f] border-b border-white/[0.08] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-500/20" />
            <span className="font-bold text-slate-100 tracking-tight text-sm">
              {t('appName')}
            </span>
            <span className="hidden sm:inline text-slate-500">·</span>
            <span className="hidden sm:inline text-slate-400">
              Material 3 Android IT Console
            </span>
          </div>

          <button
            onClick={onOpenMonetization}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:border-amber-400 transition-colors font-medium text-[11px]"
            title="View SaaS Tiers and ROI Calculator"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="uppercase tracking-wider font-semibold">
              {t('planPrefix')}: {activeTier.toUpperCase()}
            </span>
          </button>

          <PWAInstallButton onOpenApkKit={onOpenPlayStore} />

          {onOpenPlayStore && (
            <button
              onClick={onOpenPlayStore}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400 transition-colors font-semibold text-[11px]"
              title="Download Android APK & Google Play Store Package Kit"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>APK / Play Store</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Viewport Form Factor Toggle with Material 3 Pill */}
          <div className="flex items-center bg-[#0d0f14] p-0.5 rounded-full border border-white/[0.08]">
            <button
              onClick={() => setIsMobileMode(true)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                isMobileMode
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Android Mobile Device Handheld view"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{t('androidView')}</span>
            </button>
            <button
              onClick={() => setIsMobileMode(false)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                !isMobileMode
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Enterprise Desktop/Tablet Console view"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>{t('desktopConsole')}</span>
            </button>
          </div>

          <button
            onClick={onExportData}
            className="p-2 text-slate-400 hover:text-slate-200 rounded-full hover:bg-white/[0.08] transition-colors"
            title="Export JSON"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onResetData}
            className="p-2 text-slate-400 hover:text-rose-400 rounded-full hover:bg-white/[0.08] transition-colors"
            title="Reset Data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Container: Android Smartphone Frame vs Wide Desktop Canvas */}
      <div className="flex-1 flex items-center justify-center p-0 md:p-6 bg-radial from-[#13161f] to-[#0a0c10] overflow-hidden">
        {isMobileMode ? (
          /* Modern Material 3 Android Handheld (Pixel / Galaxy Form Factor) */
          <div className="w-full max-w-[420px] h-[100dvh] md:h-[875px] bg-[#101217] md:rounded-[44px] md:border-[10px] md:border-[#1a1e27] md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08)] flex flex-col relative overflow-hidden ring-1 ring-white/10">
            {/* Front Camera Punch-hole */}
            <div className="hidden md:flex absolute top-2.5 left-1/2 -translate-x-1/2 z-40 items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-full bg-black border border-white/20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#181b22]" />
              </div>
            </div>

            {/* Android 14/15 Material 3 Status Bar */}
            <div className="h-10 pt-1.5 px-6 flex items-center justify-between text-xs font-semibold text-slate-300 z-30 select-none bg-[#101217]/90 backdrop-blur-md">
              <span className="tracking-tight font-mono">{currentTime}</span>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-[10px] text-blue-400 font-mono font-bold">5G</span>
                <Wifi className="w-3.5 h-3.5" />
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-mono">98%</span>
                  <BatteryCharging className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            </div>

            {/* App Viewport */}
            <div className="flex-1 flex flex-col overflow-hidden relative bg-[#101217]">
              {children}
            </div>

            {/* Android M3 Gesture Bar */}
            <div className="h-3 pb-1 flex items-center justify-center bg-[#101217] z-30 select-none">
              <div className="w-28 h-1 bg-white/30 rounded-full" />
            </div>
          </div>
        ) : (
          /* Full Desktop / Tablet IT Command Center with Material 3 Elevation */
          <div className="w-full max-w-7xl h-[100dvh] md:h-[90vh] bg-[#101217] rounded-3xl border border-white/[0.08] shadow-2xl flex flex-col overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
