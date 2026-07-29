import { Activity, FileText, Hash, Award, CheckCircle, Clock, AlertCircle, ArrowRight, MessageSquare, ShieldCheck, BookOpen, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/ui/Toast';

const APP_STATUS = 'Under Review'; // Draft | Submitted | Under Review | Need Correction | Approved | Confirmed

const BANNER = {
  Draft:            { color: 'bg-muted/40 border-border',     icon: FileText,    title: 'Incomplete Application', desc: 'You have a saved draft. Complete your Phase-I application.', action: 'Complete Phase-I', href: '/student/application' },
  Submitted:        { color: 'bg-primary/5 border-primary/20', icon: Clock,       title: 'Application Submitted', desc: 'Your application is queued for review by the admin.', action: 'View Progress', href: '/student' },
  'Under Review':   { color: 'bg-primary/5 border-primary/20', icon: Clock,       title: 'Under Review', desc: 'Your Phase-I application is being reviewed. You will be notified of the decision.', action: null },
  'Need Correction':{ color: 'bg-warning/5 border-warning/30', icon: AlertCircle, title: 'Correction Required', desc: 'Admin has requested changes to your Phase-I application.', action: 'Edit Application', href: '/student/application' },
  Approved:         { color: 'bg-success/5 border-success/30', icon: CheckCircle, title: 'Phase-I Approved!', desc: 'Congratulations! Proceed to Phase-II documentation to confirm your admission.', action: 'Start Phase-II', href: '/student/documents' },
  Confirmed:        { color: 'bg-primary/10 border-primary/25', icon: CheckCircle, title: 'Admission Confirmed!', desc: 'Your admission to George College is complete. Welcome!', action: null },
};

const STEPS = [
  { id: 1, name: 'Registration' },
  { id: 2, name: 'Phase-I Form' },
  { id: 3, name: 'Phase-I Review' },
  { id: 4, name: 'Phase-I Approved' },
  { id: 5, name: 'Phase-II Form' },
  { id: 6, name: 'Admission Confirmed' },
];

const getProgressStep = (status, phase) => {
  if (phase === 2) {
    if (status === 'COMPLETED') return 6;
    return 5;
  }
  
  const map = {
    'DRAFT': 2,
    'SUBMITTED': 3,
    'UNDER_REVIEW': 3,
    'NEEDS_CORRECTION': 2,
    'APPROVED': 4,
  };
  return map[status] || 2;
};



const GUIDELINES = [
  'Ensure all personal details match your official academic documents.',
  'Upload clear, scanned copies of your original documents. Max size 2MB per file.',
  'Phase-I must be approved before you can upload Phase-II documents.',
  'Keep your Application ID handy for any communication with the admin office.',
  'Contact support immediately if you notice any discrepancies in your application.'
];

export function StudentDashboard() {
  const { user } = useAuthStore();
  const [appData, setAppData] = useState(null);
  const [loading, setLoading] = useState(true);
  const showToast = useToast();

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await api.get('/application/me');
        if (res.data.success && res.data.data) {
          setAppData(res.data.data);
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          showToast('Failed to load application data', 'error');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [showToast]);

  // Map backend status to frontend display labels if needed
  const statusMapping = {
    'DRAFT': 'Draft',
    'SUBMITTED': 'Submitted',
    'UNDER_REVIEW': 'Under Review',
    'NEED_CORRECTION': 'Need Correction',
    'APPROVED': 'Approved',
    'CONFIRMED': 'Confirmed'
  };

  const appStatus = appData ? statusMapping[appData.status] || 'Draft' : 'Draft';
  const appId = appData?.id || 'Not started';

  const banner    = BANNER[appStatus] || BANNER['Draft'];
  const BIcon     = banner.icon;
  const curStep   = getProgressStep(appData?.status, appData?.phase || 1);
  const pct       = ((curStep - 1) / (STEPS.length - 1)) * 100;

  const stats = [
    { name: 'Application Status', value: appStatus,       icon: Activity,  color: 'text-primary',    bg: 'bg-primary/10' },
    { name: 'Docs Uploaded',      value: appData?.documents?.length ? `${appData.documents.length} Docs` : '0 Docs',          icon: FileText,  color: 'text-secondary',  bg: 'bg-secondary/10' },
    { name: 'Application ID',     value: appId,       icon: Hash,      color: 'text-purple-400', bg: 'bg-purple-500/15' },
    { name: 'Next Deadline',   value: '2026-05-31',        icon: Clock,     color: 'text-warning',    bg: 'bg-warning/10' },
  ];

  const generateUpdates = () => {
    if (!appData) return [];
    const updates = [];
    
    if (appData.submittedAt) {
      updates.push({
        id: 'submitted',
        title: 'Application has been submitted successfully.',
        date: new Date(appData.submittedAt).toLocaleString(),
        icon: CheckCircle,
        color: 'text-success',
        bg: 'bg-success/10'
      });
    } else if (appData.createdAt) {
      updates.push({
        id: 'draft',
        title: 'Phase 1 Registration initialized.',
        date: new Date(appData.createdAt).toLocaleString(),
        icon: Clock,
        color: 'text-secondary',
        bg: 'bg-secondary/10'
      });
    }

    if (appData.status === 'UNDER_REVIEW') {
      updates.push({
        id: 'review',
        title: 'Your application is under review.',
        date: new Date(appData.updatedAt).toLocaleString(),
        icon: MessageSquare,
        color: 'text-primary',
        bg: 'bg-primary/10'
      });
    } else if (appData.status === 'NEEDS_CORRECTION') {
      updates.push({
        id: 'correction',
        title: 'Admin requested correction for your application.',
        date: new Date(appData.updatedAt).toLocaleString(),
        icon: AlertCircle,
        color: 'text-warning',
        bg: 'bg-warning/10'
      });
    } else if (appData.status === 'APPROVED' || appData.status === 'COMPLETED') {
      updates.push({
        id: 'approved',
        title: 'Phase-I Application Approved!',
        date: new Date(appData.updatedAt).toLocaleString(),
        icon: CheckCircle,
        color: 'text-success',
        bg: 'bg-success/10'
      });
    } else if (appData.status === 'REJECTED') {
      updates.push({
        id: 'rejected',
        title: 'Your application has been rejected.',
        date: new Date(appData.updatedAt).toLocaleString(),
        icon: AlertCircle,
        color: 'text-danger',
        bg: 'bg-danger/10'
      });
    }
    
    if (appData.documents && appData.documents.length > 0) {
      const rejectedDocs = appData.documents.filter(d => d.status === 'REJECTED');
      if (rejectedDocs.length > 0) {
        updates.push({
          id: 'docs-rejected',
          title: `${rejectedDocs.length} document(s) rejected.`,
          date: new Date(rejectedDocs[0].updatedAt).toLocaleString(),
          icon: AlertCircle,
          color: 'text-danger',
          bg: 'bg-danger/10'
        });
      }
      const verifiedDocs = appData.documents.filter(d => d.status === 'VERIFIED');
      if (verifiedDocs.length > 0) {
         updates.push({
          id: 'docs-verified',
          title: `${verifiedDocs.length} document(s) verified successfully.`,
          date: new Date(verifiedDocs[verifiedDocs.length-1].updatedAt).toLocaleString(),
          icon: ShieldCheck,
          color: 'text-success',
          bg: 'bg-success/10'
        });
      }
    }
    
    return updates.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const dynamicUpdates = generateUpdates();

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text">Welcome, {user?.name || 'Student'} 👋</h1>
        <p className="text-text/60 mt-1 text-sm">Track your admission progress below.</p>
      </div>

      {/* Status Banner */}
      <div className={`rounded-xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4 animate-fade-in-up delay-50 ${banner.color}`}>
        <div className="flex items-start gap-4 flex-1">
          <div className="p-2.5 rounded-xl bg-card/90 border border-border/60 shadow-sm flex-shrink-0">
            <BIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-text text-sm">{banner.title}</h3>
            <p className="text-xs text-text/65 mt-0.5">{banner.desc}</p>
          </div>
        </div>
        {banner.action && (
          <Link to={banner.href} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm whitespace-nowrap flex-shrink-0">
            {banner.action} <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, i) => (
          <div key={s.name} className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-start gap-4 animate-fade-in-up" style={{ animationDelay: `${100 + i * 60}ms` }}>
            <div className={`p-3 rounded-xl ${s.bg} ${s.color} flex-shrink-0`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-text/55 mb-1">{s.name}</p>
              <p className="text-base font-bold text-text">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Stepper */}
      <div className="bg-card border border-border rounded-xl p-6 lg:p-8 shadow-sm animate-fade-in-up delay-300">
        <h2 className="text-base font-bold text-text mb-6">Admission Progress</h2>
        <div className="relative">
          <div className="absolute top-5 left-0 right-0 h-1 bg-muted rounded-full" />
          <div className="absolute top-5 left-0 h-1 bg-primary rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }} />
          <div className="relative flex justify-between">
            {STEPS.map(s => {
              const done = s.id < curStep;
              const cur  = s.id === curStep;
              return (
                <div key={s.id} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-card z-10 relative transition-all ${done ? 'bg-success text-white' : cur ? 'bg-primary text-white' : 'bg-muted text-text/50'}`}>
                    {done ? <CheckCircle className="w-5 h-5" /> : <span className="text-xs font-bold">{s.id}</span>}
                  </div>
                  <span className={`mt-2 text-xs font-semibold whitespace-nowrap ${cur ? 'text-primary' : done ? 'text-text' : 'text-text/55'}`}>
                    {s.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Updates & Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up delay-500">
        
        {/* Latest Updates Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col">
          <h2 className="text-base font-bold text-text mb-4">Latest Updates</h2>
          <div className="flex-1 space-y-0">
            {dynamicUpdates.length > 0 ? dynamicUpdates.map((update, idx) => (
              <div key={update.id} className={`py-4 flex gap-4 ${idx !== dynamicUpdates.length - 1 ? 'border-b border-border' : ''}`}>
                <div className={`p-2.5 rounded-xl ${update.bg} flex-shrink-0 h-fit`}>
                  <update.icon className={`w-5 h-5 ${update.color}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text">{update.title}</p>
                  <p className="text-xs text-text/55 mt-1">Updated on {update.date}</p>
                </div>
              </div>
            )) : (
              <div className="py-8 text-center text-text/50 text-sm">
                No recent updates.
              </div>
            )}
          </div>
          <Link to="#" className="mt-4 pt-4 border-t border-border inline-flex items-center gap-1 text-primary text-sm font-semibold hover:text-primary/80 transition-colors">
            View All Updates <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Guidelines Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-secondary" />
            <h2 className="text-base font-bold text-text">Application Guidelines</h2>
          </div>
          <div className="bg-secondary/5 rounded-xl p-5 border border-secondary/10 flex-1">
            <ul className="space-y-4">
              {GUIDELINES.map((guide, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-gray-600 leading-relaxed">
                  <div className="mt-0.5 flex-shrink-0">
                    <Info className="w-4 h-4 text-secondary/70" />
                  </div>
                  <span>{guide}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
