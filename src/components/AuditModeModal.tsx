import React, { useState } from 'react';
import { X, ClipboardCheck, CheckCircle2, AlertCircle, MapPin, Scan, Check, RefreshCw } from 'lucide-react';
import { ITAsset } from '../types/asset';
import { playBeep } from '../utils/audio';
import confetti from 'canvas-confetti';
import { useLanguage } from '../i18n/LanguageContext';

interface AuditModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: ITAsset[];
  onCompleteAudit: (verifiedTagIds: string[], location: string) => void;
  onUpdateAssetLocation: (tag: string, newLocation: string) => void;
}

export const AuditModeModal: React.FC<AuditModeModalProps> = ({
  isOpen,
  onClose,
  assets,
  onCompleteAudit,
  onUpdateAssetLocation,
}) => {
  const { t, isRtl } = useLanguage();
  // Unique list of locations
  const locations = Array.from(new Set(assets.map((a) => a.location))).filter(Boolean);
  const [selectedLocation, setSelectedLocation] = useState<string>(locations[0] || 'HQ - Storage Cage B (Shelf 02)');

  // Assets expected at selected location
  const expectedAssets = assets.filter((a) => a.location === selectedLocation);
  const [scannedTags, setScannedTags] = useState<Set<string>>(new Set());
  const [mismatchTags, setMismatchTags] = useState<{ tag: string; originalLocation: string }[]>([]);
  const [inputTag, setInputTag] = useState('');
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen) return null;

  const handleScanTag = (tagInput: string) => {
    const cleanTag = tagInput.trim().toUpperCase();
    if (!cleanTag) return;

    const matchedAsset = assets.find(
      (a) => a.tag.toUpperCase() === cleanTag || a.serialNumber.toUpperCase() === cleanTag
    );

    if (!matchedAsset) {
      playBeep('error');
      alert(`Tag ${cleanTag} not found in enterprise registry.`);
      return;
    }

    if (matchedAsset.location === selectedLocation) {
      playBeep('success');
      setScannedTags((prev) => new Set([...prev, matchedAsset.tag]));
    } else {
      playBeep('warning');
      if (!mismatchTags.some((m) => m.tag === matchedAsset.tag)) {
        setMismatchTags((prev) => [
          ...prev,
          { tag: matchedAsset.tag, originalLocation: matchedAsset.location },
        ]);
      }
      setScannedTags((prev) => new Set([...prev, matchedAsset.tag]));
    }

    setInputTag('');
  };

  const handleReconcileMismatch = (tag: string) => {
    onUpdateAssetLocation(tag, selectedLocation);
    setMismatchTags((prev) => prev.filter((m) => m.tag !== tag));
    playBeep('success');
  };

  const handleFinishSession = () => {
    setIsFinished(true);
    playBeep('success');
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
    });
    onCompleteAudit(Array.from(scannedTags), selectedLocation);
  };

  const handleResetSession = () => {
    setScannedTags(new Set());
    setMismatchTags([]);
    setIsFinished(false);
  };

  const verifiedCount = expectedAssets.filter((a) => scannedTags.has(a.tag)).length;
  const missingCount = expectedAssets.length - verifiedCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl">
      <div className="w-full max-w-xl bg-[#141720] rounded-[32px] border border-white/10 flex flex-col max-h-[92vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="h-16 px-5 bg-[#171b26]/90 border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">
                {t('auditTitle')}
              </h3>
              <p className="text-[11px] text-slate-400">
                {t('auditSubtitle')}
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

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Audit Location Target */}
          <div className="bg-[#1b202c] p-4 rounded-3xl border border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-2.5 min-w-0">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[11px] text-slate-400 block">{t('targetZone')}</span>
                <select
                  value={selectedLocation}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value);
                    handleResetSession();
                  }}
                  className="bg-[#141720] border border-white/10 rounded-full px-3 py-1.5 text-xs text-slate-100 font-semibold focus:outline-none focus:border-blue-500 mt-1 max-w-xs truncate"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="bg-[#141720] px-3.5 py-2 rounded-2xl border border-white/[0.05] text-center">
                <span className="text-[10px] text-slate-400 block">{t('expected')}</span>
                <span className="text-sm font-bold text-slate-100 font-mono">
                  {expectedAssets.length}
                </span>
              </div>
              <div className="bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-2 rounded-2xl text-center">
                <span className="text-[10px] text-emerald-300 block">{t('verified')}</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {verifiedCount}
                </span>
              </div>
              <div className="bg-rose-500/15 border border-rose-500/30 px-3.5 py-2 rounded-2xl text-center">
                <span className="text-[10px] text-rose-300 block">{t('unverified')}</span>
                <span className="text-sm font-bold text-rose-400 font-mono">
                  {missingCount}
                </span>
              </div>
            </div>
          </div>

          {/* Barcode Quick Trigger */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="AST-10024..."
              value={inputTag}
              onChange={(e) => setInputTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScanTag(inputTag)}
              className="flex-1 bg-[#1b202c] border border-white/10 rounded-full px-4 py-2.5 text-xs text-slate-100 placeholder-slate-400 font-mono uppercase focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => handleScanTag(inputTag)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0"
            >
              <Scan className="w-3.5 h-3.5" />
              <span>{t('verify')}</span>
            </button>
          </div>

          {/* Discrepancy Alerts */}
          {mismatchTags.length > 0 && (
            <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Discrepancy ({mismatchTags.length})</span>
              </div>
              <div className="space-y-1.5">
                {mismatchTags.map((m) => (
                  <div
                    key={m.tag}
                    className="flex items-center justify-between bg-[#15120e] p-2.5 rounded-xl border border-amber-500/20"
                  >
                    <div>
                      <span className="font-mono text-amber-400 font-bold">{m.tag}</span>
                      <span className="text-slate-400 ml-2">({m.originalLocation})</span>
                    </div>
                    <button
                      onClick={() => handleReconcileMismatch(m.tag)}
                      className="px-3 py-1 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-semibold text-[11px] transition-colors"
                    >
                      Update
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expected Assets Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-200">
                {t('expected')} ({expectedAssets.length})
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {expectedAssets.map((asset) => {
                const isVerified = scannedTags.has(asset.tag);
                return (
                  <div
                    key={asset.id}
                    onClick={() => handleScanTag(asset.tag)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isVerified
                        ? 'bg-emerald-950/25 border-emerald-500/30 text-emerald-200'
                        : 'bg-[#1b202c] hover:bg-[#232938] border-white/[0.06] text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                          isVerified
                            ? 'bg-emerald-500 text-slate-950'
                            : 'border border-slate-600 text-slate-600'
                        }`}
                      >
                        {isVerified ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-slate-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs">{asset.tag}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            SN: {asset.serialNumber}
                          </span>
                        </div>
                        <div className="text-slate-100 font-medium truncate mt-0.5">
                          {asset.manufacturer} {asset.model}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                          isVerified
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-white/10 text-slate-400'
                        }`}
                      >
                        {isVerified ? t('verified') : t('unverified')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#171b26]/90 border-t border-white/[0.08] flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={handleResetSession}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-slate-400 hover:text-slate-200 text-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-full text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors"
            >
              {t('close')}
            </button>
            <button
              onClick={handleFinishSession}
              disabled={isFinished}
              className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-500/25 active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isFinished ? t('auditCompleted') : t('completeAudit')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
