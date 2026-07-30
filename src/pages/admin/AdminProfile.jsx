import { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, Shield,
  Camera, Save, Lock, Globe,
  LogOut,
} from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import { useAuthStore } from '../../store/authStore';

const fieldCls =
  'w-full px-4 py-2.5 bg-card text-text placeholder:text-text/45 border border-border rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors';
const fieldReadonlyCls =
  'w-full px-4 py-2.5 bg-muted/50 text-text/70 border border-border rounded-xl text-sm cursor-not-allowed';

export function AdminProfile() {
  const toast = useToast();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('personal');
  const [isSaving, setIsSaving] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || 'College Admin',
    email: user?.email || 'admin@college.edu',
    phone: user?.phone || 'N/A', // Assuming backend doesn't have phone for admin yet or it's not in user payload
    role: user?.role === 'SUPER_ADMIN' ? 'Super Administrator' : 'Principal Administrator',
    college: user?.college?.name || 'Not Assigned',
    address: user?.college?.address || 'N/A',
    avatar: null
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast('Profile updated successfully', 'success');
    }, 1000);
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-text">Account Settings</h1>
          <p className="text-text/60 text-sm">Manage your profile information and security preferences.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
        >
          {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="md:col-span-1 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id 
                ? 'bg-primary text-white shadow-md shadow-primary/20' 
                : 'text-text/60 hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
          <div className="pt-4 mt-4 border-t border-border">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-all">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          {activeTab === 'personal' && (
            <div className="bg-card border border-border rounded-2xl p-6 space-y-8 animate-fade-in-up">
              {/* Profile Photo */}
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-dashed border-primary/30 group-hover:border-primary transition-colors overflow-hidden">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-primary" />
                    )}
                  </div>
                  <button type="button" className="absolute -bottom-2 -right-2 p-2 bg-card border border-border rounded-xl shadow-lg hover:bg-muted/50 transition-colors">
                    <Camera className="w-4 h-4 text-text/70" />
                  </button>
                </div>
                <div>
                  <h3 className="font-bold text-text">Profile Photo</h3>
                  <p className="text-xs text-text/50 mt-1">PNG, JPG or WEBP. Max 2MB.</p>
                  <div className="flex gap-2 mt-3">
                    <button className="text-xs font-bold text-primary hover:underline">Upload New</button>
                    <button className="text-xs font-bold text-red-500 hover:underline">Remove</button>
                  </div>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text/50 uppercase flex items-center gap-1.5">
                    <User className="w-3 h-3" /> Full Name
                  </label>
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className={fieldCls}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text/50 uppercase flex items-center gap-1.5">
                    <Mail className="w-3 h-3" /> Email Address
                  </label>
                  <input 
                    type="email" 
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className={fieldCls}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text/50 uppercase flex items-center gap-1.5">
                    <Phone className="w-3 h-3" /> Phone Number
                  </label>
                  <input 
                    type="text" 
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    className={fieldCls}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text/50 uppercase flex items-center gap-1.5">
                    <Globe className="w-3 h-3" /> College/Institution
                  </label>
                  <input 
                    type="text" 
                    value={profile.college}
                    readOnly
                    className={`${fieldReadonlyCls} font-sans`}
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-text/50 uppercase flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" /> Office Address
                  </label>
                  <textarea 
                    value={profile.address}
                    onChange={(e) => setProfile({...profile, address: e.target.value})}
                    rows="3"
                    className={`${fieldCls} resize-none`}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-bold text-text mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  Change Password
                </h3>
                <div className="grid gap-4 max-w-md">
                  <input type="password" placeholder="Current Password" className={fieldCls} />
                  <input type="password" placeholder="New Password" className={fieldCls} />
                  <input type="password" placeholder="Confirm New Password" className={fieldCls} />
                  <button className="w-fit px-6 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-colors">
                    Update Password
                  </button>
                </div>
              </div>

              {/* <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-text flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-primary" />
                      Two-Factor Authentication
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Add an extra layer of security to your account.</p>
                  </div>
                  <span className="px-3 py-1 bg-success/10 text-success text-[10px] font-bold uppercase tracking-wider rounded-full">Recommended</span>
                </div>
                <button className="flex items-center gap-2 px-6 py-2 border border-primary text-primary rounded-xl text-sm font-bold hover:bg-primary/5 transition-colors">
                  Enable 2FA
                </button>
              </div> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
