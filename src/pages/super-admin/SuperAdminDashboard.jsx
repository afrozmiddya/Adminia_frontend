import { useState, useEffect } from 'react';
import { Users, Building2, FileText, CheckCircle, TrendingUp, Activity, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../api/axios';
import { useToast } from '../../components/ui/Toast';

export function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const showToast = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [metricsRes, logsRes] = await Promise.all([
          api.get('/super-admin/dashboard'),
          api.get('/super-admin/logs')
        ]);
        
        if (metricsRes.data.success) {
          setData(metricsRes.data.data);
        }
        if (logsRes.data.success) {
          setRecentLogs(logsRes.data.data.slice(0, 5));
        }
      } catch (err) {
        showToast('Failed to fetch dashboard data', 'error');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [showToast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const { totalColleges = 0, totalStudents = 0, totalApplications = 0, approvedApplications = 0, pendingApplications = 0, rejectedApplications = 0, appsOverTime = [] } = data || {};

  const STATS = [
    { name: 'Total Colleges', value: totalColleges, icon: Building2, color: 'text-purple-600', bg: 'bg-purple-100', trend: 'latest' },
    { name: 'Total Students', value: totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', trend: 'latest' },
    { name: 'Applications', value: totalApplications, icon: FileText, color: 'text-warning', bg: 'bg-warning/10', trend: 'latest' },
    { name: 'Approvals', value: approvedApplications, icon: CheckCircle, color: 'text-success', bg: 'bg-success/10', trend: 'latest' },
  ];

  const pieData = [
    { name: 'Approved', value: approvedApplications, color: '#16A34A' },
    { name: 'Pending', value: pendingApplications, color: '#F59E0B' },
    { name: 'Rejected', value: rejectedApplications, color: '#DC2626' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="delay-100">
        <h1 className="text-2xl font-bold text-text">Super Admin Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">System-wide overview across all colleges and batches.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STATS.map((s, i) => (
          <div key={s.name} className="bg-card border border-border rounded-2xl p-5 shadow-sm animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${s.bg} ${s.color}`}><s.icon className="w-5 h-5" /></div>
              <span className="text-xs text-success font-medium flex items-center gap-1"><TrendingUp className="w-3 h-3" />{s.trend}</span>
            </div>
            <p className="text-xs font-medium text-gray-500 mb-1">{s.name}</p>
            <p className="text-2xl font-bold text-text">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm animate-fade-in-up delay-200">
          <h2 className="text-base font-bold text-text mb-5">Applications Over Time</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={appsOverTime} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="10%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Area type="monotone" dataKey="apps" stroke="#2563EB" strokeWidth={2.5} fill="url(#areaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm animate-fade-in-up delay-300">
          <h2 className="text-base font-bold text-text mb-5">Application Status</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} /><span className="text-gray-600">{d.name}</span></div>
                <span className="font-semibold text-text">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-card border border-border rounded-2xl shadow-sm animate-fade-in-up delay-400">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-text">Recent Activity</h2>
          </div>
          <Link to="/super-admin/logs" className="text-sm font-medium text-primary hover:text-primary/80">View Logs</Link>
        </div>
        <div className="divide-y divide-border">
          {recentLogs.map(a => (
            <div key={a.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text">{a.action}</p>
                <p className="text-xs text-gray-500 truncate">{a.description || a.entity}</p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {new Date(a.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
          {recentLogs.length === 0 && (
            <div className="p-6 text-center text-gray-500 text-sm">No recent activity</div>
          )}
        </div>
      </div>
    </div>
  );
}
