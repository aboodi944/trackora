import React, { useState } from 'react';
import { X, Printer, QrCode, Tag, Sparkles } from 'lucide-react';
import { ITAsset } from '../types/asset';
import { generateQRCodeGrid, generateBarcodeBars } from '../utils/qr';
import { useLanguage } from '../i18n/LanguageContext';

interface PrintLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: ITAsset | null;
}

export const PrintLabelModal: React.FC<PrintLabelModalProps> = ({
  isOpen,
  onClose,
  asset,
}) => {
  const { t } = useLanguage();
  const [labelSize, setLabelSize] = useState<'standard' | 'compact'>('standard');
  const [copies, setCopies] = useState<number>(1);

  if (!isOpen || !asset) return null;

  const qrGrid = generateQRCodeGrid(asset.tag, 21);
  const barcodeBars = generateBarcodeBars(asset.tag);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl">
      <div className="w-full max-w-md bg-[#141720] rounded-[32px] border border-white/10 flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="h-16 px-5 bg-[#171b26]/90 border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">
                {t('printSticker')}
              </h3>
              <p className="text-[11px] text-slate-400">
                Thermal Sticker Ready (Zebra / Brother / DYMO)
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

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Label Configuration */}
          <div className="flex items-center justify-between gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <div>
              <span className="text-[11px] text-slate-400 block">Sticker Format</span>
              <div className="flex items-center gap-1.5 mt-1">
                <button
                  onClick={() => setLabelSize('standard')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    labelSize === 'standard'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-900'
                  }`}
                >
                  3" × 2" Standard
                </button>
                <button
                  onClick={() => setLabelSize('compact')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    labelSize === 'compact'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-900'
                  }`}
                >
                  2" × 1" Compact
                </button>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">Copies</span>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => setCopies(num)}
                    className={`w-7 h-7 rounded-md text-xs font-semibold flex items-center justify-center transition-colors ${
                      copies === num
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Physical Asset Tag Preview (Sticker Look) */}
          <div className="flex items-center justify-center py-2">
            <div
              id="printable-label"
              className={`bg-white text-slate-950 rounded-lg p-3.5 shadow-2xl border-2 border-slate-300 font-mono flex flex-col justify-between transition-all select-none ${
                labelSize === 'standard' ? 'w-80 h-48' : 'w-72 h-36'
              }`}
            >
              {/* Sticker Top Header */}
              <div className="flex items-center justify-between border-b border-black/20 pb-1">
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 bg-black rounded-xs" />
                  <span className="text-[10px] font-extrabold tracking-wider uppercase font-sans">
                    Trackora Enterprise IT
                  </span>
                </div>
                <span className="text-[9px] font-bold tracking-tight text-slate-700 font-sans">
                  ASSET TAG
                </span>
              </div>

              {/* Middle Row: Tag Number + QR Code */}
              <div className="flex items-center justify-between gap-3 my-auto">
                <div className="flex-1 min-w-0">
                  <div className="text-xl font-black tracking-tight text-black leading-none">
                    {asset.tag}
                  </div>
                  <div className="text-[10px] font-bold text-slate-800 truncate mt-1">
                    {asset.manufacturer} {asset.model}
                  </div>
                  <div className="text-[9px] text-slate-600 truncate mt-0.5">
                    SN: {asset.serialNumber}
                  </div>
                </div>

                {/* SVG QR Code */}
                <div className="w-16 h-16 shrink-0 bg-white p-0.5 border border-black flex items-center justify-center">
                  <svg
                    viewBox={`0 0 ${qrGrid.length} ${qrGrid.length}`}
                    className="w-full h-full shape-rendering-crispEdges"
                  >
                    {qrGrid.map((row, r) =>
                      row.map((cell, c) =>
                        cell ? (
                          <rect
                            key={`${r}-${c}`}
                            x={c}
                            y={r}
                            width="1"
                            height="1"
                            fill="#000"
                          />
                        ) : null
                      )
                    )}
                  </svg>
                </div>
              </div>

              {/* Barcode representation */}
              <div className="flex flex-col items-center justify-center pt-1 border-t border-black/15">
                <div className="flex items-end h-6 gap-[1.5px] justify-center overflow-hidden w-full px-2">
                  {barcodeBars.map((width, idx) => (
                    <div
                      key={idx}
                      className="bg-black h-full"
                      style={{ width: `${width * 1.5}px` }}
                    />
                  ))}
                </div>
                <span className="text-[8px] tracking-widest text-slate-700 mt-0.5 font-bold">
                  * {asset.tag} *
                </span>
              </div>

              {/* Warning micro-text */}
              <div className="text-[7px] text-center font-bold text-slate-800 tracking-tighter uppercase">
                Property of Trackora IT Dept — Tampering Void &amp; Prohibited
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <span className="text-[11px] text-slate-400">
            {copies} {copies === 1 ? 'sticker' : 'stickers'} queued
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Sticker Label</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
