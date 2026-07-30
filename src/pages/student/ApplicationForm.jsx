import { useState } from 'react';
import { Check, ChevronRight, Save, Send } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import api from '../../api/axios';
import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';

const STEPS = [
  { id: 1, name: 'Admission Details' },
  { id: 2, name: 'Personal Information' },
  { id: 3, name: 'Identity & Citizenship' },
  { id: 4, name: 'Review & Submit' },
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

const COURSES = ['BBA','BCA','BBA (HM)','B.SC(MLT)','BTTM','BSM','BMS','BMAGD','VFX',
  'B.VOC(MLT)','B.VOC(AST)','B.VOC(EMS)','B.VOC(HWN)','B.VOC(ID)'];

export function ApplicationForm() {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const { user } = useAuthStore();

  const [appStatus, setAppStatus] = useState(null);

  const [form, setForm] = useState({
    session: '', district: '', college: '', courseUnderBy: '',
    admissionType: '', admissionCategory: '', entranceTest: '',
    course: '', stream: '', entranceRoll: '', entranceRank: '',
    studentName: '', sex: '', dob: '', mobile: '', email: '',
    fatherName: '', motherName: '',
    residentialStatus: '', country: '', nationality: '', abcId: '', aadhaar: '',
  });

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleNext = e => { e.preventDefault(); setStep(s => Math.min(s + 1, 4)); window.scrollTo(0, 0); };
  const handleBack = () => { setStep(s => Math.max(s - 1, 1)); window.scrollTo(0, 0); };

  const formatPayload = () => ({
    phase1: {
      admissionDetails: {
        session: form.session, collegeDistrict: form.district, collegeName: form.college,
        courseUnderBy: form.courseUnderBy, admissionType: form.admissionType,
        admissionCategory: form.admissionCategory, entranceTest: form.entranceTest,
        course: form.course, stream: form.stream, entranceRollNo: form.entranceRoll,
        entranceRank: form.entranceRank,
      },
      personalInformation: {
        studentName: form.studentName, sex: form.sex, dob: form.dob,
        mobile: form.mobile, email: form.email, fatherName: form.fatherName,
        motherName: form.motherName,
      },
      identityCitizenship: {
        residentialStatus: form.residentialStatus, country: form.country,
        nationality: form.nationality, abcId: form.abcId, aadhaarNumber: form.aadhaar,
      }
    }
  });

  const handleDraft = async () => {
    setSaving(true);
    try {
      await api.patch('/application/save-draft', formatPayload());
      toast && toast('Draft saved successfully!', 'success', 'Saved');
    } catch (err) {
      const specificError = err.response?.data?.errors?.[0];
      toast && toast(specificError || err.response?.data?.message || 'Failed to save draft', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await api.patch('/application/save-draft', formatPayload());
      await api.post('/application/submit');
      toast && toast('Phase-I application submitted successfully!', 'success', 'Submitted');
      // Optionally redirect or update local state
    } catch (err) {
      const specificError = err.response?.data?.errors?.[0];
      toast && toast(specificError || err.response?.data?.message || 'Failed to submit', 'error');
    }
  };

  // Load existing draft if any
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const res = await api.get('/application/me');
        if (res.data.success && res.data.data) {
          setAppStatus(res.data.data.status);
          if (res.data.data.formData?.phase1) {
            const { admissionDetails, personalInformation, identityCitizenship } = res.data.data.formData.phase1;
            setForm(f => ({
              ...f,
            ...personalInformation,
            session: admissionDetails?.session || '',
            district: admissionDetails?.collegeDistrict || '',
            college: admissionDetails?.collegeName || '',
            courseUnderBy: admissionDetails?.courseUnderBy || '',
            admissionType: admissionDetails?.admissionType || '',
            admissionCategory: admissionDetails?.admissionCategory || '',
            entranceTest: admissionDetails?.entranceTest || '',
            course: admissionDetails?.course || '',
            stream: admissionDetails?.stream || '',
            entranceRoll: admissionDetails?.entranceRollNo || '',
            entranceRank: admissionDetails?.entranceRank || '',
            residentialStatus: identityCitizenship?.residentialStatus || '',
            country: identityCitizenship?.country || '',
            nationality: identityCitizenship?.nationality || '',
            abcId: identityCitizenship?.abcId || '',
            aadhaar: identityCitizenship?.aadhaarNumber || ''
          }));
        }
        }
      } catch (err) {
        console.error("Failed to load draft");
      }
    };
    loadDraft();
  }, []);

  const reviewSections = [
    { title: 'Admission Details', fields: [
      ['Session', form.session], ['District', form.district], ['College', form.college],
      ['Course Under By', form.courseUnderBy], ['Admission Type', form.admissionType],
      ['Category', form.admissionCategory], ['Entrance Test', form.entranceTest],
      ['Course', form.course], ['Stream', form.stream],
      ['Entrance Roll No', form.entranceRoll], ['Entrance Rank', form.entranceRank],
    ]},
    { title: 'Personal Information', fields: [
      ['Student Name', form.studentName], ['Gender', form.sex], ['Date of Birth', form.dob],
      ['Mobile', form.mobile], ['Email', form.email],
      ["Father's Name", form.fatherName], ["Mother's Name", form.motherName],
    ]},
    { title: 'Identity & Citizenship', fields: [
      ['Residential Status', form.residentialStatus], ['Country', form.country],
      ['Nationality', form.nationality], ['ABC/APAAR ID', form.abcId], ['Aadhaar No', form.aadhaar],
    ]},
  ];

  if (appStatus && !['DRAFT', 'NEEDS_CORRECTION'].includes(appStatus)) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in text-center mt-20">
         <div className="w-20 h-20 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-5">
           <Check className="w-10 h-10 text-success" />
         </div>
         <h1 className="text-2xl font-bold text-text">Phase-I Application Submitted</h1>
         <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
           You have successfully submitted your Phase-I application. 
           It is currently <span className="font-bold text-primary">{appStatus.replace('_', ' ')}</span>.
           Please wait for the admin to review it.
         </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text">Phase-I Application</h1>
        <p className="text-gray-500 mt-1 text-sm">Fill out all steps carefully. You can save as draft at any time.</p>
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

          {/* ── Step 1: Admission Details ── */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-text border-b border-border pb-3">Admission Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <Field label="Session" required>
                  <select className={selectCls} value={form.session} onChange={set('session')}>
                    <option value="">Choose session</option>
                    <option>2025-26</option>
                    <option>2026-27</option>
                  </select>
                </Field>

                <Field label="College District" required>
                  <select className={selectCls} value={form.district} onChange={set('district')}>
                    <option value="">Choose district</option>
                    <option>Kolkata</option>
                  </select>
                </Field>

                <Field label="College Name" required>
                  <select className={selectCls} value={form.college} onChange={set('college')}>
                    <option value="">Choose college</option>
                    <option>{user?.college?.name || 'Select College'}</option>
                  </select>
                </Field>

                <Field label="Course Under By" required>
                  <select className={selectCls} value={form.courseUnderBy} onChange={set('courseUnderBy')}>
                    <option value="">Choose</option>
                    <option>Non-AICTE</option>
                    <option>AICTE</option>
                  </select>
                </Field>

                <Field label="Admission Type" required>
                  <select className={selectCls} value={form.admissionType} onChange={set('admissionType')}>
                    <option value="">Choose</option>
                    <option>Rank</option>
                    <option>Without Rank</option>
                  </select>
                </Field>

                <Field label="Admission Category" required>
                  <select className={selectCls} value={form.admissionCategory} onChange={set('admissionCategory')}>
                    <option value="">Choose</option>
                    <option>General</option>
                    <option>SC</option>
                    <option>ST</option>
                    <option>OBC</option>
                  </select>
                </Field>

                <Field label="Entrance Test / Scholarship" required>
                  <select className={selectCls} value={form.entranceTest} onChange={set('entranceTest')}>
                    <option value="">Choose</option>
                    <option>CET</option>
                    <option>Non CET Direct Admission</option>
                  </select>
                </Field>

                <Field label="Course" required>
                  <select className={selectCls} value={form.course} onChange={set('course')}>
                    <option value="">Choose</option>
                    {COURSES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>

                <Field label="Stream" required>
                  <select className={selectCls} value={form.stream} onChange={set('stream')}>
                    <option value="">Choose</option>
                    {COURSES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>

                <Field label="Entrance Roll No" required>
                  <input className={inputCls} placeholder="Enter roll number" value={form.entranceRoll} onChange={set('entranceRoll')} />
                </Field>

                <Field label="Entrance Rank" required>
                  <input className={inputCls} placeholder="Enter rank" value={form.entranceRank} onChange={set('entranceRank')} />
                </Field>

              </div>
            </div>
          )}

          {/* ── Step 2: Personal Information ── */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-text border-b border-border pb-3">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <Field label="Student Name" required>
                  <input className={inputCls} placeholder="Full name as per documents" value={form.studentName} onChange={set('studentName')} />
                </Field>

                <Field label="Sex" required>
                  <select className={selectCls} value={form.sex} onChange={set('sex')}>
                    <option value="">Choose</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Prefer not to say</option>
                  </select>
                </Field>

                <Field label="Date of Birth" required>
                  <input type="date" className={inputCls} value={form.dob} onChange={set('dob')} />
                </Field>

                <Field label="Mobile" required>
                  <input className={inputCls} placeholder="+91 XXXXX XXXXX" value={form.mobile} onChange={set('mobile')} />
                </Field>

                <Field label="Email" required>
                  <input type="email" className={inputCls} placeholder="you@example.com" value={form.email} onChange={set('email')} />
                </Field>

                <Field label="Father's Name" required>
                  <input className={inputCls} placeholder="Father's full name" value={form.fatherName} onChange={set('fatherName')} />
                </Field>

                <Field label="Mother's Name" required>
                  <input className={inputCls} placeholder="Mother's full name" value={form.motherName} onChange={set('motherName')} />
                </Field>

              </div>
            </div>
          )}

          {/* ── Step 3: Identity & Citizenship ── */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-text border-b border-border pb-3">Identity & Citizenship</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <Field label="Student's Residential Status" required>
                  <select className={selectCls} value={form.residentialStatus} onChange={set('residentialStatus')}>
                    <option value="">Choose</option>
                    <option>Only West Bengal</option>
                    <option>Outside of West Bengal</option>
                    <option>Foreign</option>
                  </select>
                </Field>

                <Field label="Country" required>
                  <select className={selectCls} value={form.country} onChange={set('country')}>
                    <option value="">Choose</option>
                    <option>India</option>
                    <option>Others</option>
                  </select>
                </Field>

                <Field label="Nationality" required>
                  <input className={inputCls} placeholder="e.g. Indian" value={form.nationality} onChange={set('nationality')} />
                </Field>

                <Field label="ABC / APAAR ID" required>
                  <input className={inputCls} placeholder="Enter ABC/APAAR ID" value={form.abcId} onChange={set('abcId')} />
                </Field>

                <Field label="Aadhaar Number" required>
                  <input className={inputCls} placeholder="XXXX XXXX XXXX" value={form.aadhaar} onChange={set('aadhaar')} maxLength={14} />
                </Field>

              </div>
            </div>
          )}

          {/* ── Step 4: Review ── */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-text border-b border-border pb-3">Review & Submit</h2>
              <div className="bg-warning/5 border border-warning/20 rounded-xl p-4 text-sm text-warning font-medium">
                ⚠️ Please review all details carefully. Once submitted, the application cannot be edited until an admin reviews it.
              </div>
              <div className="space-y-5">
                {reviewSections.map(section => (
                  <div key={section.title} className="border border-border rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-5 py-3 border-b border-border">
                      <h3 className="font-semibold text-text text-sm">{section.title}</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 p-5">
                      {section.fields.map(([label, val]) => (
                        <div key={label}>
                          <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                          <p className="text-sm font-semibold text-text">{val || <span className="text-gray-300 font-normal">—</span>}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-7 mt-6 border-t border-border gap-3">
            <button type="button" onClick={handleBack}
              className={`px-5 py-2.5 rounded-xl font-medium border border-border text-text hover:bg-gray-50 transition-colors text-sm ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}>
              Back
            </button>
            <div className="flex items-center gap-3">
              <button type="button" onClick={handleDraft}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium border border-border text-text hover:bg-gray-50 transition-colors text-sm">
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              {step < 4 ? (
                <button type="submit" className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm text-sm">
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button type="button" onClick={handleSubmit}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold bg-success text-white hover:bg-success/90 transition-colors shadow-sm text-sm">
                  <Send className="w-4 h-4" /> Submit Application
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
