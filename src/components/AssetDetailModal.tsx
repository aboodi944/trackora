import React, { useState } from 'react';
import { 
  X, Tag, Calendar, DollarSign, Shield, Cpu, HardDrive, 
  MapPin, User, PenTool, Wrench, Printer, Trash2, Edit3, 
  CheckCircle2, Clock, Check, FileText
} from 'lucide-react';
import { ITAsset, MaintenanceLog } from '../types/asset';
import { calculateDepreciation, formatCurrency, getStatusDetails, getDaysUntilWarranty } from '../utils/assetCalculations';
import { useLanguage } from '../i18n/LanguageContext';

interface AssetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: ITAsset | null;
  onCheckOut: (asset: ITAsset) => void;
  onCheckIn: (asset: ITAsset) => void;
  onPrintLabel: (asset: ITAsset) => void;
  onEdit: (asset: ITAsset) => void;
  onDelete: (id: string) => void;
  onAddMaintenance: (assetId: string, log: Omit<MaintenanceLog, 'id'>) => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  isOpen,
  onClose,
  asset,
  onCheckOut,
  onCheckIn,
  onPrintLabel,
  onEdit,
  onDelete,
  onAddMaintenance,
}) => {
  const { t, isRtl } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'custody' | 'maintenance'>('overview');
  
  // Maintenance entry form state
  const [showMntForm, setShowMntForm] = useState(false);
  const [mntIssue, setMntIssue] = useState('');
  const [mntCost, setMntCost] = useState('0');
  const [mntTech, setMntTech] = useState('Alex Rivera (IT Lead)');
  const [mntNotes, setMntNotes] = useState('');

  if (!isOpen || !asset) return null;

  const dep = calculateDepreciation(asset);
  const statusInfo = getStatusDetails(asset.status);
  const warranty = getDaysUntilWarranty(asset.warrantyExpires);

  const handleCreateMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mntIssue.trim()) return;
    onAddMaintenance(asset.id, {
      date: new Date().toISOString().split('T')[0],
      issue: mntIssue.trim(),
      technician: mntTech.trim(),
      cost: parseFloat(mntCost) || 0,
      status: 'resolved',
      notes: mntNotes.trim(),
    });
    setMntIssue('');
    setMntCost('0');
    setMntNotes('');
    setShowMntForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl">
      <div className="w-full max-w-2xl bg-[#141720] rounded-[32px] border border-white/10 flex flex-col max-h-[94vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#171b26]/90 border-b border-white/[0.08] flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
              <Tag className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {asset.tag}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${statusInfo.bg}`}>
                  {statusInfo.label}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  SN: {asset.serialNumber}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 truncate mt-1">
                {asset.manufacturer} {asset.model}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{asset.location}</span>
                </span>
                <span>·</span>
                <span className="capitalize">{asset.category}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onPrintLabel(asset)}
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
              title="Print Barcode Tag"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(asset)}
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
              title="Edit Asset"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-950 border-b border-slate-800/80 text-xs overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Overview &amp; Valuation
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'specs'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Hardware Specs
          </button>
          <button
            onClick={() => setActiveTab('custody')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'custody'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Custody Handover ({asset.custodyHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'maintenance'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Repairs &amp; RMA ({asset.maintenanceHistory.length})
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Financial Depreciation Card */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>Real-Time Straight-Line Depreciation Ledger</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {dep.elapsedMonths} of {asset.lifespanMonths} mos amortized
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Purchase Cost</span>
                    <span className="text-sm font-bold text-slate-100 font-mono">
                      {formatCurrency(asset.purchaseCost)}
                    </span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Depreciation</span>
                    <span className="text-sm font-bold text-rose-400 font-mono">
                      -{formatCurrency(dep.accumulatedDepreciation)}
                    </span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Current Book Value</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      {formatCurrency(dep.currentBookValue)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Depreciation Lifespan</span>
                    <span className="font-mono">{dep.percentDepreciated}% Amortized</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${dep.percentDepreciated}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Assignment & Warranty Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Assignment Info */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                  <span className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-400" />
                    <span>Current Custody Assignment</span>
                  </span>
                  {asset.assignedUser ? (
                    <div>
                      <div className="text-sm font-semibold text-slate-100">
                        {asset.assignedUser}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {asset.assignedEmail}
                      </div>
                      <div className="text-[11px] text-blue-400 font-medium mt-1">
                        Department: {asset.department || 'Unassigned'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-xs py-2">
                      Device is in IT storage stock (Unassigned).
                    </div>
                  )}
                </div>

                {/* Warranty Info */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                  <span className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>Warranty &amp; Support Status</span>
                  </span>
                  <div>
                    <div className="text-xs text-slate-200 font-medium">
                      Expires: {asset.warrantyExpires}
                    </div>
                    <div className="mt-1">
                      {warranty.isExpired ? (
                        <span className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                          Warranty Expired ({Math.abs(warranty.days)} days ago)
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Active ({warranty.days} days remaining)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {asset.notes && (
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Technician Notes &amp; Deployment Profile
                  </span>
                  <p className="text-xs text-slate-300">{asset.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span>Technical Specifications</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Processor / SoC</span>
                  <span className="font-semibold text-slate-200">{asset.processor || 'N/A'}</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Memory (RAM)</span>
                  <span className="font-semibold text-slate-200">{asset.ram || 'N/A'}</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Primary Storage</span>
                  <span className="font-semibold text-slate-200">{asset.storage || 'N/A'}</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Operating System</span>
                  <span className="font-semibold text-slate-200">{asset.operatingSystem || 'N/A'}</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">MAC Address</span>
                  <span className="font-mono text-slate-200">{asset.macAddress || 'N/A'}</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Network Static/DHCP IP</span>
                  <span className="font-mono text-slate-200">{asset.ipAddress || 'DHCP'}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'custody' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 text-xs">
                  Custody Transfer &amp; Signed Handover History
                </span>
                <span className="text-[11px] text-slate-400">
                  {asset.custodyHistory.length} signed transfers
                </span>
              </div>

              {asset.custodyHistory.length > 0 ? (
                <div className="space-y-2">
                  {asset.custodyHistory.map((rec) => (
                    <div
                      key={rec.id}
                      className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-slate-100 text-xs">
                            {rec.assignedTo} ({rec.department})
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {rec.employeeEmail}
                          </div>
                        </div>
                        <span className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                          {rec.assignedDate}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>Condition at handover:</span>
                        <span className="font-semibold text-blue-400">{rec.conditionAtHandover}</span>
                      </div>

                      {rec.signatureDataUrl && (
                        <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <PenTool className="w-3 h-3 text-blue-400" />
                            <span>Digital Signature Captured</span>
                          </span>
                          <img
                            src={rec.signatureDataUrl}
                            alt="Employee Signature"
                            className="h-7 object-contain bg-slate-950 px-2 rounded border border-slate-800"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 bg-slate-950 rounded-2xl border border-slate-800">
                  No previous custody transfers recorded.
                </div>
              )}
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 text-xs">
                  Maintenance Tickets &amp; Repairs
                </span>
                <button
                  onClick={() => setShowMntForm(!showMntForm)}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold transition-colors flex items-center gap-1"
                >
                  <Wrench className="w-3 h-3" />
                  <span>{showMntForm ? 'Cancel' : 'Log Repair / RMA'}</span>
                </button>
              </div>

              {/* Repair Form */}
              {showMntForm && (
                <form
                  onSubmit={handleCreateMaintenance}
                  className="bg-slate-950 p-3.5 rounded-2xl border border-blue-500/30 space-y-3"
                >
                  <span className="text-xs font-bold text-slate-100 block">
                    Record New Hardware Service Incident
                  </span>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Issue Description *</label>
                    <input
                      type="text"
                      placeholder="e.g. Swollen battery replaced under warranty"
                      value={mntIssue}
                      onChange={(e) => setMntIssue(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Repair Cost ($)</label>
                      <input
                        type="number"
                        value={mntCost}
                        onChange={(e) => setMntCost(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Servicing Tech</label>
                      <input
                        type="text"
                        value={mntTech}
                        onChange={(e) => setMntTech(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors"
                  >
                    Save Maintenance Record
                  </button>
                </form>
              )}

              {/* Maintenance History List */}
              {asset.maintenanceHistory.length > 0 ? (
                <div className="space-y-2">
                  {asset.maintenanceHistory.map((m) => (
                    <div
                      key={m.id}
                      className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-semibold text-slate-200 text-xs">
                          {m.issue}
                        </span>
                        <span className="font-mono text-emerald-400 font-bold text-xs">
                          {formatCurrency(m.cost)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Tech: {m.technician}</span>
                        <span>{m.date}</span>
                      </div>
                      {m.notes && <p className="text-[11px] text-slate-400 italic">{m.notes}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 bg-slate-950 rounded-2xl border border-slate-800">
                  No repair or maintenance history logged for this device.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Quick Action Bar */}
        {/* Footer Quick Action Bar */}
        <div className="p-4 bg-[#171b26]/90 border-t border-white/[0.08] flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete asset ${asset.tag}?`)) {
                onDelete(asset.id);
                onClose();
              }
            }}
            className="w-10 h-10 rounded-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center justify-center transition-colors"
            title={t('delete')}
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            {asset.status === 'available' ? (
              <button
                onClick={() => {
                  onCheckOut(asset);
                }}
                className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/25 active:scale-95 transition-all"
              >
                <User className="w-3.5 h-3.5" />
                <span>{t('checkout')}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onCheckIn(asset);
                  onClose();
                }}
                className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{t('returnToStock')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
