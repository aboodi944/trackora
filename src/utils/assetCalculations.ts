import { ITAsset, AssetStatus, AssetCategory } from '../types/asset';

/**
 * Straight-line depreciation calculation based on GAAP/IFRS standards
 */
export function calculateDepreciation(asset: ITAsset) {
  const purchase = new Date(asset.purchaseDate);
  const now = new Date();
  
  // Calculate elapsed months
  const monthsDiff = (now.getFullYear() - purchase.getFullYear()) * 12 + (now.getMonth() - purchase.getMonth());
  const elapsedMonths = Math.max(0, monthsDiff);
  
  const depreciableBase = Math.max(0, asset.purchaseCost - asset.residualValue);
  const monthlyDepreciation = asset.lifespanMonths > 0 ? depreciableBase / asset.lifespanMonths : 0;
  
  const accumulatedDepreciation = Math.min(depreciableBase, monthlyDepreciation * elapsedMonths);
  const currentBookValue = Math.max(asset.residualValue, asset.purchaseCost - accumulatedDepreciation);
  
  const percentDepreciated = depreciableBase > 0 ? Math.min(100, Math.round((accumulatedDepreciation / depreciableBase) * 100)) : 100;
  
  return {
    elapsedMonths,
    monthlyDepreciation: Math.round(monthlyDepreciation),
    accumulatedDepreciation: Math.round(accumulatedDepreciation),
    currentBookValue: Math.round(currentBookValue),
    percentDepreciated,
    isFullyDepreciated: elapsedMonths >= asset.lifespanMonths,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getStatusDetails(status: AssetStatus) {
  switch (status) {
    case 'in_use':
      return {
        label: 'In Use',
        bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        text: 'text-emerald-400',
        dot: 'bg-emerald-500',
      };
    case 'available':
      return {
        label: 'Available (Stock)',
        bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        text: 'text-blue-400',
        dot: 'bg-blue-500',
      };
    case 'maintenance':
      return {
        label: 'Under Repair',
        bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        text: 'text-amber-400',
        dot: 'bg-amber-500',
      };
    case 'reserved':
      return {
        label: 'Reserved (Staging)',
        bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        text: 'text-purple-400',
        dot: 'bg-purple-500',
      };
    case 'missing':
      return {
        label: 'Missing / Lost',
        bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        text: 'text-rose-400',
        dot: 'bg-rose-500',
      };
    case 'retired':
      return {
        label: 'Disposed / Retired',
        bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        text: 'text-slate-400',
        dot: 'bg-slate-500',
      };
  }
}

export function getCategoryLabel(cat: AssetCategory): string {
  switch (cat) {
    case 'laptop': return 'Laptop';
    case 'desktop': return 'Workstation';
    case 'server': return 'Server';
    case 'network': return 'Networking';
    case 'monitor': return 'Display';
    case 'mobile': return 'Mobile Device';
    case 'peripheral': return 'Peripheral';
  }
}

export function getDaysUntilWarranty(warrantyDate: string): { days: number; isExpired: boolean; isNear: boolean } {
  const target = new Date(warrantyDate);
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return {
    days,
    isExpired: days < 0,
    isNear: days >= 0 && days <= 60,
  };
}
