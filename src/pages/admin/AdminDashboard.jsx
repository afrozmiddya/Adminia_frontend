import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  ToggleLeft, 
  ToggleRight, 
  Clock, 
  AlertTriangle,
  Download,
  Calendar
} from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import { StatusBadge } from '../../components/ui/StatusBadge';

/* ─── Applications Table ─── */
export function ApplicationsTable({ limit, dataList }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [fetchedApplications, setFetchedApplications] = useState([]);
  const [loading, setLoading] = useState(!dataList);
  const toast = useToast();

  useEffect(() => {
    if (!dataList) {
      const fetchApps = async () => {
        try {
          const res = await api.get('/review/applications');
          if (res.data.success) {
            setFetchedApplications(res.data.data);
          }
        } catch (error) {
          toast && toast.showToast("Failed to fetch applications", "error");
        } finally {
          setLoading(false);
        }
      };
      fetchApps();
    }
  }, [dataList]);

  const COURSES = [
    "Bachelor's Degree in Business Administration(BBA)",
    "Bachelor's Degree in Computer Application (BCA)",
    "BBA in Hospital Management",
    "B.Sc in Media Science",
    "BBA in Sports Management",
    "Bachelor's Degree in Travel and Tourism Management",
    "Bachelor's Degree in Automobile Servicing Technology",
    "Bachelor's Degree in Hardware and Networking",
    "Bachelor's Degree in Electronics Manufacturing Services",
    "B.Sc in VFX Film Making",
    "B.Sc in Medical Lab Technology",
    "Bachelor's Degree in Medical Lab Technology",
    "B.Sc. in Multimedia, Animation and Graphics",
    "Bachelor's Degree in Interior Design"
  ];

  const applications = dataList || fetchedApplications;

  const filtered = applications.filter(app => {
    const searchLower = search.toLowerCase();
    const studentName = app.student?.fullName || app.student?.name || '';
    const courseName = app.student?.course || app.formData?.phase1?.admissionDetails?.course || '';
    
    const matchesSearch = studentName.toLowerCase().includes(searchLower) ||
                          app.id.toLowerCase().includes(searchLower) ||
                          courseName.toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter ? app.status === statusFilter : true;
    
    const matchesCourse = !courseFilter || 
                          courseName === courseFilter || 
                          courseFilter.toLowerCase().includes(courseName.toLowerCase());

    return matchesSearch && matchesStatus && matchesCourse;
  });

  const data = limit ? filtered.slice(0, limit) : filtered;

  const statuses = ['Under Review', 'Approved', 'Rejected', 'Need Correction'];

  const handleExportCSV = () => {
    if (!filtered || filtered.length === 0) {
      // using basic alert if toast isn't available in scope, but toast should be. Just in case:
      return;
    }
    const headers = ['Application ID', 'Student Name', 'Course', 'Status', 'Date', 'Phase'];
    
    const csvRows = [headers.join(',')];

    for (const app of filtered) {
      const studentName = app.student?.fullName || app.student?.name || '';
      const courseName = app.student?.course || app.formData?.phase1?.admissionDetails?.course || '';
      const dateStr = new Date(app.createdAt || app.submittedAt || Date.now()).toLocaleDateString();
      
      const row = [
        app.id,
        studentName,
        courseName,
        app.status,
        dateStr,
        app.phase
      ].map(val => `"${(val || '—').toString().replace(/"/g, '""')}"`);
      csvRows.push(row.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'applications_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className={!limit ? "space-y-6 animate-fade-in" : ""}>
      {!limit && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text">Applications</h1>
            <p className="text-text/60 mt-1 text-sm">Review and manage all student applications.</p>
          </div>
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border text-text rounded-xl font-medium text-sm hover:bg-muted/50 transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      )}
      <div className="bg-card border border-border rounded-xl shadow-sm">
        {!limit && (
          <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between gap-3 relative">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text/45" />
            <input 
              type="text" 
              placeholder="Search applications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-border rounded-xl outline-none focus:border-primary text-sm w-full sm:w-80 transition-colors bg-card text-text placeholder:text-text/45" 
            />
          </div>
          <div className="flex gap-2">
            {(statusFilter || courseFilter) && (
              <button 
                onClick={() => { setStatusFilter(''); setCourseFilter(''); }}
                className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary/20 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" /> Clear
              </button>
            )}
            <button 
              onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-medium transition-colors ${showFilter || statusFilter || courseFilter ? 'bg-primary/5 border-primary/20 text-primary' : 'hover:bg-muted/50'}`}
            >
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>

          {/* Filter Dropdown */}
          {showFilter && (
            <div className="absolute right-4 top-[calc(100%-4px)] w-72 bg-card border border-border rounded-2xl shadow-2xl z-30 animate-scale-in origin-top-right overflow-hidden sm:right-0">
              <div className="p-3 border-b border-border bg-muted/40 flex items-center justify-between">
                <span className="text-xs font-bold text-text/55 uppercase tracking-wider">Advanced Filters</span>
                <button onClick={() => setShowFilter(false)} className="p-1 hover:bg-border/50 rounded-lg transition-colors">
                  <XCircle className="w-4 h-4 text-text/45" />
                </button>
              </div>
              
              <div className="p-3 space-y-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-[10px] font-bold text-text/45 uppercase mb-2">By Status</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {statuses.map(status => (
                      <button 
                        key={status} 
                        onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
                        className={`text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${statusFilter === status ? 'bg-primary text-white font-bold' : 'bg-muted/60 text-text/70 hover:bg-muted'}`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Course Filter */}
                <div>
                  <label className="block text-[10px] font-bold text-text/45 uppercase mb-2">By Course</label>
                  <select 
                    value={courseFilter} 
                    onChange={(e) => setCourseFilter(e.target.value)}
                    className="w-full text-xs border border-border rounded-lg p-2 outline-none focus:border-primary bg-card text-text"
                  >
                    <option value="">All Courses</option>
                    {COURSES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-muted/50 text-text/60 font-medium border-b border-border">
            <tr>
              <th className="px-6 py-4">Application ID</th>
              <th className="px-6 py-4">Student Name</th>
              <th className="px-6 py-4">Course</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-text/45 text-sm">
                  Loading applications...
                </td>
              </tr>
            )}
            {!loading && data.map((app, i) => (
              <tr key={app.id} className="hover:bg-muted/30 transition-colors animate-fade-in"
                style={{ animationDelay: `${i * 40}ms` }}>
                <td className="px-6 py-4 font-mono text-xs font-semibold text-text">{app.id}</td>
                <td className="px-6 py-4 font-medium text-text">{app.student?.fullName || app.student?.name || 'Unknown'}</td>
                <td className="px-6 py-4 text-text/55">{app.student?.course || app.formData?.phase1?.admissionDetails?.course || 'N/A'}</td>
                <td className="px-6 py-4"><StatusBadge status={app.status} /></td>
                <td className="px-6 py-4 text-text/55">{new Date(app.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <Link to={`/admin/applications/${app.id}`}
                    className="text-xs font-semibold text-primary border border-primary/25 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors">
                    Review
                  </Link>
                </td>
              </tr>
            ))}
            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-text/45 text-sm">
                  No applications found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}

/* ─── Admin Dashboard ─── */
export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [phase1, setPhase1] = useState(true);
  const [phase2, setPhase2] = useState(false);
  const [applications, setApplications] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [targetPhase, setTargetPhase] = useState(null);
  const [deadlineDate, setDeadlineDate] = useState('');
  const toast = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/review/applications');
        if (res.data.success) {
          setApplications(res.data.data);
        }
        
        const phaseRes = await api.get(`/phase/status?t=${Date.now()}`);
        if (phaseRes.data.success) {
          setPhase1(phaseRes.data.data.phase1Enabled);
          setPhase2(phaseRes.data.data.phase2Enabled);
        }
      } catch (error) {
        toast && toast.showToast("Failed to load dashboard data", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const confirmToggle = async () => {
    if (targetPhase === null) return;
    const { phase, val, setVal } = targetPhase;
    try {
      const endpoint = `/phase/phase${phase}/${!val ? 'enable' : 'disable'}`;
      const payload = !val ? { deadline: deadlineDate } : {};
      await api.patch(endpoint, payload);
      setVal(!val);
      toast && toast(`Phase ${phase} ${!val ? 'activated' : 'deactivated'}.`, !val ? 'success' : 'warning');
    } catch (err) {
      toast && toast(`Failed to toggle Phase ${phase}.`, 'error');
    } finally {
      setModalOpen(false);
      setDeadlineDate('');
      setTargetPhase(null);
    }
  };

  const handleToggleClick = (phase, val, setVal) => {
    if (!val) {
      // Trying to activate, show modal
      setTargetPhase({ phase, val, setVal });
      setModalOpen(true);
    } else {
      // Trying to deactivate, do it immediately
      setTargetPhase({ phase, val, setVal });
      // Have to call confirmToggle indirectly after setting state, or directly pass args
      const disableEndpoint = `/phase/phase${phase}/disable`;
      api.patch(disableEndpoint).then(() => {
        setVal(false);
        toast && toast(`Phase ${phase} deactivated.`, 'warning');
      }).catch(() => {
        toast && toast(`Failed to toggle Phase ${phase}.`, 'error');
      });
    }
  };

  const stats = [
    { name: 'Total Applications', value: applications.length, sub: 'All time',   icon: Users,         color: 'text-blue-600',  bg: 'bg-blue-100' },
    { name: 'Under Review',       value: applications.filter(a => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW').length,   sub: 'Needs attention', icon: Clock,         color: 'text-warning',   bg: 'bg-warning/10' },
    { name: 'Approved',           value: applications.filter(a => a.status === 'APPROVED').length,   sub: 'Verified',      icon: CheckCircle,   color: 'text-success',   bg: 'bg-success/10' },
    { name: 'Rejected',           value: applications.filter(a => a.status === 'REJECTED').length,   sub: 'Requires resubmission',      icon: XCircle,       color: 'text-danger',    bg: 'bg-danger/10' },
  ];

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">Manage applications and phase controls for your college.</p>
      </div>

      {/* Phase Control */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm animate-fade-in-up delay-50">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-warning" />
          <h2 className="text-sm font-bold text-text">Phase Control</h2>
          <span className="text-xs text-gray-400">— Open or close application windows for students</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          {[
            { label: 'Phase I — Application Form', active: phase1, num: 1, toggle: () => handleToggleClick(1, phase1, setPhase1) },
            { label: 'Phase II — Documentation',   active: phase2, num: 2, toggle: () => handleToggleClick(2, phase2, setPhase2) },
          ].map(ph => (
            <div key={ph.num}
              className={`flex-1 flex items-center justify-between p-4 rounded-xl border transition-all ${ph.active ? 'bg-success/5 border-success/30' : 'bg-muted/40 border-border'}`}>
              <div>
                <p className="font-semibold text-sm text-text">{ph.label}</p>
                <p className={`text-xs font-medium mt-0.5 ${ph.active ? 'text-success' : 'text-text/50'}`}>
                  {ph.active ? '● Active' : '○ Inactive'}
                </p>
              </div>
              <button onClick={ph.toggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-colors ${ph.active ? 'bg-danger hover:bg-danger/90' : 'bg-success hover:bg-success/90'}`}>
                {ph.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                {ph.active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, i) => (
          <div key={s.name} className="bg-card border border-border rounded-xl p-5 shadow-sm animate-fade-in-up"
            style={{ animationDelay: `${120 + i * 60}ms` }}>
            <div className="flex items-start justify-between mb-3">
              <div className={`p-3 rounded-xl ${s.bg} ${s.color}`}><s.icon className="w-5 h-5" /></div>
            </div>
            <p className="text-xs font-medium text-gray-500 mb-1">{s.name}</p>
            <p className="text-2xl font-bold text-text">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent Applications */}
      <div className="animate-fade-in-up delay-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-text">Recent Applications</h2>
          <Link to="/admin/applications" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
            View All →
          </Link>
        </div>
        <ApplicationsTable limit={5} dataList={applications} />
      </div>

      {/* Deadline Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-border animate-scale-in">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text">Set Phase Deadline</h3>
                  <p className="text-xs text-text/60">Choose a deadline for this phase to automatically close.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-text">Deadline Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    className="w-full px-4 py-2 bg-muted/50 border border-border rounded-xl outline-none focus:border-primary text-sm text-text"
                  />
                  <p className="text-xs text-warning mt-1">If left empty, the phase will stay open indefinitely.</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-8">
                <button
                  onClick={() => { setModalOpen(false); setDeadlineDate(''); setTargetPhase(null); }}
                  className="px-4 py-2 text-sm font-bold text-text/60 hover:text-text hover:bg-muted/50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmToggle}
                  className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                  Activate Phase
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
