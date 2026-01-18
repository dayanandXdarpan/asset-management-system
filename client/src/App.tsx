import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { AssetList } from './pages/Assets/AssetList';
import { AssetForm } from './pages/Assets/AssetForm';
import { AssetDetails } from './pages/Assets/AssetDetails';
import { LocationList } from './pages/Locations/LocationList';
import { MaintenanceList } from './pages/Maintenance/MaintenanceList';
import { Settings } from './pages/Settings/Settings';
import { Reports } from './pages/Reports/Reports';
import { UserManagement } from './pages/Users/UserManagement';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Login } from './pages/Auth/Login';
import { NotFound } from './pages/NotFound';
import { VendorList } from './pages/Vendors/VendorList';
import { VendorForm } from './pages/Vendors/VendorForm';
import { Profile } from './pages/Users/Profile';
import { AuditLogs } from './pages/Admin/AuditLogs';
import { RoleGuard } from './components/RoleGuard';

// ... (existing imports)

import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        Loading Session...
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ThemeProvider defaultTheme="light" storageKey="inframonitor-theme">
          <AuthProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                style: { background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)' },
                success: { iconTheme: { primary: '#10b981', secondary: '#fff' } }
              }}
            />
            <ProtectedRoute>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="/assets" element={<AssetList />} />
                  <Route path="/assets/new" element={
                    <RoleGuard allowedRoles={['ADMIN']} fallback={<div className="p-10 text-center">Access Denied</div>}>
                      <AssetForm />
                    </RoleGuard>
                  } />
                  <Route path="/assets/:id" element={<AssetDetails />} />
                  <Route path="/map" element={<LocationList />} />
                  <Route path="/maintenance" element={<MaintenanceList />} />
                  <Route path="/vendors" element={<VendorList />} />
                  <Route path="/vendors/new" element={
                    <RoleGuard allowedRoles={['ADMIN']} fallback={<div className="p-10 text-center">Access Denied</div>}>
                      <VendorForm />
                    </RoleGuard>
                  } />
                  <Route path="/vendors/:id" element={
                    <RoleGuard allowedRoles={['ADMIN']} fallback={<div className="p-10 text-center">Access Denied</div>}>
                      <VendorForm />
                    </RoleGuard>
                  } />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/users" element={
                    <RoleGuard allowedRoles={['ADMIN']} fallback={<div className="p-10 text-center">Access Denied</div>}>
                      <UserManagement />
                    </RoleGuard>
                  } />
                  <Route path="/audit-logs" element={
                    <RoleGuard allowedRoles={['ADMIN']} fallback={<div className="p-10 text-center">Access Denied</div>}>
                      <AuditLogs />
                    </RoleGuard>
                  } />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ProtectedRoute>
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
