import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Laptop, Server, Wifi, Monitor, 
  Smartphone, Plus, ChevronRight, Check, X, QrCode
} from 'lucide-react';
import { ITAsset, AssetCategory, AssetStatus } from '../types/asset';
import { calculateDepreciation, formatCurrency, getStatusDetails } from '../utils/assetCalculations';
import { useLanguage } from '../i18n/LanguageContext';

interface AssetsListViewProps {
  assets: ITAsset[];
  onSelectAsset: (asset: ITAsset) => void;
  onOpenAddModal: () => void;
  onOpenScanner: () => void;
}

export const AssetsListView: React.FC<AssetsListViewProps> = ({
  assets,
  onSelectAsset,
  onOpenAddModal,
  onOpenScanner,
}) => {
  const { t, isRtl } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const categories: { key: string; label: string }[] = [
    { key: 'all', label: t('catAll') },
    { key: 'laptop', label: t('catLaptops') },
    { key: 'server', label: t('catServers') },
    { key: 'network', label: t('catNetwork') },
    { key: 'monitor', label: t('catMonitors') },
    { key: 'mobile', label: t('catMobile') },
  ];

  const statuses: { key: string; label: string }[] = [
    { key: 'all', label: t('catAll') },
    { key: 'in_use', label: t('statusInUse') },
    { key: 'available', label: t('statusAvailable') },
    { key: 'maintenance', label: t('statusMaintenance') },
    { key: 'reserved', label: t('statusReserved') },
  ];

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        asset.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (asset.assignedUser && asset.assignedUser.toLowerCase().includes(searchQuery.toLowerCase())) ||
        asset.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'all' || asset.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || asset.status === selectedStatus;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [assets, searchQuery, selectedCategory, selectedStatus]);

  const getCategoryIcon = (cat: AssetCategory) => {
    switch (cat) {
      case 'laptop': return <Laptop className="w-4 h-4 text-blue-400" />;
      case 'server': return <Server className="w-4 h-4 text-indigo-400" />;
      case 'network': return <Wifi className="w-4 h-4 text-cyan-400" />;
      case 'monitor': return <Monitor className="w-4 h-4 text-emerald-400" />;
      case 'mobile': return <Smartphone className="w-4 h-4 text-purple-400" />;
      default: return <Laptop className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 text-xs font-sans pb-24 md:pb-6">
      {/* Material 3 Search Bar with Pill Geometry */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-slate-400 ${
            isRtl ? 'right-3.5' : 'left-3.5'
          }`} />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-[#171a22] border border-white/[0.08] hover:border-white/20 focus:border-blue-500 rounded-full py-3 text-xs text-slate-100 placeholder-slate-400 focus:outline-none transition-all shadow-inner ${
              isRtl ? 'pr-10 pl-9' : 'pl-10 pr-9'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 ${
                isRtl ? 'left-3' : 'right-3'
              }`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* M3 Round Icon Action for Optical Barcode Scan */}
        <button
          onClick={onOpenScanner}
          className="w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/25 active:scale-95 transition-all shrink-0"
          title={t('scanBarcode')}
        >
          <QrCode className="w-5 h-5" />
        </button>
      </div>

      {/* Material 3 Filter Chips (Horizontal Scroll) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setSelectedCategory(c.key)}
            className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
              selectedCategory === c.key
                ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/40'
                : 'bg-[#171a22] text-slate-400 hover:text-slate-200 border border-white/[0.06]'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Status Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
        {statuses.map((s) => (
          <button
            key={s.key}
            onClick={() => setSelectedStatus(s.key)}
            className={`px-3 py-1 rounded-full font-medium whitespace-nowrap transition-colors ${
              selectedStatus === s.key
                ? 'bg-[#222734] text-slate-100 border border-blue-400/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Fleet Count & Fast Add */}
      <div className="flex items-center justify-between px-1 pt-1">
        <span className="text-[11px] text-slate-400 font-mono">
          {filteredAssets.length} / {assets.length} {t('activeAssets')}
        </span>

        <button
          onClick={onOpenAddModal}
          className="text-blue-400 hover:text-blue-300 font-semibold text-[11px] flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('addAsset')}</span>
        </button>
      </div>

      {/* Material 3 Interactive Hardware List Rows */}
      <div className="space-y-2">
        {filteredAssets.map((asset) => {
          const statusInfo = getStatusDetails(asset.status);
          const dep = calculateDepreciation(asset);
          return (
            <div
              key={asset.id}
              onClick={() => onSelectAsset(asset)}
              className="min-h-[66px] bg-[#171a22] hover:bg-[#1f232e] border border-white/[0.07] hover:border-white/15 p-3 sm:p-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 select-none active:scale-[0.99] shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-[#101217] border border-white/[0.08] flex items-center justify-center shrink-0">
                  {getCategoryIcon(asset.category)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-blue-400">
                      {asset.tag}
                    </span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold border ${statusInfo.bg}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <h3 className="text-slate-100 font-semibold truncate text-xs mt-1">
                    {asset.manufacturer} {asset.model}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 truncate mt-0.5">
                    <span className="truncate">
                      {asset.assignedUser ? `${asset.assignedUser}` : asset.location}
                    </span>
                    <span>·</span>
                    <span className="font-mono truncate">SN: {asset.serialNumber}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <div className="font-mono font-bold text-xs text-slate-100">
                    {formatCurrency(dep.currentBookValue)}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {t('bookValue')}
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 text-slate-500 ${isRtl ? 'rotate-180' : ''}`} />
              </div>
            </div>
          );
        })}

        {filteredAssets.length === 0 && (
          <div className="text-center py-12 bg-[#171a22]/50 rounded-[28px] border border-dashed border-white/10 p-6 space-y-2">
            <Laptop className="w-8 h-8 text-slate-500 mx-auto" />
            <div className="text-slate-200 font-semibold text-xs">
              {t('searchPlaceholder')}
            </div>
            <button
              onClick={onOpenAddModal}
              className="mt-2 px-5 py-2.5 bg-blue-600 text-white rounded-full text-xs font-semibold shadow-md shadow-blue-500/20"
            >
              {t('addAsset')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
