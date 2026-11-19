import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  onOpenApkKit?: () => void;
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  onOpenApkKit,
  compact = false,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-500/25 active:scale-95 transition-all ${
          compact ? 'h-9 px-3 text-xs' : 'px-3.5 py-1.5 text-xs'
        }`}
        title="Install Trackora App on Android / Device"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-200 transition"
        >
          <Smartphone className="w-3.5 h-3.5 text-blue-400" />
          <span>Install App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl bg-[#131720] border border-white/10 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-100">Install on iPhone / iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                1. Tap the <strong className="text-white">Share</strong> button in Safari toolbar.
                <br />
                2. Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-full bg-blue-600 hover:bg-blue-500 py-2.5 text-xs font-semibold text-white transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  if (onOpenApkKit) {
    return (
      <button
        onClick={onOpenApkKit}
        className={`flex items-center gap-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 font-semibold active:scale-95 transition-all ${
          compact ? 'h-9 px-3 text-xs' : 'px-3 py-1 text-[11px]'
        }`}
        title="Get Android APK & Play Store Package"
      >
        <Download className="w-3.5 h-3.5 text-emerald-400" />
        <span>Get APK</span>
      </button>
    );
  }

  return null;
};
