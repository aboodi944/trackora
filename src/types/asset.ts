export type AssetStatus = 
  | 'in_use' 
  | 'available' 
  | 'maintenance' 
  | 'reserved' 
  | 'retired' 
  | 'missing';

export type AssetCategory = 
  | 'laptop' 
  | 'desktop' 
  | 'server' 
  | 'network' 
  | 'monitor' 
  | 'mobile' 
  | 'peripheral';

export type Department = 
  | 'Engineering' 
  | 'Product & Design' 
  | 'Sales & Marketing' 
  | 'Finance & Legal' 
  | 'IT & Infrastructure' 
  | 'Executive' 
  | 'Operations';

export interface MaintenanceLog {
  id: string;
  date: string;
  issue: string;
  technician: string;
  cost: number;
  status: 'open' | 'in_progress' | 'resolved';
  notes?: string;
}

export interface CustodyRecord {
  id: string;
  assignedTo: string;
  employeeEmail: string;
  department: Department;
  assignedDate: string;
  returnedDate?: string;
  signatureDataUrl?: string; // Digital signature
  conditionAtHandover: 'Brand New' | 'Excellent' | 'Good' | 'Fair';
  notes?: string;
}

export interface ITAsset {
  id: string;
  tag: string; // e.g. "AST-10492"
  serialNumber: string;
  model: string;
  manufacturer: string;
  category: AssetCategory;
  status: AssetStatus;
  location: string; // e.g. "HQ - Floor 3", "Server Room Rack 4B", "Remote"
  assignedUser?: string;
  assignedEmail?: string;
  department?: Department;
  purchaseDate: string; // YYYY-MM-DD
  purchaseCost: number;
  residualValue: number; // salvage value
  lifespanMonths: number; // e.g. 36 months for laptops, 60 for servers
  warrantyExpires: string; // YYYY-MM-DD
  processor?: string;
  ram?: string;
  storage?: string;
  operatingSystem?: string;
  macAddress?: string;
  ipAddress?: string;
  notes?: string;
  lastAuditedDate?: string;
  maintenanceHistory: MaintenanceLog[];
  custodyHistory: CustodyRecord[];
}

export interface SoftwareLicense {
  id: string;
  name: string;
  vendor: string;
  category: 'Productivity' | 'Security' | 'DevOps' | 'Design' | 'Infrastructure';
  totalSeats: number;
  usedSeats: number;
  annualCost: number;
  renewalDate: string;
  licenseKey: string;
  assignedUsers: string[];
}

export interface AuditSession {
  id: string;
  startedAt: string;
  completedAt?: string;
  location: string;
  scannedTagIds: string[];
  totalExpected: number;
  verifiedCount: number;
  missingCount: number;
  status: 'active' | 'completed';
}

export type PricingTier = 'starter' | 'pro' | 'enterprise';
