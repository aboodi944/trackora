/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ITAsset, SoftwareLicense, PricingTier, MaintenanceLog, Department } from './types/asset';
import { INITIAL_ASSETS, INITIAL_LICENSES } from './data/mockAssets';
import { AndroidFrame } from './components/AndroidFrame';
import { TopBar } from './components/TopBar';
import { BottomNav, TabType } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { AssetsListView } from './components/AssetsListView';
import { LicensesView } from './components/LicensesView';
import { ScannerModal } from './components/ScannerModal';
import { SignatureModal } from './components/SignatureModal';
import { AssetDetailModal } from './components/AssetDetailModal';
import { AssetFormModal } from './components/AssetFormModal';
import { PrintLabelModal } from './components/PrintLabelModal';
import { AuditModeModal } from './components/AuditModeModal';
import { MonetizationModal } from './components/MonetizationModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { PlayStorePublishModal } from './components/PlayStorePublishModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { playBeep } from './utils/audio';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';

const STORAGE_KEY_ASSETS = 'assetpulse_fleet_v1';
const STORAGE_KEY_LICENSES = 'assetpulse_licenses_v1';
const STORAGE_KEY_TIER = 'assetpulse_tier_v1';

function MainAppContent() {
  const { t } = useLanguage();

  // State with LocalStorage hydration
  const [assets, setAssets] = useState<ITAsset[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ASSETS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_ASSETS;
  });

  const [licenses, setLicenses] = useState<SoftwareLicense[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LICENSES);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_LICENSES;
  });

  const [activeTier, setActiveTier] = useState<PricingTier>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TIER);
      if (saved) return saved as PricingTier;
    } catch {
      // Fallback
    }
    return 'pro';
  });

  // Current active navigation tab
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');

  // Modals state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSignatureOpen, setIsSignatureOpen] = useState(false);
  const [targetAssetForHandover, setTargetAssetForHandover] = useState<ITAsset | null>(null);

  const [selectedAsset, setSelectedAsset] = useState<ITAsset | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<ITAsset | null>(null);
  const [prefillTag, setPrefillTag] = useState<string | null>(null);

  const [printAsset, setPrintAsset] = useState<ITAsset | null>(null);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isMonetizationOpen, setIsMonetizationOpen] = useState(false);
  const [isDriveOpen, setIsDriveOpen] = useState(false);
  const [isPlayStoreOpen, setIsPlayStoreOpen] = useState(false);

  const handleRestoreFleet = (restoredAssets: ITAsset[], restoredLicenses: SoftwareLicense[]) => {
    playBeep('success');
    setAssets(restoredAssets);
    setLicenses(restoredLicenses);
  };

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(assets));
    } catch (e) {
      console.warn('Could not save assets to localStorage', e);
    }
  }, [assets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LICENSES, JSON.stringify(licenses));
    } catch (e) {
      console.warn('Could not save licenses to localStorage', e);
    }
  }, [licenses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TIER, activeTier);
    } catch (e) {
      console.warn('Could not save tier to localStorage', e);
    }
  }, [activeTier]);

  // Handlers
  const handleSelectAsset = (asset: ITAsset) => {
    setSelectedAsset(asset);
    setIsDetailOpen(true);
  };

  const handleOpenAddModal = (tag?: string) => {
    setEditingAsset(null);
    setPrefillTag(tag || null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (asset: ITAsset) => {
    setEditingAsset(asset);
    setPrefillTag(null);
    setIsFormOpen(true);
  };

  const handleSaveAsset = (formData: Partial<ITAsset>) => {
    playBeep('success');
    if (editingAsset) {
      // Update existing
      setAssets((prev) =>
        prev.map((a) => (a.id === editingAsset.id ? { ...a, ...formData } as ITAsset : a))
      );
      if (selectedAsset && selectedAsset.id === editingAsset.id) {
        setSelectedAsset((prev) => (prev ? { ...prev, ...formData } as ITAsset : null));
      }
    } else {
      // Add new
      const newAsset: ITAsset = {
        id: `ast-${Date.now()}`,
        tag: formData.tag || `AST-${Math.floor(10000 + Math.random() * 90000)}`,
        serialNumber: formData.serialNumber || `SN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        model: formData.model || 'Unknown Hardware',
        manufacturer: formData.manufacturer || 'OEM',
        category: formData.category || 'laptop',
        status: formData.status || 'available',
        location: formData.location || 'HQ - Storage Cage B (Shelf 01)',
        purchaseDate: formData.purchaseDate || new Date().toISOString().split('T')[0],
        purchaseCost: formData.purchaseCost || 0,
        residualValue: formData.residualValue || 0,
        lifespanMonths: formData.lifespanMonths || 36,
        warrantyExpires: formData.warrantyExpires || formData.purchaseDate || '',
        processor: formData.processor,
        ram: formData.ram,
        storage: formData.storage,
        operatingSystem: formData.operatingSystem,
        notes: formData.notes,
        maintenanceHistory: [],
        custodyHistory: [],
      };
      setAssets((prev) => [newAsset, ...prev]);
    }
  };

  const handleDeleteAsset = (id: string) => {
    playBeep('warning');
    setAssets((prev) => prev.filter((a) => a.id !== id));
    setIsDetailOpen(false);
    setSelectedAsset(null);
  };

  const handleCheckInAsset = (asset: ITAsset) => {
    playBeep('success');
    const updated = {
      ...asset,
      status: 'available' as const,
      assignedUser: undefined,
      assignedEmail: undefined,
      location: 'HQ - Storage Cage B (Shelf 01)',
    };
    setAssets((prev) => prev.map((a) => (a.id === asset.id ? updated : a)));
    if (selectedAsset && selectedAsset.id === asset.id) {
      setSelectedAsset(updated);
    }
  };

  const handleStartCheckOut = (asset: ITAsset) => {
    setTargetAssetForHandover(asset);
    setIsSignatureOpen(true);
  };

  const handleConfirmHandover = (custodyData: {
    assignedTo: string;
    employeeEmail: string;
    department: Department;
    condition: 'Brand New' | 'Excellent' | 'Good' | 'Fair';
    signatureDataUrl: string;
    notes?: string;
  }) => {
    if (!targetAssetForHandover) return;

    const newRecord = {
      id: `cst-${Date.now()}`,
      assignedTo: custodyData.assignedTo,
      employeeEmail: custodyData.employeeEmail,
      department: custodyData.department,
      assignedDate: new Date().toISOString().split('T')[0],
      signatureDataUrl: custodyData.signatureDataUrl,
      conditionAtHandover: custodyData.condition,
      notes: custodyData.notes,
    };

    const updated: ITAsset = {
      ...targetAssetForHandover,
      status: 'in_use',
      assignedUser: custodyData.assignedTo,
      assignedEmail: custodyData.employeeEmail,
      department: custodyData.department,
      location: `${custodyData.department} Dept / Remote`,
      custodyHistory: [newRecord, ...targetAssetForHandover.custodyHistory],
    };

    setAssets((prev) =>
      prev.map((a) => (a.id === targetAssetForHandover.id ? updated : a))
    );

    if (selectedAsset && selectedAsset.id === targetAssetForHandover.id) {
      setSelectedAsset(updated);
    }
    setTargetAssetForHandover(null);
  };

  const handleAddMaintenance = (assetId: string, logData: Omit<MaintenanceLog, 'id'>) => {
    playBeep('success');
    const newLog: MaintenanceLog = {
      id: `mnt-${Date.now()}`,
      ...logData,
    };

    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === assetId) {
          const updated = {
            ...a,
            maintenanceHistory: [newLog, ...a.maintenanceHistory],
          };
          if (selectedAsset && selectedAsset.id === assetId) {
            setSelectedAsset(updated);
          }
          return updated;
        }
        return a;
      })
    );
  };

  const handleCompleteAudit = (verifiedTagIds: string[], location: string) => {
    const today = new Date().toISOString().split('T')[0];
    setAssets((prev) =>
      prev.map((a) => {
        if (verifiedTagIds.includes(a.tag)) {
          return {
            ...a,
            lastAuditedDate: today,
            location: location,
          };
        }
        return a;
      })
    );
  };

  const handleUpdateAssetLocation = (tag: string, newLocation: string) => {
    setAssets((prev) =>
      prev.map((a) => (a.tag === tag ? { ...a, location: newLocation } : a))
    );
  };

  const handleAddLicense = (lic: SoftwareLicense) => {
    playBeep('success');
    setLicenses((prev) => [lic, ...prev]);
  };

  const handleResetData = () => {
    if (confirm('Reset fleet database to initial enterprise sample records?')) {
      setAssets(INITIAL_ASSETS);
      setLicenses(INITIAL_LICENSES);
      setActiveTier('pro');
      localStorage.removeItem(STORAGE_KEY_ASSETS);
      localStorage.removeItem(STORAGE_KEY_LICENSES);
      localStorage.removeItem(STORAGE_KEY_TIER);
      playBeep('success');
    }
  };

  const handleExportData = () => {
    playBeep('success');
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
      JSON.stringify({ assets, licenses, exportedAt: new Date().toISOString() }, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `trackora_fleet_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleOpenPrint = (asset: ITAsset) => {
    setPrintAsset(asset);
    setIsPrintOpen(true);
  };

  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard': return t('tabOverview');
      case 'assets': return t('tabHardware');
      case 'audit': return t('tabAudit');
      case 'licenses': return t('tabLicenses');
      case 'pricing': return t('tabPlans');
    }
  };

  return (
    <AndroidFrame
      activeTier={activeTier}
      onOpenMonetization={() => setIsMonetizationOpen(true)}
      onResetData={handleResetData}
      onExportData={handleExportData}
      onOpenPlayStore={() => setIsPlayStoreOpen(true)}
    >
      {/* Top Android Material 3 App Bar */}
      <TopBar
        title={getTabTitle()}
        subtitle={t('appSubtitle')}
        onOpenAddModal={() => handleOpenAddModal()}
        alertCount={1}
        onAlertClick={() => setCurrentTab('dashboard')}
        onOpenDriveModal={() => setIsDriveOpen(true)}
        onOpenPlayStoreModal={() => setIsPlayStoreOpen(true)}
      />

      {/* Main View Router */}
      {currentTab === 'dashboard' && (
        <DashboardView
          assets={assets}
          licenses={licenses}
          activeTier={activeTier}
          onOpenScanner={() => setIsScannerOpen(true)}
          onOpenAudit={() => setIsAuditOpen(true)}
          onOpenAddModal={() => handleOpenAddModal()}
          onSelectAsset={handleSelectAsset}
          onOpenLicenses={() => setCurrentTab('licenses')}
          onOpenMonetization={() => setIsMonetizationOpen(true)}
          onOpenDrive={() => setIsDriveOpen(true)}
          onOpenPlayStore={() => setIsPlayStoreOpen(true)}
        />
      )}

      {currentTab === 'assets' && (
        <AssetsListView
          assets={assets}
          onSelectAsset={handleSelectAsset}
          onOpenAddModal={() => handleOpenAddModal()}
          onOpenScanner={() => setIsScannerOpen(true)}
        />
      )}

      {currentTab === 'audit' && (
        <div className="flex-1 flex flex-col p-4 pb-20 md:pb-6 overflow-y-auto">
          <div className="bg-[#171a22] border border-white/[0.08] rounded-[32px] p-6 text-center space-y-4 my-auto shadow-xl">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {t('auditTitle')}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                {t('auditSubtitle')}
              </p>
            </div>
            <button
              onClick={() => setIsAuditOpen(true)}
              className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
            >
              {t('launchAudit')}
            </button>
          </div>
        </div>
      )}

      {currentTab === 'licenses' && (
        <LicensesView
          licenses={licenses}
          onAddLicense={handleAddLicense}
        />
      )}

      {currentTab === 'pricing' && (
        <div className="flex-1 flex flex-col p-4 pb-20 md:pb-6 overflow-y-auto">
          <div className="bg-[#171a22] border border-white/[0.08] rounded-[32px] p-6 text-center space-y-4 my-auto shadow-xl">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-md">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {t('tabPlans')}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                {t('saasRoiPitchTool')}
              </p>
            </div>
            <button
              onClick={() => setIsMonetizationOpen(true)}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-xs shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
            >
              {t('tabPlans')}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Material 3 Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          playBeep('success');
          setCurrentTab(tab);
        }}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      {/* Modals */}
      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        assets={assets}
        onSelectAsset={handleSelectAsset}
        onQuickCheckIn={handleCheckInAsset}
        onQuickCheckOut={handleStartCheckOut}
        onAddNewWithTag={(tag) => handleOpenAddModal(tag)}
      />

      <SignatureModal
        isOpen={isSignatureOpen}
        onClose={() => {
          setIsSignatureOpen(false);
          setTargetAssetForHandover(null);
        }}
        asset={targetAssetForHandover}
        onConfirmHandover={handleConfirmHandover}
      />

      <AssetDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedAsset(null);
        }}
        asset={selectedAsset}
        onCheckOut={handleStartCheckOut}
        onCheckIn={handleCheckInAsset}
        onPrintLabel={handleOpenPrint}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteAsset}
        onAddMaintenance={handleAddMaintenance}
      />

      <AssetFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingAsset(null);
          setPrefillTag(null);
        }}
        onSave={handleSaveAsset}
        initialAsset={editingAsset}
        initialTag={prefillTag}
      />

      <PrintLabelModal
        isOpen={isPrintOpen}
        onClose={() => {
          setIsPrintOpen(false);
          setPrintAsset(null);
        }}
        asset={printAsset}
      />

      <AuditModeModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        assets={assets}
        onCompleteAudit={handleCompleteAudit}
        onUpdateAssetLocation={handleUpdateAssetLocation}
      />

      <MonetizationModal
        isOpen={isMonetizationOpen}
        onClose={() => setIsMonetizationOpen(false)}
        currentTier={activeTier}
        onSelectTier={(tier) => setActiveTier(tier)}
        totalAssetsCount={assets.length}
      />

      <GoogleDriveModal
        isOpen={isDriveOpen}
        onClose={() => setIsDriveOpen(false)}
        assets={assets}
        licenses={licenses}
        onRestoreFleet={handleRestoreFleet}
      />

      <PlayStorePublishModal
        isOpen={isPlayStoreOpen}
        onClose={() => setIsPlayStoreOpen(false)}
      />

      <OfflineIndicator />
    </AndroidFrame>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainAppContent />
    </LanguageProvider>
  );
}
