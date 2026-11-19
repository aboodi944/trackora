import React, { useState } from 'react';
import { KeyRound, Shield, Plus, DollarSign, Calendar, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SoftwareLicense } from '../types/asset';
import { formatCurrency } from '../utils/assetCalculations';

interface LicensesViewProps {
  licenses: SoftwareLicense[];
  onAddLicense: (license: SoftwareLicense) => void;
}

export const LicensesView: React.FC<LicensesViewProps> = ({
  licenses,
  onAddLicense,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [vendor, setVendor] = useState('');
  const [category, setCategory] = useState<'Productivity' | 'Security' | 'DevOps' | 'Design' | 'Infrastructure'>('Security');
  const [totalSeats, setTotalSeats] = useState('100');
  const [usedSeats, setUsedSeats] = useState('85');
  const [annualCost, setAnnualCost] = useState('12000');
  const [renewalDate, setRenewalDate] = useState('2027-06-30');
  const [licenseKey, setLicenseKey] = useState('');

  const totalAnnualSpend = licenses.reduce((sum, l) => sum + l.annualCost, 0);
  const totalAllocatedSeats = licenses.reduce((sum, l) => sum + l.usedSeats, 0);
  const totalPurchasedSeats = licenses.reduce((sum, l) => sum + l.totalSeats, 0);
  const unusedSeats = totalPurchasedSeats - totalAllocatedSeats;

  const handleCreateLicense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !vendor.trim()) return;

    onAddLicense({
      id: `lic-${Date.now()}`,
      name: name.trim(),
      vendor: vendor.trim(),
      category,
      totalSeats: parseInt(totalSeats, 10) || 50,
      usedSeats: parseInt(usedSeats, 10) || 40,
      annualCost: parseFloat(annualCost) || 5000,
      renewalDate,
      licenseKey: licenseKey.trim() || `LIC-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      assignedUsers: ['Engineering', 'IT', 'Operations'],
    });

    setName('');
    setVendor('');
    setLicenseKey('');
    setShowAddForm(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 text-xs font-sans pb-24 md:pb-6">
      {/* Top Spend Summary (Material 3 Surface Container) */}
      <div className="bg-[#171a22] p-4 sm:p-5 rounded-[28px] border border-white/[0.08] space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] text-purple-300 font-medium block">
              Annual Enterprise Software Spend
            </span>
            <div className="text-2xl font-extrabold text-slate-100 font-mono tracking-tight mt-0.5">
              {formatCurrency(totalAnnualSpend)}/yr
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-purple-500/25 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Contract</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
          <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/60 text-center">
            <span className="text-[10px] text-slate-400 block">Total Purchased</span>
            <span className="text-sm font-bold text-slate-200 font-mono">
              {totalPurchasedSeats} seats
            </span>
          </div>
          <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/60 text-center">
            <span className="text-[10px] text-slate-400 block">Assigned Active</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">
              {totalAllocatedSeats} seats
            </span>
          </div>
          <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/60 text-center">
            <span className="text-[10px] text-slate-400 block">Unassigned Slack</span>
            <span className="text-sm font-bold text-amber-400 font-mono">
              {unusedSeats} seats
            </span>
          </div>
        </div>
      </div>

      {/* Add License Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateLicense}
          className="bg-slate-900 p-4 rounded-2xl border border-purple-500/40 space-y-3"
        >
          <span className="font-bold text-slate-100 text-xs block">
            Register New Enterprise Software Contract
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Software Title *</label>
              <input
                type="text"
                placeholder="e.g. 1Password Business"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Vendor *</label>
              <input
                type="text"
                placeholder="e.g. AgileBits"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Total Seats</label>
              <input
                type="number"
                value={totalSeats}
                onChange={(e) => setTotalSeats(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Used Seats</label>
              <input
                type="number"
                value={usedSeats}
                onChange={(e) => setUsedSeats(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Annual Cost ($)</label>
              <input
                type="number"
                value={annualCost}
                onChange={(e) => setAnnualCost(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl transition-colors"
          >
            Save Software Contract
          </button>
        </form>
      )}

      {/* Licenses List */}
      <div className="space-y-3">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block px-1">
          Active Software Compliance Contracts ({licenses.length})
        </span>

        {licenses.map((lic) => {
          const percentUsed = Math.round((lic.usedSeats / lic.totalSeats) * 100);
          const isOverCapacity = percentUsed >= 95;
          return (
            <div
              key={lic.id}
              className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-xs">
                      {lic.name}
                    </h3>
                    <div className="text-[11px] text-slate-400">
                      Vendor: {lic.vendor} · {lic.category}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-xs text-slate-200">
                    {formatCurrency(lic.annualCost)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">/year</span>
                </div>
              </div>

              {/* Seat Capacity Bar */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">
                    {lic.usedSeats} of {lic.totalSeats} seats allocated
                  </span>
                  <span className={`font-mono font-bold ${isOverCapacity ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {percentUsed}% capacity
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isOverCapacity
                        ? 'bg-rose-500'
                        : percentUsed > 80
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, percentUsed)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                <span className="font-mono text-[10px] truncate max-w-[180px]">
                  Key: {lic.licenseKey}
                </span>
                <span className="flex items-center gap-1 text-[10px]">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>Renews: {lic.renewalDate}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
