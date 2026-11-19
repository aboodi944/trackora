import React, { useState } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis 
} from 'recharts';
import { ITAsset, AssetStatus } from '../types/asset';
import { PieChart as PieIcon, BarChart3, ShieldCheck, Activity } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface DashboardWidgetProps {
  assets: ITAsset[];
}

interface StatusItem {
  name: string;
  statusKey: AssetStatus;
  value: number;
  color: string;
  percentage: number;
}

const STATUS_KEYS: Record<AssetStatus, { translationKey: string; color: string }> = {
  in_use: { translationKey: 'statusInUse', color: '#10b981' },
  available: { translationKey: 'statusAvailable', color: '#3b82f6' },
  maintenance: { translationKey: 'statusMaintenance', color: '#f59e0b' },
  reserved: { translationKey: 'statusReserved', color: '#a855f7' },
  missing: { translationKey: 'statusMissing', color: '#f43f5e' },
  retired: { translationKey: 'statusRetired', color: '#64748b' },
};

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({ assets }) => {
  const { t, isRtl } = useLanguage();
  const [chartType, setChartType] = useState<'donut' | 'bar'>('donut');

  const total = assets.length;

  // Aggregate status distribution
  const statusCounts = assets.reduce<Record<AssetStatus, number>>((acc, asset) => {
    acc[asset.status] = (acc[asset.status] || 0) + 1;
    return acc;
  }, {
    in_use: 0,
    available: 0,
    maintenance: 0,
    reserved: 0,
    missing: 0,
    retired: 0,
  });

  const chartData: StatusItem[] = (Object.keys(STATUS_KEYS) as AssetStatus[])
    .map((statusKey) => {
      const count = statusCounts[statusKey] || 0;
      return {
        name: t(STATUS_KEYS[statusKey].translationKey),
        statusKey,
        value: count,
        color: STATUS_KEYS[statusKey].color,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      };
    })
    .filter((item) => item.value > 0);

  const inUseCount = statusCounts.in_use || 0;
  const utilizationRate = total > 0 ? Math.round((inUseCount / total) * 100) : 0;

  // Custom Recharts Dark Tooltip
  interface CustomTooltipProps {
    active?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any[];
  }

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as StatusItem;
      return (
        <div className="bg-[#141720] border border-white/15 p-2.5 rounded-2xl shadow-2xl backdrop-blur-xl text-xs select-none">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: data.color }}
            />
            <span className="font-semibold text-slate-100">{data.name}</span>
          </div>
          <div className="text-slate-300 font-mono text-[11px] flex items-center justify-between gap-4">
            <span>{data.value}</span>
            <span>{data.percentage}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#171a22] border border-white/[0.08] rounded-[28px] p-4 sm:p-5 space-y-3.5 shadow-xl relative overflow-hidden">
      {/* Header with Title and Mode Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-xs sm:text-sm tracking-tight">
              {t('widgetTitle')}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {t('widgetSubtitle')}
            </p>
          </div>
        </div>

        {/* Material 3 Segmented Button */}
        <div className="flex items-center bg-[#101217] p-1 rounded-full border border-white/[0.08]">
          <button
            onClick={() => setChartType('donut')}
            className={`p-1.5 rounded-full transition-all ${
              chartType === 'donut' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            title={t('donutView')}
            aria-label={t('donutView')}
          >
            <PieIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`p-1.5 rounded-full transition-all ${
              chartType === 'bar' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            title={t('barView')}
            aria-label={t('barView')}
          >
            <BarChart3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Chart Graphic Area */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Recharts Canvas */}
        <div className="sm:col-span-7 h-48 relative flex items-center justify-center">
          {chartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'donut' ? (
                  <PieChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={76}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {chartData.map((entry) => (
                        <Cell key={entry.statusKey} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                ) : (
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 8, right: 10, left: isRtl ? 10 : -20, bottom: 0 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      width={70}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                      {chartData.map((entry) => (
                        <Cell key={entry.statusKey} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>

              {/* Donut Center Key Metric (only in donut mode) */}
              {chartType === 'donut' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                  <span className="text-xl font-extrabold text-slate-100 font-mono tracking-tight leading-none">
                    {utilizationRate}%
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">
                    {t('deployed')}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-slate-500 text-xs">
              No hardware assets recorded yet.
            </div>
          )}
        </div>

        {/* Legend & Breakdown List */}
        <div className="sm:col-span-5 space-y-1.5">
          {chartData.map((item) => (
            <div
              key={item.statusKey}
              className="flex items-center justify-between p-2 rounded-2xl bg-[#101217]/90 border border-white/[0.05] text-[11px]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-300 font-medium truncate">
                  {item.name}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0 font-mono">
                <span className="text-slate-100 font-bold">{item.value}</span>
                <span className="text-slate-500 text-[10px]">
                  ({item.percentage}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Summary Subtext */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/[0.06]">
        <span className="flex items-center gap-1.5 text-slate-300 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>{t('fleetHealthNominal')}</span>
        </span>
        <span className="font-mono text-slate-400">
          {inUseCount} / {total} {t('inActiveCustody')}
        </span>
      </div>
    </div>
  );
};
