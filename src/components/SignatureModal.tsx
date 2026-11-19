import React, { useRef, useState, useEffect } from 'react';
import { X, Check, RotateCcw, PenTool, ShieldCheck, Laptop } from 'lucide-react';
import { ITAsset, Department } from '../types/asset';
import { playBeep } from '../utils/audio';
import { useLanguage } from '../i18n/LanguageContext';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: ITAsset | null;
  onConfirmHandover: (custodyData: {
    assignedTo: string;
    employeeEmail: string;
    department: Department;
    condition: 'Brand New' | 'Excellent' | 'Good' | 'Fair';
    signatureDataUrl: string;
    notes?: string;
  }) => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  asset,
  onConfirmHandover,
}) => {
  const { t, isRtl } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const [employeeName, setEmployeeName] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [department, setDepartment] = useState<Department>('Engineering');
  const [condition, setCondition] = useState<'Brand New' | 'Excellent' | 'Good' | 'Fair'>('Excellent');
  const [notes, setNotes] = useState('');

  // Setup canvas
  useEffect(() => {
    if (!isOpen) return;
    setHasSignature(false);
    setEmployeeName('');
    setEmployeeEmail('');
    setNotes('');

    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      ctx.scale(2, 2);
      ctx.strokeStyle = '#38bdf8'; // Sky blue ink
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen || !asset) return null;

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleConfirm = () => {
    if (!employeeName.trim()) {
      alert('Please enter employee name.');
      return;
    }
    const canvas = canvasRef.current;
    const signatureDataUrl = canvas ? canvas.toDataURL('image/png') : '';

    playBeep('success');
    onConfirmHandover({
      assignedTo: employeeName.trim(),
      employeeEmail: employeeEmail.trim() || `${employeeName.toLowerCase().replace(/\s+/g, '.')}@company.com`,
      department,
      condition,
      signatureDataUrl,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl">
      <div className="w-full max-w-lg bg-[#141720] rounded-[32px] border border-white/10 flex flex-col max-h-[92vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="h-16 px-5 bg-[#171b26]/90 border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">
                {t('custodyTitle')}
              </h3>
              <p className="text-[11px] text-slate-400">
                {t('custodySubtitle')}
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

        {/* Scrollable Form Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Target Asset Summary */}
          <div className="bg-[#1b202c] p-3.5 rounded-2xl border border-white/[0.07] flex items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Laptop className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-400">
                    {asset.tag}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    SN: {asset.serialNumber}
                  </span>
                </div>
                <div className="text-slate-100 font-semibold truncate mt-0.5">
                  {asset.manufacturer} {asset.model}
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                {t('assigneeName')} *
              </label>
              <input
                type="text"
                placeholder="Jordan Hayes"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="w-full bg-[#1c212d] border border-white/10 focus:border-blue-500 rounded-full px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                {t('corporateEmail')}
              </label>
              <input
                type="email"
                placeholder="j.hayes@company.com"
                value={employeeEmail}
                onChange={(e) => setEmployeeEmail(e.target.value)}
                className="w-full bg-[#1c212d] border border-white/10 focus:border-blue-500 rounded-full px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                {t('department')}
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full bg-[#1c212d] border border-white/10 focus:border-blue-500 rounded-2xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none transition-colors"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product & Design">Product & Design</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Finance & Legal">Finance & Legal</option>
                <option value="IT & Infrastructure">IT & Infrastructure</option>
                <option value="Executive">Executive</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                {t('condition')}
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as 'Brand New' | 'Excellent' | 'Good' | 'Fair')}
                className="w-full bg-[#1c212d] border border-white/10 focus:border-blue-500 rounded-2xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none transition-colors"
              >
                <option value="Brand New">Brand New</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>
          </div>

          {/* Legal Handover Notice */}
          <div className="bg-[#1b202c] p-3.5 rounded-2xl border border-white/[0.06] text-[11px] text-slate-300 space-y-1">
            <span className="font-bold text-slate-200 block">
              {t('custodyTitle')}
            </span>
            <p className="text-slate-400 leading-relaxed">
              {t('custodyNotice')}
            </p>
          </div>

          {/* Touch Signature Pad */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                <PenTool className="w-3.5 h-3.5 text-blue-400" />
                <span>{t('signaturePrompt')}</span>
              </label>
              <button
                type="button"
                onClick={clearCanvas}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 hover:underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t('clearSignature')}</span>
              </button>
            </div>

            <div className="relative border-2 border-dashed border-white/15 rounded-3xl bg-[#101217] overflow-hidden h-36 shadow-inner">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full cursor-crosshair touch-none"
              />
              {!hasSignature && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-500 text-xs italic">
                  {t('signaturePrompt')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#171b26]/90 border-t border-white/[0.08] flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-white/10 text-xs font-semibold transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/25 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>{t('confirmHandover')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
