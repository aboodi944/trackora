import React, { useState, useEffect, useRef } from 'react';
import { X, Flashlight, Camera, CheckCircle2, AlertTriangle, ArrowRight, CornerDownRight, Laptop, User, MapPin } from 'lucide-react';
import { ITAsset } from '../types/asset';
import { playBeep } from '../utils/audio';
import { useLanguage } from '../i18n/LanguageContext';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: ITAsset[];
  onSelectAsset: (asset: ITAsset) => void;
  onQuickCheckIn: (asset: ITAsset) => void;
  onQuickCheckOut: (asset: ITAsset) => void;
  onAddNewWithTag: (tag: string) => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  assets,
  onSelectAsset,
  onQuickCheckIn,
  onQuickCheckOut,
  onAddNewWithTag,
}) => {
  const { t, isRtl } = useLanguage();
  const [torchOn, setTorchOn] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [scannedAsset, setScannedAsset] = useState<ITAsset | null>(null);
  const [unrecognizedTag, setUnrecognizedTag] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Quick demo test barcodes
  const sampleTags = [
    { tag: 'AST-10024', label: 'MacBook Pro 16" M3 Max' },
    { tag: 'AST-10038', label: 'ThinkPad X1 Carbon Gen 11' },
    { tag: 'AST-10077', label: 'Dell PowerEdge R750 Server' },
    { tag: 'AST-10091', label: 'Cisco Meraki MX85 Firewall' },
    { tag: 'AST-10115', label: 'Dell UltraSharp 4K Display' },
    { tag: 'AST-99999', label: 'New Unregistered Tag' },
  ];

  // Camera initialization
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setScannedAsset(null);
      setUnrecognizedTag(null);
      return;
    }

    let isMounted = true;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API unavailable in this browser context.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setCameraActive(true);
        setCameraError(null);
      } catch (err: unknown) {
        console.warn('Camera stream could not be started:', err);
        setCameraActive(false);
        setCameraError('Camera stream simulated for preview. Use quick tag triggers below.');
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [isOpen]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setTorchOn(false);
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && 'applyConstraints' in track) {
      try {
        const nextState = !torchOn;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setTorchOn(nextState);
      } catch {
        setTorchOn(!torchOn);
      }
    } else {
      setTorchOn(!torchOn);
    }
  };

  const handleProcessTag = (tagInput: string) => {
    const cleanTag = tagInput.trim().toUpperCase();
    if (!cleanTag) return;

    const match = assets.find(
      (a) =>
        a.tag.toUpperCase() === cleanTag ||
        a.serialNumber.toUpperCase() === cleanTag
    );

    if (match) {
      playBeep('success');
      setScannedAsset(match);
      setUnrecognizedTag(null);
    } else {
      playBeep('warning');
      setScannedAsset(null);
      setUnrecognizedTag(cleanTag);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl">
      <div className="w-full max-w-md h-full md:h-[680px] bg-[#141720] md:rounded-[36px] border border-white/10 flex flex-col overflow-hidden shadow-2xl relative">
        {/* Material 3 Top Header */}
        <div className="h-16 px-5 bg-[#171b26]/90 border-b border-white/[0.08] flex items-center justify-between z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Camera className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-100 text-sm">
              {t('scannerTitle')}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleTorch}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                torchOn ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-slate-200 hover:bg-white/10'
              }`}
              title="Flashlight"
            >
              <Flashlight className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors"
              title={t('close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewfinder Viewport */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          {cameraActive ? (
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-radial from-[#181d28] to-black flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center mb-3 shadow-lg">
                <Camera className="w-8 h-8 text-blue-400 animate-pulse" />
              </div>
              <p className="text-xs font-semibold text-slate-200 max-w-xs">
                {t('scannerTitle')}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                {cameraError || t('scannerPrompt')}
              </p>
            </div>
          )}

          {/* Viewfinder HUD Overlay */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            <div className="relative w-64 h-64 border-2 border-blue-400/80 rounded-3xl shadow-[0_0_30px_rgba(59,130,246,0.35)] flex items-center justify-center">
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-400 rounded-tl-xl" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-400 rounded-tr-xl" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-400 rounded-bl-xl" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-400 rounded-br-xl" />

              {/* Animated Laser Barcode Line */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_10px_#ef4444] animate-bounce" />

              <div className="w-4 h-4 border border-blue-400/50 rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-blue-400 rounded-full" />
              </div>
            </div>

            <p className="text-[11px] font-medium text-slate-200 mt-4 bg-black/75 px-4 py-1.5 rounded-full backdrop-blur-xl border border-white/10 shadow-lg">
              {t('scannerPrompt')}
            </p>
          </div>
        </div>

        {/* Material 3 Bottom Drawer */}
        <div className="p-4 bg-[#141720] border-t border-white/[0.08] shrink-0">
          {scannedAsset ? (
            <div className="bg-[#1c212d] border border-emerald-500/30 rounded-3xl p-4 space-y-3 shadow-lg">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        {scannedAsset.tag}
                      </span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full uppercase font-bold">
                        {scannedAsset.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-100 truncate mt-0.5">
                      {scannedAsset.manufacturer} {scannedAsset.model}
                    </h4>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 bg-[#12151d] p-3 rounded-2xl border border-white/[0.05]">
                <div className="flex items-center gap-1.5 truncate">
                  <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">
                    {scannedAsset.assignedUser || 'In Stock'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{scannedAsset.location}</span>
                </div>
              </div>

              {/* Material 3 Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    onSelectAsset(scannedAsset);
                    onClose();
                  }}
                  className="flex-1 py-2.5 px-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <span>{t('openDossier')}</span>
                  <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                </button>

                {scannedAsset.status === 'available' ? (
                  <button
                    onClick={() => {
                      onQuickCheckOut(scannedAsset);
                      onClose();
                    }}
                    className="py-2.5 px-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all active:scale-95 shadow-md"
                  >
                    {t('checkout')}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onQuickCheckIn(scannedAsset);
                      onClose();
                    }}
                    className="py-2.5 px-3.5 rounded-full bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold transition-all active:scale-95"
                  >
                    {t('returnToStock')}
                  </button>
                )}

                <button
                  onClick={() => setScannedAsset(null)}
                  className="py-2 px-3 rounded-full text-slate-400 hover:text-slate-200 text-xs"
                >
                  {t('scanNext')}
                </button>
              </div>
            </div>
          ) : unrecognizedTag ? (
            <div className="bg-[#1c212d] border border-amber-500/30 rounded-3xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">
                    {t('unregisteredTag')}: <span className="font-mono text-amber-400">{unrecognizedTag}</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    This barcode is not yet linked in inventory.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onAddNewWithTag(unrecognizedTag);
                    onClose();
                  }}
                  className="flex-1 py-2.5 px-4 rounded-full bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <span>{t('registerHardware')}</span>
                  <CornerDownRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setUnrecognizedTag(null)}
                  className="py-2 px-4 rounded-full bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-medium"
                >
                  {t('dismiss')}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Search Bar Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="AST-10024..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleProcessTag(manualInput)}
                  className="flex-1 bg-[#1c212d] border border-white/10 rounded-full px-4 py-2.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono uppercase"
                />
                <button
                  onClick={() => handleProcessTag(manualInput)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-full shadow-md active:scale-95 transition-all"
                >
                  {t('verify')}
                </button>
              </div>

              {/* Fast Simulated Scanner Barcodes */}
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5 px-1">
                  {t('testFleetTags')}
                </span>
                <div className="grid grid-cols-2 gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {sampleTags.map((s) => (
                    <button
                      key={s.tag}
                      onClick={() => handleProcessTag(s.tag)}
                      className="text-left p-2 rounded-xl bg-[#1c212d] hover:bg-[#252b3a] border border-white/[0.06] hover:border-blue-400/40 transition-all group"
                    >
                      <div className="font-mono text-[10px] text-blue-400 group-hover:text-blue-300 font-semibold truncate">
                        {s.tag}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {s.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
