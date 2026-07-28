import { useState, useMemo, useEffect } from 'react';
import { Activity, Search, Building2, User, FileText, Settings, Shield, Calendar, Clock, Filter, XCircle, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../components/ui/Toast';

const TYPE_ICON = {
  college: Building2, student: User, application: FileText,
  system: Settings, auth: Shield,
};
const TYPE_COLOR = {
  college: 'bg-purple-500/15 text-purple-800 dark:text-purple-300 ring-1 ring-purple-500/20',
  student: 'bg-primary/15 text-primary ring-1 ring-primary/25',
  application: 'bg-warning/15 text-amber-800 dark:text-warning ring-1 ring-warning/30',
  system: 'bg-muted/80 text-text/80 ring-1 ring-border/50',
  auth: 'bg-success/15 text-green-800 dark:text-success ring-1 ring-success/25',
};



const ALL_TYPES = ['All', 'college', 'application', 'student', 'system', 'auth'];

const formatTimestamp = (ts) => {
  if (!ts) return '';
  const date = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (diffDays === 0) return `Today, ${timeStr}`;
  if (diffDays === 1) return `Yesterday, ${timeStr}`;
  if (diffDays < 7) return `${diffDays} days ago, ${timeStr}`;
  return date.toLocaleDateString() + ', ' + timeStr;
};

export function SuperAdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/super-admin/logs');
        if (res.data.success) {
          setLogs(res.data.data);
        }
      } catch (err) {
        toast('Failed to load logs', 'error');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [toast]);

  const filtered = useMemo(() => {
    return logs.filter(l => {
      const logAction = l.action || '';
      const logDetail = l.description || l.entity || '';
      const logType = (l.entity || '').toLowerCase();
      
      const matchSearch = logAction.toLowerCase().includes(search.toLowerCase()) ||
        logDetail.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'All' || logType === typeFilter;

      // Date & Time Filter Logic
      const logDate = new Date(l.createdAt);
      const logDateTime = logDate.getTime();

      let matchDate = true;
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (logDateTime < start.getTime()) matchDate = false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (logDateTime > end.getTime()) matchDate = false;
      }

      let matchTime = true;
      if (startTime || endTime) {
        const logTimeStr = l.createdAt.split('T')[1].substring(0, 5); // "HH:mm"
        if (startTime && logTimeStr < startTime) matchTime = false;
        if (endTime && logTimeStr > endTime) matchTime = false;
      }

      return matchSearch && matchType && matchDate && matchTime;
    });
  }, [logs, search, typeFilter, startDate, endDate, startTime, endTime]);

  const hasActiveFilters = startDate || endDate || startTime || endTime || typeFilter !== 'All' || search;

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('All');
    setStartDate('');
    setEndDate('');
    setStartTime('');
    setEndTime('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Activity Logs</h1>
          <p className="text-text/60 text-sm mt-1">Full audit trail of all system events.</p>
        </div>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary/20 transition-colors">
            <XCircle className="w-3.5 h-3.5" /> Clear All Filters
          </button>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm animate-fade-in-up delay-100">
        <div className="p-4 border-b border-border space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="relative max-w-md w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text/45" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search action or details..." className="pl-9 pr-4 py-2 border border-border rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 w-full bg-card text-text placeholder:text-text/45" />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-medium transition-colors ${showFilters ? 'bg-primary text-white border-primary' : 'text-text hover:bg-muted/50'}`}>
                <Filter className="w-4 h-4" />
                {showFilters ? 'Hide Filters' : 'Date & Time Filters'}
              </button>

              <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {ALL_TYPES.map(t => (
                  <button type="button" key={t} onClick={() => setTypeFilter(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition-colors border border-transparent ${typeFilter === t ? 'bg-primary text-white border-primary/30' : 'bg-muted/70 text-text/80 border-border/60 hover:bg-border/40'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/40 rounded-xl border border-border animate-scale-in">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text/60 uppercase flex items-center gap-1">
                  <Calendar className="w-3 h-3 shrink-0" /> Start Date
                </label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-border rounded-lg text-sm outline-none focus:border-primary bg-card text-text dark:[color-scheme:dark]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text/60 uppercase flex items-center gap-1">
                  <Calendar className="w-3 h-3 shrink-0" /> End Date
                </label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-border rounded-lg text-sm outline-none focus:border-primary bg-card text-text dark:[color-scheme:dark]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text/60 uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3 shrink-0" /> Start Time
                </label>
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                  className="w-full px-3 py-1.5 border border-border rounded-lg text-sm outline-none focus:border-primary bg-card text-text dark:[color-scheme:dark]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text/60 uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3 shrink-0" /> End Time
                </label>
                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                  className="w-full px-3 py-1.5 border border-border rounded-lg text-sm outline-none focus:border-primary bg-card text-text dark:[color-scheme:dark]" />
              </div>
            </div>
          )}
        </div>

        <div className="divide-y divide-border overflow-hidden rounded-b-2xl">
          {filtered.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center bg-muted/20">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 border border-border/60">
                <Search className="w-6 h-6 text-text/40" />
              </div>
              <p className="text-text/70 font-medium">No activity logs found</p>
              <p className="text-xs text-text/50 mt-1">Try adjusting your filters or search terms</p>
            </div>
          ) : filtered.map((log, i) => {
            const logType = (log.entity || '').toLowerCase();
            const Icon = TYPE_ICON[logType] || Activity;
            const colorCls = TYPE_COLOR[logType] || 'bg-muted/80 text-text/70 ring-1 ring-border/50';
            const logDetail = log.description || log.entity;
            const logUser = log.user ? `${log.user.name} (${log.user.role})` : 'System';
            
            return (
              <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-muted/25 transition-colors animate-fade-in group" style={{ animationDelay: `${i * 30}ms` }}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm transition-transform group-hover:scale-105 ${colorCls}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-text text-sm group-hover:text-primary transition-colors">{log.action}</p>
                      <p className="text-xs text-text/70 mt-0.5 leading-relaxed">{logDetail}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-[11px] font-medium text-text/55 block">{formatTimestamp(log.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-text/50 uppercase tracking-wider">Initiated by</span>
                    <span className="text-[11px] font-semibold text-text bg-muted/90 border border-border px-2 py-0.5 rounded-md">{logUser}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
