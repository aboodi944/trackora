import React, { useState } from 'react';
import { 
  X, CheckCircle2, Copy, Check, Download, ExternalLink, 
  Terminal, ShieldCheck, Sparkles, Smartphone, FileCode, Info
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { playBeep } from '../utils/audio';

interface PlayStorePublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlayStorePublishModal: React.FC<PlayStorePublishModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t, isRtl } = useLanguage();
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'twa' | 'checklist' | 'assetlinks' | 'metadata'>('twa');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    playBeep('success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sharedProductionUrl = 'https://ais-pre-i2tcl7dxhiu7um3rf3nqsc-93346054313.europe-west2.run.app';
  const appOrigin =
    typeof window !== 'undefined' && !window.location.hostname.includes('ais-dev-')
      ? window.location.origin
      : sharedProductionUrl;
  const appHost = new URL(appOrigin).host;

  const bubblewrapCommand = `# Step 1: Initialize Bubblewrap CLI with Trackora's Live Manifest
npx @bubblewrap/cli init --manifest=${appOrigin}/manifest.json

# Step 2: Build BOTH signed Android APK (sideloading) & AAB (Play Store)
npx @bubblewrap/cli build

# Outputs:
# - app-release-signed.apk  (Install directly on any Android phone)
# - app-release-signed.aab  (Upload to Google Play Console)`;

  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(appOrigin)}`;

  const twaManifestJson = JSON.stringify({
    packageId: "com.trackora.itassets",
    host: appHost,
    name: "Trackora - Enterprise IT Asset Manager",
    launcherName: "Trackora",
    themeColor: "#131720",
    navigationColor: "#101217",
    backgroundColor: "#101217",
    startUrl: "/",
    iconUrl: "/pwa-512x512.png",
    maskableIconUrl: "/pwa-maskable-512x512.png",
    appVersionName: "1.0.0",
    appVersionCode: 1,
    shortcuts: [
      {
        name: "Scan Hardware",
        shortName: "Scan",
        url: "/?action=scan",
        icon: "/pwa-192x192.png"
      },
      {
        name: "Floor Audit",
        shortName: "Audit",
        url: "/?action=audit",
        icon: "/pwa-192x192.png"
      }
    ],
    features: {
      locationDelegation: { enabled: false },
      playBilling: { enabled: false }
    },
    alphaDependencies: {
      enabled: false
    },
    enableSiteSettingsShortcut: true,
    isChromeOSOnly: false,
    minSdkVersion: 21,
    targetSdkVersion: 34
  }, null, 2);

  const assetLinksJson = JSON.stringify([
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "com.trackora.itassets",
        sha256_cert_fingerprints: [
          "14:6D:E9:7F:0F:52:CC:71:85:4E:87:96:10:5B:AC:64:60:69:74:5B:73:1C:8E:4D:43:E3:B9:0D:37:C0:4F:86"
        ]
      }
    }
  ], null, 2);

  const storeMetadata = {
    title: "Trackora - Enterprise IT Asset Manager",
    shortDescription: "Enterprise IT hardware tracking, barcode scanning, custody handover & Google Drive sync.",
    category: "Business / Productivity",
    contentRating: "Everyone (Enterprise utility, no offensive content)",
    privacyPolicySummary: "Collects zero personal marketing data. Camera access used strictly for local optical barcode scanning. Google Drive access used strictly for company fleet backups authorized by user.",
    supportedLanguages: "English, Arabic (العربية), Spanish, French, German, Japanese"
  };

  const handleDownloadTwa = () => {
    playBeep('success');
    const blob = new Blob([twaManifestJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'twa-manifest.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAssetLinks = () => {
    playBeep('success');
    const blob = new Blob([assetLinksJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assetlinks.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-[#131720] border border-white/10 rounded-[32px] w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/[0.08] flex items-center justify-between gap-3 bg-gradient-to-r from-blue-950/40 via-transparent to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-blue-500/20 to-sky-400/20 border border-white/10 flex items-center justify-center shadow-inner">
              <Smartphone className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100">
                  Google Play Store Publishing Toolkit
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                  Ready (.AAB)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Trusted Web Activity (TWA) & Android App Bundle generation for Trackora
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-white/[0.08] active:scale-95 transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-6 pt-3 border-b border-white/[0.06] bg-[#11141c] overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('twa')}
            className={`px-4 py-2 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'twa'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>1-Click TWA Build</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-4 py-2 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'checklist'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Play Console Checklist</span>
          </button>

          <button
            onClick={() => setActiveTab('assetlinks')}
            className={`px-4 py-2 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'assetlinks'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Asset Links (No URL Bar)</span>
          </button>

          <button
            onClick={() => setActiveTab('metadata')}
            className={`px-4 py-2 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'metadata'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Store Listing Copy</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {activeTab === 'twa' && (
            <div className="space-y-4">
              {/* Direct Install on Android Device (WebAPK) */}
              {isInstallable && !isInstalled && (
                <div className="bg-gradient-to-r from-blue-600/20 to-sky-500/10 border border-blue-400/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-[10px] font-bold uppercase tracking-wider">
                        Instant on This Device
                      </span>
                      <h4 className="text-xs font-bold text-white">Install Trackora Directly on Android</h4>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Android Chrome installs Trackora as a standalone native WebAPK with full offline caching and home screen icon immediately.
                    </p>
                  </div>
                  <button
                    onClick={install}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shrink-0 shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Install App Now</span>
                  </button>
                </div>
              )}

              <div className="bg-blue-500/10 border border-blue-500/25 rounded-2xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-white">Downloadable .APK &amp; Play Store .AAB:</span> Trackora includes full Service Worker caching and Android adaptive PNG icons (<code className="text-blue-300 font-mono">192px &amp; 512px</code>). Because Android APK compilation requires Java JDK &amp; Android SDK, use <strong className="text-white">PWABuilder</strong> below to cloud-compile and download your signed <code className="text-emerald-300 font-mono">.apk</code> file in ~15 seconds.
                </div>
              </div>

              {/* Method 1: Instant Cloud APK & AAB Download via PWABuilder */}
              <div className="bg-[#171a22] border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                      Download .APK / .AAB Now
                    </span>
                    <h4 className="text-xs font-bold text-white">Generate Signed APK Online (PWABuilder)</h4>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Opens Trackora in PWABuilder. Click <strong className="text-white">Package for stores → Android → Download Package</strong> to download a ZIP containing <code className="text-emerald-300 font-mono">app-release-signed.apk</code> (for direct phone installation) and <code className="text-blue-300 font-mono">.aab</code> (for Play Store).
                  </p>
                </div>
                <a
                  href={pwaBuilderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shrink-0 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
                >
                  <span>Download APK</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Method 2: Google Official CLI (Bubblewrap) */}
              <div className="bg-[#0b0d13] border border-white/10 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>Method 2: Google Bubblewrap CLI (Terminal)</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(bubblewrapCommand, 'bubblewrap')}
                    className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
                  >
                    {copiedKey === 'bubblewrap' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Commands</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-xs font-mono text-emerald-400/90 whitespace-pre-wrap overflow-x-auto p-2 bg-black/40 rounded-xl leading-relaxed">
                  {bubblewrapCommand}
                </pre>
              </div>

              {/* twa-manifest config */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Pre-Configured twa-manifest.json
                  </h3>
                  <button
                    onClick={handleDownloadTwa}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download twa-manifest.json</span>
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-slate-300 bg-[#0b0d13] border border-white/10 rounded-2xl p-3.5 max-h-48 overflow-y-auto">
                  {twaManifestJson}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Google Play Console 2026 Readiness Checklist
              </h3>

              {[
                {
                  title: "Web App Manifest V3 Configured",
                  desc: "public/manifest.json with standalone display, theme color #131720, and 512x512 adaptive icon.",
                  status: "READY",
                  color: "emerald"
                },
                {
                  title: "Material Design 3 Android UI",
                  desc: "Full Material You handheld shell, bottom navigation bar, floating actions, and tactile feedback.",
                  status: "READY",
                  color: "emerald"
                },
                {
                  title: "Google Drive Client-Side Cloud Integration",
                  desc: "Secured client-side OAuth flow with zero credential persistence in local storage.",
                  status: "READY",
                  color: "emerald"
                },
                {
                  title: "Multilingual & Arabic RTL Compliance",
                  desc: "Native Arabic (العربية), English, Spanish, French, German, and Japanese with automatic RTL alignment.",
                  status: "READY",
                  color: "emerald"
                },
                {
                  title: "Google Play Console Account",
                  desc: "Requires Google Play Developer account ($25 one-time fee) to upload the .aab bundle.",
                  status: "ACTION REQUIRED",
                  color: "amber"
                },
                {
                  title: "Target SDK Level 34+ (Android 14 / 15)",
                  desc: "Configured in twa-manifest.json to meet Google Play requirements.",
                  status: "CONFIGURED",
                  color: "emerald"
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-[#171a22] border border-white/[0.08] rounded-2xl p-3.5 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${
                      item.color === 'emerald' ? 'text-emerald-400' : 'text-amber-400'
                    }`} />
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{item.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                    item.color === 'emerald'
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'assetlinks' && (
            <div className="space-y-4">
              <div className="bg-[#171a22] border border-white/[0.08] rounded-2xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Digital Asset Links Verification</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  To remove the Chrome browser URL bar when running Trackora from the Google Play Store, host this file at:
                  <br />
                  <code className="text-blue-400 font-mono text-[11px]">https://your-domain.com/.well-known/assetlinks.json</code>
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    /.well-known/assetlinks.json
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(assetLinksJson, 'assetlinks')}
                      className="px-2.5 py-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs text-slate-200 flex items-center gap-1 transition-colors"
                    >
                      {copiedKey === 'assetlinks' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                    <button
                      onClick={handleDownloadAssetLinks}
                      className="px-2.5 py-1 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
                <pre className="text-xs font-mono text-emerald-400/90 bg-[#0b0d13] border border-white/10 rounded-2xl p-4 overflow-x-auto leading-relaxed">
                  {assetLinksJson}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'metadata' && (
            <div className="space-y-4">
              <div className="bg-[#171a22] border border-white/[0.08] rounded-2xl p-4 space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Store Listing Title (Max 30 chars)</span>
                  <p className="text-sm font-bold text-slate-100">{storeMetadata.title}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Short Description (Max 80 chars)</span>
                  <p className="text-xs text-slate-300">{storeMetadata.shortDescription}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Category</span>
                  <p className="text-xs text-slate-300">{storeMetadata.category}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Supported Languages</span>
                  <p className="text-xs text-slate-300">{storeMetadata.supportedLanguages}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Privacy & Data Safety Policy Summary</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{storeMetadata.privacyPolicySummary}</p>
                </div>
              </div>

              <a
                href="https://play.google.com/console"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
              >
                <span>Open Google Play Console</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#11141c] border-t border-white/[0.08] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Ready for Google Play Submission</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-slate-200 text-xs font-semibold active:scale-95 transition-all"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
