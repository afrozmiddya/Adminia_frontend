import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, ChevronDown, LogOut, User, GraduationCap, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from '../ThemeToggle';
import { useAuthStore } from '../../store/authStore';

export default function DashboardLayout({ navigation, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const isStudent = title === 'Student Portal';
  const isSuperAdmin = title === 'Super Admin';

  const gradients = {
    'Student Portal': 'from-blue-600 to-indigo-600',
    'Admin Panel': 'from-indigo-600 to-purple-600',
    'Super Admin': 'from-purple-600 to-pink-600',
  };
  const gradient = gradients[title] || gradients['Admin Panel'];

  const userMeta = {
    'Student Portal': { name: user?.name || 'Student Name', email: user?.email || 'student@example.com', initials: user?.name?.charAt(0) || 'S', Icon: GraduationCap },
    'Admin Panel': { name: user?.name || 'College Admin', email: user?.email || 'admin@college.edu', initials: user?.name?.charAt(0) || 'A', Icon: ShieldCheck },
    'Super Admin': { name: user?.name || 'Super Admin', email: user?.email || 'superadmin@adminia.in', initials: user?.name?.charAt(0) || 'SA', Icon: ShieldCheck },
  };
  const activeUser = userMeta[title] || userMeta['Admin Panel'];

  const isActive = (item) => {
    const roots = ['/student', '/admin', '/super-admin', '/'];
    if (roots.includes(item.href)) return location.pathname === item.href;
    return location.pathname.startsWith(item.href);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex font-sans text-text">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-card border-r border-border flex flex-col
        transform transition-transform duration-250 ease-in-out lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Logo */}
        <div className="h-[68px] flex items-center px-5 border-b border-border justify-between shrink-0">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary"><img src="http://res.cloudinary.com/dz0xmodpo/image/upload/v1778387204/Adminia_Logo_vhmg3p.png" alt="Adminia Logo" className="w-12 h-12" />Adminia</Link>
          <button onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-text/50 hover:text-text rounded-lg hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role pill */}
        <div className="mx-3 mt-3 px-4 py-2 rounded-xl bg-primary/5 border border-primary/10 shrink-0">
          <p className="text-[11px] font-bold text-primary uppercase tracking-widest">{title}</p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-0.5 mt-1 overflow-y-auto">
          {navigation.map((item) => {
            if (item.name === 'Logout') return null;
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <Link key={item.name} to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                  ${active
                    ? 'bg-primary text-white shadow-sm shadow-primary/20'
                    : 'text-text/70 hover:bg-white/5 hover:text-text'}`}>
                <Icon className={`w-[18px] h-[18px] shrink-0 transition-transform duration-150 ${active ? '' : 'group-hover:scale-110'}`} />
                {item.name}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
              </Link>
            );
          })}
        </nav>

        {/* User card */}
        <div className="p-3 border-t border-border shrink-0">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}>
              <span className="text-white text-xs font-bold">{activeUser.initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text truncate">{activeUser.name}</p>
              <p className="text-xs text-text/50 truncate">{activeUser.email}</p>
            </div>
            <button onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-text/45 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors shrink-0">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 lg:pl-[260px] flex flex-col min-h-screen min-w-0 w-0">

        {/* Top header */}
        <header className="h-[68px] glass border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 transition-all duration-300">

          {/* Hamburger (mobile) */}
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-text/55 hover:text-text hover:bg-white/5 rounded-xl transition-colors">
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop breadcrumb */}
          <div className="hidden lg:flex items-center gap-2 text-sm text-text/55">
            <span className="font-semibold text-text">{title}</span>
          </div>
          
          <div className="flex-1"></div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 min-w-0 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
