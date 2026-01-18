// Asset Types
export interface Asset {
    id: number;
    name: string;
    type: string;
    image?: string;
    installationDate: string;
    status: 'OPERATIONAL' | 'DOWNTIME' | 'MAINTENANCE';
    locationId: number;
    location?: Location;
    vendorId?: number;
    vendor?: Vendor;
    maintenance?: MaintenanceRecord[];
    createdAt: string;
}

export interface AssetFormData {
    name: string;
    type: string;
    status: string;
    locationId: string | number;
    vendorId?: string | number;
    installationDate: string;
    image?: string;
}

// Location Types
export interface Location {
    id: number;
    siteName: string;
    region: string;
    assets?: Asset[];
    _count?: {
        assets: number;
    };
}

export interface LocationFormData {
    siteName: string;
    region: string;
}

// Maintenance Types
export interface MaintenanceRecord {
    id: number;
    assetId: number;
    asset?: Asset;
    date: string;
    dueDate?: string;
    completionDate?: string;
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    workDescription: string;
    performedBy: string;
}

export interface MaintenanceFormData {
    assetId: string | number;
    workDescription: string;
    performedBy: string;
    date: string;
    dueDate?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

// Vendor Types
export interface Vendor {
    id: number;
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    assets?: Asset[];
    createdAt: string;
    _count?: {
        assets: number;
    };
}

export interface VendorFormData {
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
}

// User Types
export interface User {
    id: number;
    name: string;
    email: string;
    role: 'ADMIN' | 'TECHNICIAN' | 'VIEWER';
    createdAt?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    role?: 'ADMIN' | 'TECHNICIAN' | 'VIEWER';
}

// Audit Log Types
export interface AuditLog {
    id: number;
    action: string;
    entity: string;
    entityId?: number;
    details?: string;
    userId: number;
    user?: User;
    createdAt: string;
}

// API Response Types
export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        totalPages: number;
    };
}

export interface Stats {
    totalAssets: number;
    activeAssets: number;
    maintenanceCount: number;
    locations: number;
}

// Auth Response
export interface AuthResponse {
    token: string;
    user: User;
}

// Sort Configuration
export interface SortConfig {
    key: string;
    direction: 'asc' | 'desc';
}
