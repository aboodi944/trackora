import React, { useState, useRef, useEffect } from 'react';
import { Plus, Bell, Shield, Search, Globe, ChevronDown, Check, Cloud, Smartphone } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { LANGUAGES, LanguageCode } from '../i18n/translations';

interface TopBarProps {
  title: string;
  subtitle?: string;
  onOpenAddModal: () => void;
  onSearchClick?: () => void;
  alertCount: number;
  onAlertClick: () => void;
  onOpenDriveModal?: () => void;
  onOpenPlayStoreModal?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  subtitle,
  onOpenAddModal,
  onSearchClick,
  alertCount,
  onAlertClick,
  onOpenDriveModal,
  onOpenPlayStoreModal,
}) => {
  const { t, language, setLanguage, currentOption, isRtl } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement | null>(null);

  // Close language menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (code: LanguageCode) => {
    setLanguage(code);
    setIsLangOpen(false);
  };

  return (
    <header className="h-16 px-3 sm:px-4 bg-[#131720]/95 backdrop-blur-xl border-b border-white/[0.07] flex items-center justify-between gap-2 shrink-0 select-none z-30 transition-colors">
      {/* Brand & Title (Material 3 Top App Bar Header) */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600/30 to-sky-400/20 border border-blue-400/30 flex items-center justify-center shrink-0 shadow-sm">
          <Shield className="w-5 h-5 text-blue-400" />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-bold text-slate-100 tracking-tight leading-tight truncate">
            {title}
          </h1>
          <p className="text-[11px] text-slate-400 leading-tight truncate font-medium">
            {subtitle || t('appSubtitle')}
          </p>
        </div>
      </div>

      {/* Trailing Material 3 Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Language Selector M3 Chip & Menu */}
        <div className="relative" ref={langMenuRef}>
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="h-9 px-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-slate-200 text-xs font-medium flex items-center gap-1.5 active:scale-95 transition-all"
            title={t('switchLanguage')}
            aria-label={t('switchLanguage')}
          >
            <span className="text-sm">{currentOption.flag}</span>
            <span className="hidden sm:inline font-semibold">{currentOption.nativeName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* M3 Elevation Menu */}
          {isLangOpen && (
            <div
              className={`absolute top-11 ${
                isRtl ? 'left-0' : 'right-0'
              } w-44 bg-[#1b1f2b] border border-white/10 rounded-2xl shadow-2xl p-1.5 z-50 space-y-0.5 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl`}
            >
              <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {t('switchLanguage')}
              </div>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors ${
                    language === lang.code
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                  </div>
                  {language === lang.code && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {onSearchClick && (
          <button
            onClick={onSearchClick}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:bg-white/[0.08] active:bg-white/[0.15] transition-colors"
            title="Search"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>
        )}

        {/* Google Drive Cloud Sync */}
        {onOpenDriveModal && (
          <button
            onClick={onOpenDriveModal}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:text-sky-300 hover:bg-sky-500/10 active:bg-sky-500/20 transition-colors relative"
            title={t('googleDriveSync')}
            aria-label={t('googleDriveSync')}
          >
            <Cloud className="w-4 h-4 text-sky-400" />
            <span className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-sky-400 ring-2 ring-[#131720]" />
          </button>
        )}

        {/* Google Play Store Packaging Toolkit */}
        {onOpenPlayStoreModal && (
          <button
            onClick={onOpenPlayStoreModal}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:text-emerald-300 hover:bg-emerald-500/10 active:bg-emerald-500/20 transition-colors relative"
            title={t('playStoreKit')}
            aria-label={t('playStoreKit')}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
          </button>
        )}

        <button
          onClick={onAlertClick}
          className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:bg-white/[0.08] active:bg-white/[0.15] relative transition-colors"
          title="Alerts"
          aria-label="Alerts"
        >
          <Bell className="w-4 h-4" />
          {alertCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-[#131720]" />
          )}
        </button>

        {/* Material 3 Primary Add Asset Button */}
        <button
          onClick={onOpenAddModal}
          className="h-10 px-3.5 sm:px-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/25 active:scale-95 transition-all"
          title={t('addAsset')}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">{t('addAsset')}</span>
        </button>
      </div>
    </header>
  );
};
