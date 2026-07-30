import { useState, useEffect } from 'react';
import { Check, ChevronRight, Upload, File, Send, AlertCircle, Lock, CheckCircle, RefreshCcw, Clock } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';

// ── Phase-II is locked unless Phase-I is approved ──
const PHASE1_APPROVED = true;

const STEPS = [
  { id: 1, name: 'Personal Info' },
  { id: 2, name: 'Guardian & Contact' },
  { id: 3, name: 'Educational' },
  { id: 4, name: 'Uploads' },
  { id: 5, name: 'Review' },
];

const inputCls  = 'w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm bg-card text-text placeholder:text-text/45';
const selectCls = inputCls + ' cursor-pointer';

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-text mb-1.5">
        {label}{required && <span className="text-danger ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

import { useRef } from 'react';

function FileUploadCard({ label, hint, required, uploaded, onUpload, isUploading }) {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUpload(file);
      e.target.value = null; // reset
    }
  };

  return (
    <div className={`border rounded-xl p-4 transition-all ${uploaded ? 'border-success/40 bg-success/5' : 'border-border bg-card'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${uploaded ? 'bg-success/10' : 'bg-muted'}`}>
            <File className={`w-4 h-4 ${uploaded ? 'text-success' : 'text-text/45'}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-text">{label}</p>
            {required && <span className="text-xs text-danger">Required</span>}
            {!required && <span className="text-xs text-text/45">Optional</span>}
          </div>
        </div>
        {uploaded && <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />}
      </div>
      <p className="text-xs text-text/50 mb-3">{hint}</p>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept={hint.includes('image') ? 'image/*' : '.pdf'} 
      />

      {!uploaded ? (
        <button type="button" onClick={handleClick} disabled={isUploading}
          className={`w-full py-2.5 border-2 border-dashed border-border rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all text-sm text-text/55 font-medium flex items-center justify-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <Upload className="w-4 h-4" /> {isUploading ? 'Uploading...' : 'Click to Upload'}
        </button>
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-xs text-success font-semibold">Uploaded ✓</span>
          <button type="button" onClick={handleClick} disabled={isUploading}
            className={`flex items-center gap-1 text-xs text-text/45 hover:text-text transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <RefreshCcw className="w-3 h-3" /> {isUploading ? 'Uploading...' : 'Replace'}
          </button>
        </div>
      )}
    </div>
  );
}

export function StudentDocuments() {
  const [step, setStep] = useState(1);
  const [confirmed, setConfirmed] = useState(false);
  const [appStatus, setAppStatus] = useState(null);
  const [appPhase, setAppPhase] = useState(1);
  const [phase2Enabled, setPhase2Enabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { user } = useAuthStore();

  const [form, setForm] = useState({
    // Step 1 – Student's Additional Information
    studentName: '', fatherName: '', motherName: '', dob: '',
    category: '', sex: '', bloodGroup: '', religion: '',
    
    // Step 2 – Guardian & Contact Details
    guardianName: '', guardianAddress: '', guardianContact: '', guardianRelation: '',
    studentAddress: '', alternativeMobile: '', domicileType: '',
    state: '', district: '', pin: '',
    
    // Step 3 – Educational Details
    examType: '', examName: '', passingYear: '', regNo: '', board: '',
    marksObtained: '', marks12th: '', classDivision: '', dgpaCgpa: '',
  });

  const [uploads, setUploads] = useState({
    finalMarksheet: false,
    photo: false,
    signature: false,
    dobProof: false,
    antiRagging: false,
    domicileDoc: false,
  });

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const [uploadingState, setUploadingState] = useState({});

  const upload = key => async (file) => {
    setUploadingState(u => ({ ...u, [key]: true }));
    try {
      const UPLOAD_TYPES = {
          photo: "PHOTO",
          signature: "SIGNATURE",
          dobProof: "DOB_PROOF",
          antiRagging: "ANTI_RAGGING_DECLARATION",
          domicileDoc: "DOMICILE_DOCUMENT",
          finalMarksheet: "FINAL_MARKSHEET"
      };

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', UPLOAD_TYPES[key]);

      const res = await api.post('/document/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        setUploads(u => ({ ...u, [key]: true }));
        toast && toast('File uploaded successfully.', 'success');
      }
    } catch (err) {
      toast && toast(err.response?.data?.message || 'Failed to upload file', 'error');
    } finally {
      setUploadingState(u => ({ ...u, [key]: false }));
    }
  };



  useEffect(() => {
    const loadData = async () => {
      try {
        const [appRes, phaseRes] = await Promise.all([
          api.get('/application/me'),
          api.get(`/phase/status?t=${Date.now()}`),
        ]);
        
        if (appRes.data.success && appRes.data.data) {
          const app = appRes.data.data;
          setAppStatus(app.status);
          setAppPhase(app.phase);
          
          // Try to pre-fill from phase2 or fallback to phase1
          const phase1 = app.formData?.phase1 || {};
          const phase2 = app.formData?.phase2 || {};
          
          const p1_p = phase1.personalInformation || {};
          const p2_p = phase2.personalInformation || {};
          const p1_g = phase1.guardianDetails || {};
          const p2_g = phase2.guardianDetails || {};
          const p1_c = phase1.contactDetails || {};
          const p2_c = phase2.contactDetails || {};
          const p1_e = phase1.educationalBackground || {};
          const p2_e = phase2.educationalDetails || {};

          setForm(prev => ({
            ...prev,
            studentName: p2_p.studentName || p1_p.studentName || prev.studentName,
            fatherName: p2_p.fatherName || p1_p.fatherName || prev.fatherName,
            motherName: p2_p.motherName || p1_p.motherName || prev.motherName,
            dob: p2_p.dob || p1_p.dob || prev.dob,
            category: p2_p.category || p1_p.category || prev.category,
            sex: p2_p.sex || p1_p.sex || prev.sex,
            bloodGroup: p2_p.bloodGroup || p1_p.bloodGroup || prev.bloodGroup,
            religion: p2_p.religion || p1_p.religion || prev.religion,
            
            guardianName: p2_g.guardianName || p1_g.name || prev.guardianName,
            guardianRelation: p2_g.relationWithStudent || p1_g.relation || prev.guardianRelation,
            guardianContact: p2_g.contactNo || p1_g.contact || prev.guardianContact,
            guardianAddress: p2_g.guardianAddress || prev.guardianAddress, // Not in phase 1 usually
            
            studentAddress: p2_c.studentAddress || p1_c.address || prev.studentAddress,
            alternativeMobile: p1_c.altMobile || prev.alternativeMobile,
            domicileType: p2_c.domicileType || p1_c.domicile || prev.domicileType,
            state: p2_c.state || p1_c.state || prev.state,
            district: p2_c.district || p1_c.district || prev.district,
            pin: p2_c.pinCode || p1_c.pin || prev.pin,
            
            examType: p2_e.examinationType || p1_e.examType || prev.examType,
            examName: p2_e.examinationName || p1_e.examName || prev.examName,
            passingYear: p2_e.passingYear || p1_e.passingYear || prev.passingYear,
            regNo: p2_e.registrationNo || prev.regNo,
            board: p2_e.boardCouncil || p1_e.board || prev.board,
            marksObtained: p2_e.marksObtained || p1_e.marksObtained || prev.marksObtained,
            classDivision: p2_e.division || p1_e.classDivision || prev.classDivision,
            dgpaCgpa: p2_e.dgpaCgpa || p1_e.dgpaCgpa || prev.dgpaCgpa,
          }));

          const docs = app.documents || [];
          const currentUploads = { ...uploads };
          const UPLOAD_TYPES_REV = {
            "PHOTO": "photo",
            "SIGNATURE": "signature",
            "DOB_PROOF": "dobProof",
            "ANTI_RAGGING_DECLARATION": "antiRagging",
            "DOMICILE_DOCUMENT": "domicileDoc",
            "FINAL_MARKSHEET": "finalMarksheet"
          };
          docs.forEach(d => {
             const k = UPLOAD_TYPES_REV[d.type];
             if (k) currentUploads[k] = true;
          });
          setUploads(currentUploads);
        }
        
        if (phaseRes.data.success) {
          setPhase2Enabled(phaseRes.data.data.phase2Enabled);
        }
      } catch (err) {
        console.error("Failed to load data for Phase-II");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleNext = e => { e.preventDefault(); setStep(s => Math.min(s + 1, 5)); window.scrollTo(0, 0); };
  const handleBack = () => { setStep(s => Math.max(s - 1, 1)); window.scrollTo(0, 0); };

  const requiredUploads = ['finalMarksheet', 'photo', 'signature', 'dobProof', 'antiRagging', 'domicileDoc'];
  const allRequiredUploaded = requiredUploads.every(k => uploads[k]);

  const handleConfirm = async () => {
    if (!allRequiredUploaded) {
      toast && toast('Please upload all required documents before confirming.', 'warning');
      return;
    }
    
    try {
      const payload = {
        phase2: {
          personalInformation: {
            studentName: form.studentName,
            fatherName: form.fatherName,
            motherName: form.motherName,
            dob: form.dob,
            sex: form.sex,
            category: form.category,
            religion: form.religion,
            bloodGroup: form.bloodGroup,
          },
          guardianDetails: {
            guardianName: form.guardianName,
            relationWithStudent: form.guardianRelation,
            contactNo: form.guardianContact,
            guardianAddress: form.guardianAddress,
          },
          contactDetails: {
            studentAddress: form.studentAddress,
            state: form.state,
            district: form.district,
            pinCode: form.pin,
            domicileType: form.domicileType,
          },
          educationalDetails: {
            examinationType: form.examType,
            examinationName: form.examName,
            boardCouncil: form.board,
            registrationNo: form.regNo,
            passingYear: form.passingYear,
            marksObtained: form.marksObtained,
            division: form.classDivision,
          },
          identityCitizenship: {
            nationality: "Indian",
            country: "India",
          }
        }
      };
      
      const saveRes = await api.patch('/phase2/save-draft', payload);
      if (saveRes.data.success) {
        const submitRes = await api.post('/phase2/submit');
        if (submitRes.data.success) {
          setConfirmed(true);
          toast && toast('Phase-II submitted! Admission confirmed.', 'success', 'Confirmed 🎉');
        }
      }
    } catch (err) {
      console.error(err.response?.data);
      const msg = err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Failed to submit Phase-II';
      toast && toast(msg, 'error');
    }
  };

  // ── Locked State ──
  if (loading) {
    return <div className="text-center mt-20 text-text/50">Loading...</div>;
  }

  const phase1Approved = appPhase >= 2;

  if (!phase1Approved) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
          <Lock className="w-9 h-9 text-text/45" />
        </div>
        <h2 className="text-xl font-bold text-text mb-2">Phase-II Locked</h2>
        <p className="text-text/60 text-sm max-w-xs mx-auto">Phase-II documentation is only available after your Phase-I application is approved by the college admin.</p>
      </div>
    );
  }

  if (!phase2Enabled) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
          <Lock className="w-9 h-9 text-text/45" />
        </div>
        <h2 className="text-xl font-bold text-text mb-2">Phase-II Currently Closed</h2>
        <p className="text-text/60 text-sm max-w-xs mx-auto">The college administration has not yet activated Phase-II documentation.</p>
      </div>
    );
  }

  // ── Confirmed State ──
  if (confirmed || (appPhase === 2 && appStatus === 'COMPLETED')) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center animate-scale-in">
        <div className="w-20 h-20 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-10 h-10 text-success" />
        </div>
        <h2 className="text-2xl font-bold text-text mb-2">Admission Confirmed! 🎉</h2>
        <p className="text-text/60 text-sm">Welcome to <span className="font-semibold text-text">{user?.college?.name || 'Your College'}</span>. Your Phase-II documentation is complete.</p>
        <div className="mt-6 p-5 bg-success/5 border border-success/20 rounded-2xl text-sm text-success font-medium">
          Check your registered email for the admission letter and further instructions.
        </div>
      </div>
    );
  }

  // ── Under Review State ──
  if (appPhase === 2 && appStatus === 'SUBMITTED') {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center animate-scale-in">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <Clock className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-text mb-2">Phase-II Under Review</h2>
        <p className="text-text/60 text-sm">Your Phase-II documentation has been submitted and is currently being reviewed by the college administration.</p>
        <div className="mt-6 p-5 bg-primary/5 border border-primary/20 rounded-2xl text-sm text-primary font-medium">
          You will be notified once the review is complete.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-semibold border border-success/20 mb-3">
          <Check className="w-3.5 h-3.5" /> Phase-I Approved — Proceed to Phase-II
        </div>
        <h1 className="text-2xl font-bold text-text">Phase-II Documentation</h1>
        <p className="text-text/60 mt-1 text-sm">Submit your final documents and academic details to confirm your admission.</p>
      </div>

      {/* Stepper */}
      <div className="bg-card border border-border p-4 rounded-xl shadow-sm overflow-x-auto">
        <div className="flex items-center min-w-max gap-1 px-1">
          {STEPS.map((s, i) => {
            const done    = step > s.id;
            const current = step === s.id;
            return (
              <div key={s.id} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all border border-transparent ${done ? 'bg-success text-white border-success/30' : current ? 'bg-primary text-white border-primary/30' : 'bg-muted text-text/55 border-border/50'}`}>
                    {done ? <Check className="w-4 h-4" /> : s.id}
                  </div>
                  <span className={`text-sm font-semibold whitespace-nowrap ${current ? 'text-primary' : done ? 'text-text' : 'text-text/55'}`}>
                    {s.name}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <ChevronRight className={`w-5 h-5 mx-3 flex-shrink-0 ${done ? 'text-success' : 'text-text/25'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-card border border-border rounded-xl p-6 lg:p-8 shadow-sm animate-scale-in">
        <form onSubmit={handleNext}>

          {/* ── Step 1: Student's Additional Information ── */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-text border-b border-border pb-3">Student's Additional Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Student Name" required>
                  <input className={inputCls} value={form.studentName} onChange={set('studentName')} placeholder="Full Name" />
                </Field>
                <Field label="Father's Name" required>
                  <input className={inputCls} value={form.fatherName} onChange={set('fatherName')} placeholder="Father's Full Name" />
                </Field>
                <Field label="Mother's Name" required>
                  <input className={inputCls} value={form.motherName} onChange={set('motherName')} placeholder="Mother's Full Name" />
                </Field>
                <Field label="Date of Birth" required>
                  <input type="date" className={inputCls} value={form.dob} onChange={set('dob')} />
                </Field>
                <Field label="Category" required>
                  <select className={selectCls} value={form.category} onChange={set('category')}>
                    <option value="">Select Category</option>
                    <option>General</option><option>SC</option><option>ST</option><option>OBC-A</option><option>OBC-B</option>
                  </select>
                </Field>
                <Field label="Sex" required>
                  <select className={selectCls} value={form.sex} onChange={set('sex')}>
                    <option value="">Select Sex</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </Field>
                <Field label="Blood Group" required>
                  <select className={selectCls} value={form.bloodGroup} onChange={set('bloodGroup')}>
                    <option value="">Select Blood Group</option>
                    <option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                  </select>
                </Field>
                <Field label="Religion" required>
                  <input className={inputCls} value={form.religion} onChange={set('religion')} placeholder="e.g. Hinduism, Islam" />
                </Field>
              </div>
            </div>
          )}

          {/* ── Step 2: Guardian & Contact Details ── */}
          {step === 2 && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-lg font-bold text-text border-b border-border pb-3 mb-5">Guardian's Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Guardian Name" required>
                    <input className={inputCls} value={form.guardianName} onChange={set('guardianName')} placeholder="Full Name" />
                  </Field>
                  <Field label="Relation with Student" required>
                    <input className={inputCls} value={form.guardianRelation} onChange={set('guardianRelation')} placeholder="e.g. Father, Mother" />
                  </Field>
                  <Field label="Contact No" required>
                    <input className={inputCls} value={form.guardianContact} onChange={set('guardianContact')} placeholder="10-digit Mobile No" />
                  </Field>
                  <Field label="Guardian Address" required>
                    <textarea className={inputCls + ' h-24 resize-none'} value={form.guardianAddress} onChange={set('guardianAddress')} placeholder="Full Address" />
                  </Field>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-text border-b border-border pb-3 mb-5">Student's Contact Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Student Address" required>
                    <textarea className={inputCls + ' h-24 resize-none'} value={form.studentAddress} onChange={set('studentAddress')} placeholder="Full Permanent Address" />
                  </Field>
                  <Field label="Alternative Mobile" required>
                    <input className={inputCls} value={form.alternativeMobile} onChange={set('alternativeMobile')} placeholder="Alternative Contact No" />
                  </Field>
                  <Field label="Domicile Type" required>
                    <select className={selectCls} value={form.domicileType} onChange={set('domicileType')}>
                      <option value="">Select Type</option>
                      <option>West Bengal</option><option>Other State</option>
                    </select>
                  </Field>
                  <Field label="State" required>
                    <input className={inputCls} value={form.state} onChange={set('state')} placeholder="e.g. West Bengal" />
                  </Field>
                  <Field label="District" required>
                    <input className={inputCls} value={form.district} onChange={set('district')} placeholder="Enter District" />
                  </Field>
                  <Field label="PIN Code" required>
                    <input className={inputCls} value={form.pin} onChange={set('pin')} placeholder="6-digit PIN" maxLength={6} />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Educational Details ── */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-text border-b border-border pb-3">Educational Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Examination Type" required>
                  <select className={selectCls} value={form.examType} onChange={set('examType')}>
                    <option value="">Select Type</option>
                    <option>Regular</option><option>Distance</option><option>Vocational</option>
                  </select>
                </Field>
                <Field label="Examination Name" required>
                  <input className={inputCls} value={form.examName} onChange={set('examName')} placeholder="e.g. Higher Secondary" />
                </Field>
                <Field label="Passing Year" required>
                  <input className={inputCls} value={form.passingYear} onChange={set('passingYear')} placeholder="YYYY" maxLength={4} />
                </Field>
                <Field label="Registration No." required>
                  <input className={inputCls} value={form.regNo} onChange={set('regNo')} placeholder="Enter Registration No" />
                </Field>
                <Field label="Board / Council" required>
                  <input className={inputCls} value={form.board} onChange={set('board')} placeholder="e.g. WBCHSE, CBSE" />
                </Field>
                <Field label="Marks Obtained" required>
                  <input className={inputCls} value={form.marksObtained} onChange={set('marksObtained')} placeholder="Total Marks" />
                </Field>
                <Field label="Marks Entry of 12th" required>
                  <input className={inputCls} value={form.marks12th} onChange={set('marks12th')} placeholder="e.g. 450/500" />
                </Field>
                <Field label="Class / Division" required>
                  <select className={selectCls} value={form.classDivision} onChange={set('classDivision')}>
                    <option value="">Select Division</option>
                    <option>1st Division</option><option>2nd Division</option><option>3rd Division</option>
                  </select>
                </Field>
                <Field label="DGPA / CGPA" required>
                  <input className={inputCls} value={form.dgpaCgpa} onChange={set('dgpaCgpa')} placeholder="e.g. 8.5" />
                </Field>
              </div>
            </div>
          )}

          {/* ── Step 4: Documents Upload ── */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-text border-b border-border pb-3">Documents Upload</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FileUploadCard 
                  label="Photo of Student" 
                  hint="Supported file: image. Max 1 MB." 
                  required 
                  uploaded={uploads.photo} 
                  isUploading={uploadingState.photo}
                  onUpload={upload('photo')} 
                />
                <FileUploadCard 
                  label="Signature of Student" 
                  hint="Supported file: image. Max 1 MB." 
                  required 
                  uploaded={uploads.signature} 
                  isUploading={uploadingState.signature}
                  onUpload={upload('signature')} 
                />
                <FileUploadCard 
                  label="DOB Proof" 
                  hint="Supported file: PDF. Max 1 MB." 
                  required 
                  uploaded={uploads.dobProof} 
                  isUploading={uploadingState.dobProof}
                  onUpload={upload('dobProof')} 
                />
                <FileUploadCard 
                  label="Anti Ragging Declaration" 
                  hint="FORMS TO BE DOWNLOADED FROM antiragging.in. PDF. Max 1 MB." 
                  required 
                  uploaded={uploads.antiRagging} 
                  isUploading={uploadingState.antiRagging}
                  onUpload={upload('antiRagging')} 
                />
                <FileUploadCard 
                  label="Domicile Document" 
                  hint="Supported file: PDF. Max 1 MB." 
                  required 
                  uploaded={uploads.domicileDoc} 
                  isUploading={uploadingState.domicileDoc}
                  onUpload={upload('domicileDoc')} 
                />
                <FileUploadCard 
                  label="Upload Certificate/Final Marksheet" 
                  hint="Supported file: PDF. Max 1 MB." 
                  required 
                  uploaded={uploads.finalMarksheet} 
                  isUploading={uploadingState.finalMarksheet}
                  onUpload={upload('finalMarksheet')} 
                />
              </div>
            </div>
          )}

          {/* ── Step 5: Review & Confirm ── */}
          {step === 5 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-text border-b border-border pb-3">Review & Confirm</h2>

              <div className="bg-warning/5 border border-warning/20 rounded-xl p-4 flex gap-3 text-sm">
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <p className="text-text/70">Please review all your information carefully. Clicking <strong>Confirm Admission</strong> will complete your Phase-II submission.</p>
              </div>

              {/* Personal Info Review */}
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="bg-muted/60 px-5 py-3 border-b border-border">
                  <h3 className="font-semibold text-text text-sm">Personal Information</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 p-5">
                  {[
                    ['Student Name', form.studentName], ['Father\'s Name', form.fatherName], ['Mother\'s Name', form.motherName],
                    ['DOB', form.dob], ['Category', form.category], ['Sex', form.sex],
                    ['Blood Group', form.bloodGroup], ['Religion', form.religion],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="text-xs text-text/50 mb-0.5">{label}</p>
                      <p className="text-sm font-semibold text-text">{val || <span className="text-text/35 font-normal">—</span>}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Educational Review */}
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="bg-muted/60 px-5 py-3 border-b border-border">
                  <h3 className="font-semibold text-text text-sm">Educational Details</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 p-5">
                  {[
                    ['Exam Type', form.examType], ['Exam Name', form.examName], ['Passing Year', form.passingYear],
                    ['Reg No', form.regNo], ['Board', form.board], ['Marks Obtained', form.marksObtained],
                    ['12th Marks', form.marks12th], ['Division', form.classDivision], ['DGPA/CGPA', form.dgpaCgpa],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="text-xs text-text/50 mb-0.5">{label}</p>
                      <p className="text-sm font-semibold text-text">{val || <span className="text-text/35 font-normal">—</span>}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents status */}
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="bg-muted/60 px-5 py-3 border-b border-border">
                  <h3 className="font-semibold text-text text-sm">Document Status</h3>
                </div>
                <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    ['Final Marksheet', uploads.finalMarksheet],
                    ['Photo', uploads.photo],
                    ['Signature', uploads.signature],
                    ['DOB Proof', uploads.dobProof],
                    ['Anti Ragging', uploads.antiRagging],
                    ['Domicile Doc', uploads.domicileDoc],
                  ].map(([label, done]) => (
                    <div key={label} className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium ${done ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                      {done ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                      <span className="truncate">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {!allRequiredUploaded && (
                <div className="bg-danger/5 border border-danger/20 rounded-xl p-4 text-sm text-danger font-medium flex gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  Please complete all required document uploads before confirming.
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-7 mt-6 border-t border-border gap-3">
            <button type="button" onClick={handleBack}
              disabled={step === 1}
              className="px-6 py-2.5 rounded-xl border border-border text-sm font-semibold text-text hover:bg-muted/50 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2">
              Back
            </button>
            
            {step < 5 ? (
              <button type="submit"
                className="px-8 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="button" onClick={handleConfirm}
                className="px-8 py-2.5 rounded-xl bg-success text-white text-sm font-bold hover:bg-success-dark shadow-lg shadow-success/20 transition-all flex items-center gap-2">
                Confirm Admission <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
