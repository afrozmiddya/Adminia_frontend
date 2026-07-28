import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, UploadCloud, Users, Clock,
  CheckSquare, User, Building2, Activity, BookOpen, Shield
} from 'lucide-react';

import { lazy, Suspense } from 'react';
import LandingLayout from './components/layouts/LandingLayout';
import DashboardLayout from './components/layouts/DashboardLayout';
import { ToastProvider } from './components/ui/Toast';
import ErrorBoundary from './components/ui/ErrorBoundary';
import ProtectedRoute from './components/ui/ProtectedRoute';

// Helper for named lazy imports to avoid bundle splitting issues with barrels if not supported natively
const lazyNamed = (moduleName, importFunc) => {
  return lazy(() => importFunc().then(module => ({ default: module[moduleName] })));
};

const LandingPage = lazyNamed('LandingPage', () => import('./pages'));
const LoginPage = lazyNamed('LoginPage', () => import('./pages'));
const RegisterPage = lazyNamed('RegisterPage', () => import('./pages'));
const AdminLoginPage = lazyNamed('AdminLoginPage', () => import('./pages'));

const StudentDashboard = lazyNamed('StudentDashboard', () => import('./pages'));
const ApplicationForm = lazyNamed('ApplicationForm', () => import('./pages'));
const StudentDocuments = lazyNamed('StudentDocuments', () => import('./pages'));
const ProfilePage = lazyNamed('ProfilePage', () => import('./pages'));

const AdminDashboard = lazyNamed('AdminDashboard', () => import('./pages'));
const ApplicationsTable = lazyNamed('ApplicationsTable', () => import('./pages'));
const ApplicationReview = lazyNamed('ApplicationReview', () => import('./pages'));
const StudentTable = lazyNamed('StudentTable', () => import('./pages'));
const AdminDocuments = lazyNamed('AdminDocuments', () => import('./pages'));
const AdminProfile = lazyNamed('AdminProfile', () => import('./pages'));

const SuperAdminDashboard = lazyNamed('SuperAdminDashboard', () => import('./pages'));
const CollegesPage = lazyNamed('CollegesPage', () => import('./pages'));
const SuperAdminStudents = lazyNamed('SuperAdminStudents', () => import('./pages'));
const SuperAdminLogs = lazyNamed('SuperAdminLogs', () => import('./pages'));

const studentNav = [
  { name: 'Dashboard',   href: '/student',             icon: LayoutDashboard },
  { name: 'Phase-I Application', href: '/student/application', icon: FileText },
  { name: 'Phase-II Application',   href: '/student/documents',   icon: UploadCloud },
  { name: 'Profile',     href: '/student/profile',     icon: User },
];

const adminNav = [
  { name: 'Dashboard',    href: '/admin',              icon: LayoutDashboard },
  { name: 'Applications', href: '/admin/applications', icon: FileText },
  { name: 'Students',     href: '/admin/students',     icon: Users },
  { name: 'Documents',    href: '/admin/documents',    icon: UploadCloud },
  { name: 'Profile',      href: '/admin/profile',      icon: User },
];

const superAdminNav = [
  { name: 'Dashboard',    href: '/super-admin',                   icon: LayoutDashboard },
  { name: 'Colleges',     href: '/super-admin/colleges',          icon: Building2 },
  { name: 'Students',     href: '/super-admin/students',          icon: Users },
  // { name: 'Applications', href: '/super-admin/applications',      icon: FileText },
  { name: 'Logs',         href: '/super-admin/logs',              icon: Activity },
];

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <Suspense fallback={
            <div className="flex items-center justify-center h-screen w-full bg-slate-50 dark:bg-slate-900">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          }>
            <Routes>
              {/* Public */}
              <Route element={<LandingLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/admin-login" element={<AdminLoginPage />} />
              </Route>

              {/* Student Portal */}
              <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
                <Route path="/student" element={<DashboardLayout navigation={studentNav} title="Student Portal" role="student" />}>
                  <Route index element={<StudentDashboard />} />
                  <Route path="application" element={<ApplicationForm />} />
                  <Route path="documents" element={<StudentDocuments />} />
                  <Route path="profile" element={<ProfilePage />} />
                </Route>
              </Route>

              {/* Admin Panel */}
              <Route element={<ProtectedRoute allowedRoles={['COLLEGE_ADMIN']} />}>
                <Route path="/admin" element={<DashboardLayout navigation={adminNav} title="Admin Panel" role="admin" />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="applications" element={<ApplicationsTable />} />
                  <Route path="applications/:id" element={<ApplicationReview />} />
                  <Route path="students" element={<StudentTable />} />
                  <Route path="documents" element={<AdminDocuments />} />
                  <Route path="profile" element={<AdminProfile />} />
                </Route>
              </Route>

              {/* Super Admin */}
              <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
                <Route path="/super-admin" element={<DashboardLayout navigation={superAdminNav} title="Super Admin" role="superadmin" />}>
                  <Route index element={<SuperAdminDashboard />} />
                  <Route path="colleges" element={<CollegesPage />} />
                  <Route path="students" element={<SuperAdminStudents />} />
                  {/* <Route path="applications" element={<SuperAdminApplications />} /> */}
                  <Route path="logs" element={<SuperAdminLogs />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </ToastProvider>
  );
}
