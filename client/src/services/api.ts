const API_BASE = 'http://localhost:3000/api';
const AUTH_BASE = 'http://localhost:3000/auth';

let authToken = localStorage.getItem('token') || '';

export const api = {
    setToken: (token: string) => {
        authToken = token;
    },

    // Auth
    login: async (creds: any) => {
        const res = await fetch(`${AUTH_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(creds)
        });
        if (!res.ok) throw new Error('Login failed');
        return res.json();
    },

    getMe: async () => {
        const res = await fetch(`${AUTH_BASE}/me`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!res.ok) throw new Error('Failed to get profile');
        return res.json();
    },

    updateProfile: async (data: any) => {
        const res = await fetch(`${AUTH_BASE}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update profile');
        return res.json();
    },

    changePassword: async (data: any) => {
        const res = await fetch(`${AUTH_BASE}/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to change password');
        return res.json();
    },

    async get(endpoint: string) {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    },

    async post(endpoint: string, data: any) {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    },

    async put(endpoint: string, data: any) {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    },

    async delete(endpoint: string) {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    },

    async upload(formData: FormData) {
        const res = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData,
        });
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    },

    // Assets
    getAssets: (query = '') => api.get(`/assets${query}`),
    getAsset: (id: number) => api.get(`/assets/${id}`),
    createAsset: (data: any) => api.post('/assets', data),
    updateAsset: (id: number, data: any) => api.put(`/assets/${id}`, data),
    deleteAsset: (id: number) => api.delete(`/assets/${id}`),

    // Locations
    getLocations: () => api.get('/locations'),
    getLocation: (id: number) => api.get(`/locations/${id}`),
    createLocation: (data: any) => api.post('/locations', data),
    updateLocation: (id: number, data: any) => api.put(`/locations/${id}`, data),
    deleteLocation: (id: number) => api.delete(`/locations/${id}`),

    // Maintenance
    getMaintenance: () => api.get('/maintenance'),
    getMaintenanceRecord: (id: number) => api.get(`/maintenance/${id}`),
    logMaintenance: (data: any) => api.post('/maintenance', data),
    updateMaintenance: (id: number, data: any) => api.put(`/maintenance/${id}`, data),
    deleteMaintenance: (id: number) => api.delete(`/maintenance/${id}`),

    // Vendors
    getVendors: () => api.get('/vendors'),
    getVendor: (id: number) => api.get(`/vendors/${id}`),
    createVendor: (data: any) => api.post('/vendors', data),
    updateVendor: (id: number, data: any) => api.put(`/vendors/${id}`, data),
    deleteVendor: (id: number) => api.delete(`/vendors/${id}`),

    // Audit Logs
    getAuditLogs: () => api.get('/audit-logs'),

    // Stats
    getStats: () => api.get('/stats'),
};
