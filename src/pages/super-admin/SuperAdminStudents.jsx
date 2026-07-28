import { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Users, Loader2 } from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import api from '../../api/axios';
import { useToast } from '../../components/ui/Toast';

const STATUSES = ['All', 'APPROVED', 'UNDER_REVIEW', 'REJECTED', 'SUBMITTED', 'CONFIRMED'];

export function SuperAdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const toast = useToast();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/super-admin/students');
        if (res.data.success) {
          setStudents(res.data.data);
        }
      } catch (err) {
        toast('Failed to load students', 'error');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [toast]);

  const filtered = students.filter(s => {
    const sCollege = s.college?.name || '';
    const sId = s.id || '';
    const sStatus = s.applications?.[0]?.status || 'DRAFT';
    
    const matchSearch = s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      sId.toLowerCase().includes(search.toLowerCase()) ||
      sCollege.toLowerCase().includes(search.toLowerCase());
      
    const matchStatus = statusFilter === 'All' || sStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">All Students</h1>
          <p className="text-text/60 text-sm mt-1">System-wide student directory across all colleges.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-border bg-card text-text rounded-xl font-semibold text-sm hover:bg-muted/50 transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: students.length, color: 'text-primary bg-primary/10' },
          { label: 'Approved', value: students.filter(s => s.applications?.[0]?.status === 'APPROVED').length, color: 'text-success bg-success/10' },
          { label: 'Under Review', value: students.filter(s => s.applications?.[0]?.status === 'UNDER_REVIEW').length, color: 'text-warning bg-warning/10' },
          { label: 'Submitted', value: students.filter(s => s.applications?.[0]?.status === 'SUBMITTED').length, color: 'text-indigo-400 bg-indigo-500/15' },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-4 shadow-sm animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
            <p className="text-xs text-text/55 mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-text">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden animate-fade-in-up delay-200">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text/45" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, ID, college..." className="pl-9 pr-4 py-2 border border-border rounded-xl text-sm outline-none focus:border-primary w-full bg-card text-text placeholder:text-text/45" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {STATUSES.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${statusFilter === s ? 'bg-primary text-white' : 'bg-muted text-text/70 hover:bg-border/60'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-muted/50 border-b border-border text-text/60 font-medium">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">App ID</th>
                <th className="px-6 py-4">College</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Session</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-text/45 text-sm">No students found.</td></tr>
              ) : filtered.map((s, i) => {
                const sStatus = s.applications?.[0]?.status || 'DRAFT';
                const appId = s.applications?.[0]?.id?.slice(-6).toUpperCase() || 'N/A';
                
                return (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {s.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-text">{s.fullName}</p>
                          <p className="text-xs text-text/45">{s.mobile}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-text/55">{appId}</td>
                    <td className="px-6 py-4 text-text/55">{s.college?.name}</td>
                    <td className="px-6 py-4 text-text/55">{s.course}</td>
                    <td className="px-6 py-4 text-text/55">N/A</td>
                    <td className="px-6 py-4 text-text/55">{s.year}</td>
                    <td className="px-6 py-4"><StatusBadge status={sStatus} /></td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-text/45 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
