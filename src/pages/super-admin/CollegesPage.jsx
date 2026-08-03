import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Building2, MapPin, Users, Loader2 } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import api from '../../api/axios';

const inputCls = "w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm bg-card text-text placeholder:text-text/45";

export function CollegesPage() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', mobile: '', email: '', location: '', password: ''});
  const toast = useToast();

  const fetchColleges = async () => {
    try {
      const res = await api.get('/super-admin/colleges');
      if (res.data.success) {
        setColleges(res.data.data);
      }
    } catch (err) {
      toast('Failed to load colleges', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, [toast]);

  const filtered = colleges.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.mobile.includes(search) || 
    c.email.includes(search) || 
    c.location.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditing(null); setForm({ name: '', mobile: '', email: '', location: '', password: '' }); setModalOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, mobile: c.mobile, email: c.email, location: c.location, password: '' }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name || !form.mobile || !form.email || !form.location) return;
    if (!editing && !form.password) {
      toast('Please enter a password', 'error');
      return;
    }
    try {
      const payload = {
          collegeName: form.name,
          mobile: form.mobile,
          email: form.email,
          location: form.location,
          password: form.password
      };
      
      if (editing) {
        const res = await api.put(`/college/${editing.id}`, payload);
        if (res.data.success) {
          toast('College updated successfully!', 'success');
          fetchColleges();
        }
      } else {
        const res = await api.post('/college/register', payload);
        if (res.data.success) {
          toast('College registered successfully!', 'success');
          fetchColleges();
        }
      }
      setModalOpen(false);
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save college', 'error');
    }
  };

  const handleDelete = (id) => {
    setColleges(cs => cs.filter(c => c.id !== id));
    toast('College removed locally (API not yet implemented)', 'info');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Colleges</h1>
          <p className="text-text/60 text-sm mt-1">Manage all affiliated colleges in the system.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add College
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[{ label: 'Total Colleges', value: colleges.length, icon: Building2, color: 'text-purple-400', bg: 'bg-purple-500/15' },
          { label: 'Active', value: colleges.filter(c => c.isActive).length, icon: Users, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Total Students', value: colleges.reduce((s, c) => s + (c._count?.students || 0), 0), icon: Users, color: 'text-primary', bg: 'bg-primary/10' }]
          .map((s, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className={`p-3 rounded-xl ${s.bg} ${s.color}`}><s.icon className="w-5 h-5" /></div>
              <div><p className="text-xs text-text/55">{s.label}</p><p className="text-xl font-bold text-text">{s.value}</p></div>
            </div>
          ))}
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden animate-fade-in-up delay-200">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text/45" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search colleges..." className="pl-9 pr-4 py-2 border border-border rounded-xl text-sm outline-none focus:border-primary w-full bg-card text-text placeholder:text-text/45" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-muted/50 border-b border-border text-text/60 font-medium">
              <tr>
                <th className="px-6 py-4">College Name</th>
                <th className="px-6 py-4">Mobile</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Courses</th>
                <th className="px-6 py-4">Students</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-text">{c.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text/55">{c.mobile}</td>
                  <td className="px-6 py-4 text-text/55">{c.email}</td>
                  <td className="px-6 py-4"><div className="flex items-center gap-1 text-text/55"><MapPin className="w-3.5 h-3.5 shrink-0" />{c.location}</div></td>
                  <td className="px-6 py-4 text-text/55">N/A</td>
                  <td className="px-6 py-4 text-text/55">{c._count?.students || 0}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="p-2 text-text/45 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-2 text-text/45 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit College' : 'Add New College'}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-text mb-1.5">College Name <span className="text-danger">*</span></label>
            <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Enter college name" /></div>
          <div><label className="block text-sm font-medium text-text mb-1.5">Mobile <span className="text-danger">*</span></label>
            <input className={inputCls} value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} placeholder="Enter mobile" /></div>
          <div><label className="block text-sm font-medium text-text mb-1.5">Email <span className="text-danger">*</span></label>
            <input className={inputCls} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Enter email" /></div>
          <div><label className="block text-sm font-medium text-text mb-1.5">Password {editing ? <span className="text-text/50 font-normal text-xs">(Leave blank to keep current)</span> : <span className="text-danger">*</span>}</label>
            <input type="password" className={inputCls} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder={editing ? "Enter new password (optional)" : "Enter admin password"} /></div>
          <div><label className="block text-sm font-medium text-text mb-1.5">Location <span className="text-danger">*</span></label>
            <input className={inputCls} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Enter Location" /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-border text-text font-medium text-sm hover:bg-muted/50 transition-colors">Cancel</button>
            <button onClick={handleSave} className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm">
              {editing ? 'Save Changes' : 'Add College'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
