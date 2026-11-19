import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Tag, DollarSign, Cpu } from 'lucide-react';
import { ITAsset, AssetCategory, AssetStatus, Department } from '../types/asset';
import { useLanguage } from '../i18n/LanguageContext';

interface AssetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assetData: Partial<ITAsset>) => void;
  initialAsset?: ITAsset | null;
  initialTag?: string | null;
}

export const AssetFormModal: React.FC<AssetFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialAsset,
  initialTag,
}) => {
  const { t, isRtl } = useLanguage();
  const [tag, setTag] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [model, setModel] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [category, setCategory] = useState<AssetCategory>('laptop');
  const [status, setStatus] = useState<AssetStatus>('available');
  const [location, setLocation] = useState('HQ - Storage Cage B (Shelf 01)');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [purchaseCost, setPurchaseCost] = useState('2400');
  const [residualValue, setResidualValue] = useState('400');
  const [lifespanMonths, setLifespanMonths] = useState('36');
  const [warrantyExpires, setWarrantyExpires] = useState('');
  const [processor, setProcessor] = useState('');
  const [ram, setRam] = useState('');
  const [storage, setStorage] = useState('');
  const [operatingSystem, setOperatingSystem] = useState('');
  const [assignedUser, setAssignedUser] = useState('');
  const [department, setDepartment] = useState<Department | ''>('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (initialAsset) {
      setTag(initialAsset.tag);
      setSerialNumber(initialAsset.serialNumber);
      setModel(initialAsset.model);
      setManufacturer(initialAsset.manufacturer);
      setCategory(initialAsset.category);
      setStatus(initialAsset.status);
      setLocation(initialAsset.location);
      setPurchaseDate(initialAsset.purchaseDate);
      setPurchaseCost(initialAsset.purchaseCost.toString());
      setResidualValue(initialAsset.residualValue.toString());
      setLifespanMonths(initialAsset.lifespanMonths.toString());
      setWarrantyExpires(initialAsset.warrantyExpires);
      setProcessor(initialAsset.processor || '');
      setRam(initialAsset.ram || '');
      setStorage(initialAsset.storage || '');
      setOperatingSystem(initialAsset.operatingSystem || '');
      setAssignedUser(initialAsset.assignedUser || '');
      setDepartment(initialAsset.department || '');
      setNotes(initialAsset.notes || '');
    } else {
      // Auto-generate fresh tag if not provided
      const randomTag = initialTag || `AST-${Math.floor(10000 + Math.random() * 90000)}`;
      setTag(randomTag);
      setSerialNumber(`SN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
      setModel('');
      setManufacturer('Apple');
      setCategory('laptop');
      setStatus('available');
      setLocation('HQ - Storage Cage B (Shelf 01)');
      const today = new Date().toISOString().split('T')[0];
      setPurchaseDate(today);
      setPurchaseCost('2400');
      setResidualValue('400');
      setLifespanMonths('36');
      // Set warranty 3 years from today
      const wDate = new Date();
      wDate.setFullYear(wDate.getFullYear() + 3);
      setWarrantyExpires(wDate.toISOString().split('T')[0]);
      setProcessor('');
      setRam('16 GB');
      setStorage('512 GB SSD');
      setOperatingSystem('');
      setAssignedUser('');
      setDepartment('');
      setNotes('');
    }
  }, [isOpen, initialAsset, initialTag]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tag.trim() || !model.trim() || !manufacturer.trim()) {
      alert('Please fill in required fields: Tag, Model, and Manufacturer.');
      return;
    }

    onSave({
      tag: tag.trim().toUpperCase(),
      serialNumber: serialNumber.trim().toUpperCase(),
      model: model.trim(),
      manufacturer: manufacturer.trim(),
      category,
      status,
      location: location.trim(),
      purchaseDate,
      purchaseCost: parseFloat(purchaseCost) || 0,
      residualValue: parseFloat(residualValue) || 0,
      lifespanMonths: parseInt(lifespanMonths, 10) || 36,
      warrantyExpires: warrantyExpires || purchaseDate,
      processor: processor.trim(),
      ram: ram.trim(),
      storage: storage.trim(),
      operatingSystem: operatingSystem.trim(),
      assignedUser: assignedUser.trim() || undefined,
      department: department ? (department as Department) : undefined,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl">
      <div className="w-full max-w-xl bg-[#141720] rounded-[32px] border border-white/10 flex flex-col max-h-[92vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="h-16 px-5 bg-[#171b26]/90 border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">
                {initialAsset ? 'Edit Hardware Profile' : t('addAsset')}
              </h3>
              <p className="text-[11px] text-slate-400">
                Asset Tagging &amp; Financial Ledger Onboarding
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

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Tag & Serial Number */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Asset Barcode Tag *
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-blue-400 font-mono uppercase focus:outline-none focus:border-blue-500 font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Manufacturer Serial No. *
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono uppercase focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Model & Manufacturer */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Manufacturer *
              </label>
              <input
                type="text"
                placeholder="e.g. Apple, Dell, Lenovo, Cisco"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Model Name *
              </label>
              <input
                type="text"
                placeholder="e.g. MacBook Pro 16 M3"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Category, Status, Location */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AssetCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="laptop">Laptop</option>
                <option value="desktop">Workstation</option>
                <option value="server">Server</option>
                <option value="network">Network Switch</option>
                <option value="monitor">Display / Monitor</option>
                <option value="mobile">Mobile / Tablet</option>
                <option value="peripheral">Peripheral</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AssetStatus)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="available">Available in Stock</option>
                <option value="in_use">In Use / Assigned</option>
                <option value="maintenance">Under Repair</option>
                <option value="reserved">Reserved Staging</option>
                <option value="retired">Disposed / Retired</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 truncate"
              />
            </div>
          </div>

          {/* Financials & Depreciation */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-3">
            <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Capital Expenditure &amp; Depreciation Rules</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Purchase Price ($)</label>
                <input
                  type="number"
                  value={purchaseCost}
                  onChange={(e) => setPurchaseCost(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Salvage Value ($)</label>
                <input
                  type="number"
                  value={residualValue}
                  onChange={(e) => setResidualValue(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Lifespan (Months)</label>
                <select
                  value={lifespanMonths}
                  onChange={(e) => setLifespanMonths(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 font-mono"
                >
                  <option value="24">24 Mos (2 Years)</option>
                  <option value="36">36 Mos (3 Years - Laptop)</option>
                  <option value="48">48 Mos (4 Years)</option>
                  <option value="60">60 Mos (5 Years - Server)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Warranty Expires</label>
                <input
                  type="date"
                  value={warrantyExpires}
                  onChange={(e) => setWarrantyExpires(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-slate-100 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Hardware Specs */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-3">
            <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span>Hardware Specs (Optional)</span>
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">CPU / Chip</label>
                <input
                  type="text"
                  placeholder="e.g. M3 Max or Intel i7"
                  value={processor}
                  onChange={(e) => setProcessor(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">RAM</label>
                <input
                  type="text"
                  placeholder="e.g. 32 GB"
                  value={ram}
                  onChange={(e) => setRam(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Storage</label>
                <input
                  type="text"
                  placeholder="e.g. 1 TB SSD"
                  value={storage}
                  onChange={(e) => setStorage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">OS</label>
                <input
                  type="text"
                  placeholder="e.g. macOS Sonoma / Windows 11"
                  value={operatingSystem}
                  onChange={(e) => setOperatingSystem(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-100"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Deployment &amp; Security Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Enrolled in Jamf Pro MDM, FileVault encryption key backed up..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{initialAsset ? 'Update Asset Record' : 'Register Hardware in Fleet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
