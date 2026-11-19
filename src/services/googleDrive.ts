export interface DriveBackupFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
  webViewLink?: string;
}

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

/**
 * List existing Trackora IT fleet backup files in user's Google Drive
 */
export async function listTrackoraDriveFiles(accessToken: string): Promise<DriveBackupFile[]> {
  try {
    const q = "trashed = false and (name contains 'trackora' or name contains 'Trackora')";
    const url = `${DRIVE_API_URL}?q=${encodeURIComponent(q)}&fields=${encodeURIComponent('files(id, name, mimeType, modifiedTime, size, webViewLink)')}&orderBy=modifiedTime desc`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Google Drive API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return data.files || [];
  } catch (error) {
    console.error('Failed to list Google Drive files:', error);
    throw error;
  }
}

/**
 * Upload a JSON fleet inventory backup to Google Drive
 */
export async function uploadFleetBackupToDrive(
  accessToken: string,
  backupData: object,
  backupName?: string
): Promise<DriveBackupFile> {
  const fileName = backupName || `Trackora_Fleet_Backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const fileContent = JSON.stringify(backupData, null, 2);

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    description: 'Trackora Enterprise IT Asset Management Cloud Backup',
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    fileContent +
    closeDelimiter;

  const res = await fetch(DRIVE_UPLOAD_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Upload to Google Drive failed (${res.status}): ${errText}`);
  }

  return await res.json();
}

/**
 * Upload an equipment custody certificate to Google Drive
 */
export async function uploadReceiptToDrive(
  accessToken: string,
  title: string,
  textContent: string
): Promise<DriveBackupFile> {
  const fileName = `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Custody_Receipt.txt`;

  const metadata = {
    name: fileName,
    mimeType: 'text/plain',
    description: 'Trackora IT Asset Custody Handover Signed Certificate',
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/plain; charset=UTF-8\r\n\r\n' +
    textContent +
    closeDelimiter;

  const res = await fetch(DRIVE_UPLOAD_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to upload certificate to Google Drive: ${errText}`);
  }

  return await res.json();
}

/**
 * Download and parse backup content from Google Drive
 */
export async function downloadDriveBackupContent(
  accessToken: string,
  fileId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const url = `${DRIVE_API_URL}/${fileId}?alt=media`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to download backup from Google Drive (${res.status})`);
  }

  return await res.json();
}

/**
 * Delete a file in Google Drive (must be called ONLY after explicit user confirmation)
 */
export async function deleteDriveFile(
  accessToken: string,
  fileId: string
): Promise<boolean> {
  const url = `${DRIVE_API_URL}/${fileId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok && res.status !== 204) {
    throw new Error(`Failed to delete Google Drive file (${res.status})`);
  }

  return true;
}
