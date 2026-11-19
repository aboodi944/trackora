import React, { useState, useEffect } from 'react';
import { 
  X, Cloud, HardDrive, UploadCloud, DownloadCloud, Trash2, 
  ExternalLink, CheckCircle2, AlertTriangle, RefreshCw, LogOut, Check
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  initAuth, 
  googleSignIn, 
  logoutGoogle, 
  getAccessToken 
} from '../services/firebaseAuth';
import { 
  listTrackoraDriveFiles, 
  uploadFleetBackupToDrive, 
  downloadDriveBackupContent, 
  deleteDriveFile, 
  DriveBackupFile 
} from '../services/googleDrive';
import { ITAsset, SoftwareLicense } from '../types/asset';
import { useLanguage } from '../i18n/LanguageContext';
import { playBeep } from '../utils/audio';
import confetti from 'canvas-confetti';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: ITAsset[];
  licenses: SoftwareLicense[];
  onRestoreFleet: (restoredAssets: ITAsset[], restoredLicenses: SoftwareLicense[]) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  assets,
  licenses,
  onRestoreFleet,
}) => {
  const { t, isRtl } = useLanguage();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  const [driveFiles, setDriveFiles] = useState<DriveBackupFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Destructive delete confirmation dialog state (Mandatory per Google Workspace integration policy)
  const [fileToDelete, setFileToDelete] = useState<DriveBackupFile | null>(null);
  const [fileToRestore, setFileToRestore] = useState<DriveBackupFile | null>(null);

  // Initialize auth listener
  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = initAuth(
      (user, accessToken) => {
        setCurrentUser(user);
        setToken(accessToken);
        fetchDriveFiles(accessToken);
      },
      () => {
        setCurrentUser(null);
        setToken(null);
        setDriveFiles([]);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  const fetchDriveFiles = async (accessToken: string) => {
    setIsLoadingFiles(true);
    try {
      const files = await listTrackoraDriveFiles(accessToken);
      setDriveFiles(files);
    } catch (err: unknown) {
      console.warn('Error fetching Drive files:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoadingAuth(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setToken(res.accessToken);
        playBeep('success');
        fetchDriveFiles(res.accessToken);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google authentication failed';
      setStatusMessage({ type: 'error', text: msg });
      playBeep('error');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutGoogle();
      setCurrentUser(null);
      setToken(null);
      setDriveFiles([]);
      setStatusMessage({ type: 'success', text: 'Signed out of Google Workspace.' });
      playBeep('success');
    } catch (err) {
      console.error(err);
    }
  };

  const handleBackupNow = async () => {
    if (!token) return;
    setIsUploading(true);
    setStatusMessage(null);
    try {
      const payload = {
        app: 'Trackora',
        exportedAt: new Date().toISOString(),
        totalAssets: assets.length,
        totalLicenses: licenses.length,
        assets,
        licenses,
      };

      await uploadFleetBackupToDrive(token, payload);
      playBeep('success');
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
      });
      setStatusMessage({ type: 'success', text: 'Fleet successfully backed up to your Google Drive!' });
      await fetchDriveFiles(token);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setStatusMessage({ type: 'error', text: msg });
      playBeep('error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmRestore = async () => {
    if (!token || !fileToRestore) return;
    setStatusMessage(null);
    try {
      const content = await downloadDriveBackupContent(token, fileToRestore.id);
      if (content && Array.isArray(content.assets)) {
        onRestoreFleet(content.assets, content.licenses || []);
        playBeep('success');
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
        setStatusMessage({ type: 'success', text: `Restored ${content.assets.length} assets from Google Drive backup.` });
      } else {
        throw new Error('Invalid Trackora backup file structure.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Restore failed';
      setStatusMessage({ type: 'error', text: msg });
      playBeep('error');
    } finally {
      setFileToRestore(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!token || !fileToDelete) return;
    try {
      await deleteDriveFile(token, fileToDelete.id);
      playBeep('success');
      setStatusMessage({ type: 'success', text: 'Backup file permanently deleted from Google Drive.' });
      await fetchDriveFiles(token);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete file';
      setStatusMessage({ type: 'error', text: msg });
      playBeep('error');
    } finally {
      setFileToDelete(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl">
      <div className="w-full max-w-xl bg-[#141720] rounded-[32px] border border-white/10 flex flex-col max-h-[92vh] overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="h-16 px-5 bg-[#171b26]/90 border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-emerald-500/20 to-blue-500/20 border border-white/15 flex items-center justify-center text-white">
              <Cloud className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                <span>Google Drive Cloud Hub</span>
                <span className="text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2 py-0.2 rounded-full font-mono">v3 REST API</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Enterprise IT Cloud Backup &amp; Disaster Recovery
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

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-2xl border flex items-center justify-between gap-2 text-xs animate-in fade-in ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              }`}
            >
              <span>{statusMessage.text}</span>
              <button onClick={() => setStatusMessage(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Account Card: Sign-in or Profile */}
          {!currentUser ? (
            <div className="bg-[#1b202c] p-5 rounded-[28px] border border-white/[0.08] text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center mx-auto">
                <Cloud className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h4 className="font-bold text-slate-100 text-sm">
                  Connect Your Google Workspace Drive
                </h4>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1">
                  Authenticate with Google to safely store encrypted fleet backups, hardware handover certificates, and audit logs in your corporate Google Drive.
                </p>
              </div>

              {/* Official Google Sign-in Button */}
              <div className="pt-2 flex justify-center">
                <button
                  onClick={handleSignIn}
                  disabled={isLoadingAuth}
                  className="h-11 px-6 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs flex items-center gap-3 shadow-lg active:scale-95 transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{isLoadingAuth ? 'Connecting to Google...' : 'Sign in with Google Workspace'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#1b202c] p-4 rounded-[28px] border border-white/[0.08] flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3 min-w-0">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Google User'}
                    className="w-11 h-11 rounded-full border border-white/20 object-cover shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-blue-600/30 text-blue-300 font-bold flex items-center justify-center shrink-0 border border-blue-400/30">
                    {currentUser.displayName?.[0] || 'G'}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100 text-xs truncate">
                      {currentUser.displayName || 'Connected User'}
                    </span>
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.2 rounded-full font-semibold">
                      Connected
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                    {currentUser.email}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="p-2 rounded-full text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Backup Operations Card */}
          {currentUser && (
            <div className="bg-[#171a22] p-4 rounded-[28px] border border-white/[0.08] space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-100 text-xs">
                    Real-Time Cloud Inventory Sync
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {assets.length} hardware assets and {licenses.length} software contracts ready to sync.
                  </p>
                </div>
                <button
                  onClick={handleBackupNow}
                  disabled={isUploading}
                  className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/25 active:scale-95 transition-all shrink-0 disabled:opacity-50"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{isUploading ? 'Uploading...' : 'Backup Now to Drive'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Existing Google Drive Backups List */}
          {currentUser && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="font-bold text-slate-200 text-xs">
                  Backups Stored in Google Drive ({driveFiles.length})
                </span>
                <button
                  onClick={() => token && fetchDriveFiles(token)}
                  disabled={isLoadingFiles}
                  className="text-slate-400 hover:text-slate-200 text-[11px] flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {isLoadingFiles ? (
                <div className="py-10 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                  <span>Loading files from Google Drive...</span>
                </div>
              ) : driveFiles.length > 0 ? (
                <div className="space-y-2">
                  {driveFiles.map((file) => (
                    <div
                      key={file.id}
                      className="bg-[#1b202c] hover:bg-[#222736] p-3.5 rounded-2xl border border-white/[0.07] transition-all flex items-center justify-between gap-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                          <HardDrive className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-semibold text-slate-100 text-xs truncate">
                            {file.name}
                          </h5>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>Modified: {new Date(file.modifiedTime).toLocaleString()}</span>
                            {file.size && <span>· {(parseInt(file.size, 10) / 1024).toFixed(1)} KB</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setFileToRestore(file)}
                          className="px-3 py-1.5 rounded-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition-colors flex items-center gap-1"
                          title="Restore this fleet backup"
                        >
                          <DownloadCloud className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>

                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors"
                            title="Open in Google Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          onClick={() => setFileToDelete(file)}
                          className="p-1.5 rounded-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                          title="Delete from Google Drive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-[#171a22]/50 rounded-[28px] border border-dashed border-white/10 p-6 space-y-2">
                  <Cloud className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-slate-300 text-xs font-semibold">
                    No Trackora backups found in Google Drive
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    Click "Backup Now to Drive" above to create your first cloud backup.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#171b26]/90 border-t border-white/[0.08] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            Encrypted client-side Google Workspace integration
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold transition-colors"
          >
            {t('close')}
          </button>
        </div>

        {/* Mandatory User Confirmation Modal for Destructive Delete */}
        {fileToDelete && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-sm bg-[#1a1e29] border border-rose-500/30 rounded-[28px] p-5 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">
                    Delete from Google Drive?
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    This action will permanently remove this file from your Google Drive.
                  </p>
                </div>
              </div>

              <div className="bg-[#12151d] p-3 rounded-xl border border-white/[0.05] text-[11px] text-slate-300 font-mono truncate">
                {fileToDelete.name}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setFileToDelete(null)}
                  className="px-4 py-2 rounded-full text-slate-400 hover:text-slate-200 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-500/25 active:scale-95 transition-all"
                >
                  Yes, Delete File
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal for Restore */}
        {fileToRestore && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-sm bg-[#1a1e29] border border-emerald-500/30 rounded-[28px] p-5 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <DownloadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">
                    Restore Fleet Inventory?
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    This will load the assets and licenses from this backup into your active workspace.
                  </p>
                </div>
              </div>

              <div className="bg-[#12151d] p-3 rounded-xl border border-white/[0.05] text-[11px] text-slate-300 font-mono truncate">
                {fileToRestore.name}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setFileToRestore(null)}
                  className="px-4 py-2 rounded-full text-slate-400 hover:text-slate-200 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRestore}
                  className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-500/25 active:scale-95 transition-all"
                >
                  Confirm Restore
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
