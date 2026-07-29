import { Plus, Download, Search, Filter, X, Eye, User, BookOpen, MapPin, GraduationCap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import { Modal } from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';
import api from '../../api/axios';

const inputCls = 'w-full px-4 py-2.5 border border-border rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-all bg-card text-text placeholder:text-text/45';

const DetailSection = ({ icon, title, children }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 text-primary font-bold text-sm border-b border-primary/10 pb-2">
      {icon}
      <span>{title}</span>
    </div>
    {children}
  </div>
);

const Grid = ({ children }) => (
  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
    {children}
  </div>
);

const Info = ({ label, value }) => (
  <div>
    <p className="text-[10px] uppercase tracking-wider text-text/50 font-bold mb-0.5">{label}</p>
    <p className="text-sm text-text font-medium">{value || <span className="text-text/35">—</span>}</p>
  </div>
);

export function StudentTable() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);

  const [search, setSearch]           = useState('');
  const [showModal, setShowModal]     = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form, setForm]               = useState({ name: '', mobile: '', email: '', course: '', session: '2025-26', fatherName: '', category: '' });
  const [showFilter, setShowFilter]   = useState(false);
  const [selectedCourses, setSelectedCourses] = useState([]);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/student');
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      toast('Failed to load students', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

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

  const filtered = students.filter(s => {
    const searchLower = search.toLowerCase();
    const matchesSearch = s.name.toLowerCase().includes(searchLower) ||
                          s.id.toLowerCase().includes(searchLower) ||
                          s.course.toLowerCase().includes(searchLower);
    
    // Multi-select course matching
    const matchesCourse = selectedCourses.length === 0 || 
                          selectedCourses.some(sc => 
                            s.course === sc || 
                            sc.toLowerCase().includes(s.course.toLowerCase())
                          );
    
    return matchesSearch && matchesCourse;
  });

  const setField = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleAdd = async () => {
    if (!form.name || !form.email) return;
    try {
      const payload = {
        fullName: form.name,
        guardianName: form.fatherName || 'N/A',
        mobile: form.mobile,
        email: form.email,
        course: form.course,
        year: parseInt(form.session.split('-')[0]) || 2025
      };
      const res = await api.post('/student/create', payload);
      if (res.data.success) {
        toast && toast(`${form.name} added successfully.`, 'success');
        setShowModal(false);
        setForm({ name: '', mobile: '', email: '', course: '', session: '2025-26', fatherName: '', category: '' });
        fetchStudents();
      }
    } catch (err) {
      toast && toast(err.response?.data?.message || 'Failed to add student', 'error');
    }
  };

  const handleExportCSV = () => {
    if (!filtered || filtered.length === 0) {
      toast && toast('No data to export', 'error');
      return;
    }
    const headers = [
      'Student ID', 'Student Name', 'Father\'s Name', 'Mother\'s Name', 'DOB', 'Sex', 'Category', 'Blood Group',
      'Religion', 'Guardian Name', 'Relation', 'Guardian Contact', 'Mobile No.', 'Alternative Mobile', 'Email',
      'Address', 'District', 'State', 'PIN', 'Domicile Type', 'Course', 'Session', 'College', 'Admission Type',
      'Entrance Rank', 'Aadhaar No.', 'ABC ID', 'Exam Type', 'Board/Council', 'Passing Year', 'Marks Obtained', 'CGPA/DGPA'
    ];

    const csvRows = [headers.join(',')];

    for (const s of filtered) {
      const row = [
        s.id, s.name, s.fatherName, s.motherName, s.dob, s.sex, s.category, s.bloodGroup,
        s.religion, s.guardian?.name, s.guardian?.relation, s.guardian?.contact, s.mobile,
        s.altMobile, s.email, s.address, s.district, s.state, s.pin, s.domicileType,
        s.course, s.session, s.college, s.admissionType, s.rank, s.aadhaarNo, s.abcId,
        s.examType, s.board, s.passingYear, s.marks, s.cgpa
      ].map(val => `"${(val || '—').toString().replace(/"/g, '""')}"`);
      csvRows.push(row.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-6 animate-fade-in w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Students Directory</h1>
          <p className="text-text/60 mt-1 text-sm">Manage all enrolled students.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border text-text rounded-xl font-medium text-sm hover:bg-muted/50 transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add Student
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm animate-fade-in-up delay-100">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between gap-3 relative">
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text/45" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search students..."
              className="pl-9 pr-4 py-2 border border-border rounded-xl outline-none focus:border-primary text-sm w-full transition-colors bg-card text-text placeholder:text-text/45" />
          </div>
          <div className="flex gap-2">
            {selectedCourses.length > 0 && (
              <button onClick={() => setSelectedCourses([])}
                className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary/20 transition-colors">
                <X className="w-3.5 h-3.5" /> Clear ({selectedCourses.length})
              </button>
            )}
            <button onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-medium transition-colors ${showFilter || selectedCourses.length > 0 ? 'bg-primary/5 border-primary/20 text-primary' : 'hover:bg-muted/50'}`}>
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>

          {/* Filter Dropdown */}
          {showFilter && (
            <div className="absolute right-0 top-[calc(100%-4px)] w-72 bg-card border border-border rounded-2xl shadow-2xl z-20 animate-scale-in origin-top-right overflow-hidden">
              <div className="p-3 border-b border-border bg-muted/40 flex items-center justify-between">
                <span className="text-xs font-bold text-text/55 uppercase tracking-wider">Filter by Course</span>
                <button onClick={() => setShowFilter(false)} className="p-1 hover:bg-border/40 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-text/45" />
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto p-2 custom-scrollbar">
                <button onClick={() => setSelectedCourses([])}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors mb-1 ${selectedCourses.length === 0 ? 'bg-primary text-white font-bold' : 'hover:bg-muted/60 text-text/70'}`}>
                  All Courses
                </button>
                {COURSES.map(course => {
                  const isSelected = selectedCourses.includes(course);
                  return (
                    <button key={course} 
                      onClick={() => {
                        setSelectedCourses(prev => 
                          isSelected ? prev.filter(c => c !== course) : [...prev, course]
                        );
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors mb-0.5 last:mb-0 flex items-center justify-between ${isSelected ? 'bg-primary text-white font-bold' : 'hover:bg-muted/60 text-text/70'}`}>
                      <span>{course}</span>
                      {isSelected && <X className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ✅ FIXED: Single wrapper with both overflow-x and overflow-y + bounded height */}
        <div className="overflow-auto max-h-[60vh]">
          <table className="min-w-max text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/50 text-text/60 font-medium border-b border-border sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4">Student ID</th>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Father's Name</th>
                <th className="px-6 py-4">Mother's Name</th>
                <th className="px-6 py-4">DOB</th>
                <th className="px-6 py-4">Sex</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Blood Group</th>
                <th className="px-6 py-4">Religion</th>
                <th className="px-6 py-4">Guardian Name</th>
                <th className="px-6 py-4">Relation</th>
                <th className="px-6 py-4">Guardian Contact</th>
                <th className="px-6 py-4">Mobile No.</th>
                <th className="px-6 py-4">Alternative Mobile</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Address</th>
                <th className="px-6 py-4">District</th>
                <th className="px-6 py-4">State</th>
                <th className="px-6 py-4">PIN</th>
                <th className="px-6 py-4">Domicile Type</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Session</th>
                <th className="px-6 py-4">College</th>
                <th className="px-6 py-4">Admission Type</th>
                <th className="px-6 py-4">Entrance Rank</th>
                <th className="px-6 py-4">Aadhaar No.</th>
                <th className="px-6 py-4">ABC ID</th>
                <th className="px-6 py-4">Exam Type</th>
                <th className="px-6 py-4">Board/Council</th>
                <th className="px-6 py-4">Passing Year</th>
                <th className="px-6 py-4">Marks Obtained</th>
                <th className="px-6 py-4">CGPA/DGPA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s, i) => (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors animate-fade-in"
                  style={{ animationDelay: `${i * 40}ms` }}>
                  <td className="px-6 py-4 font-mono text-xs font-semibold text-text">{s.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {s.name?.charAt(0)}
                      </div>
                      <div>
                        <span className="font-medium text-text block">{s.name}</span>
                        <span className="text-[10px] text-text/45">{s.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text/55">{s.fatherName || '—'}</td>
                  <td className="px-6 py-4 text-text/55">{s.motherName || '—'}</td>
                  <td className="px-6 py-4 text-text/55">{s.dob || '—'}</td>
                  <td className="px-6 py-4 text-text/55">{s.sex || '—'}</td>
                  <td className="px-6 py-4 text-text/55">{s.category || '—'}</td>
                  <td className="px-6 py-4 text-text/55">{s.bloodGroup || '—'}</td>
                  <td className="px-6 py-4 text-text/55">{s.religion || '—'}</td>
                  <td className="px-6 py-4 text-text/55">{s.guardian?.name || '—'}</td>
                  <td className="px-6 py-4 text-text/55">{s.guardian?.relation || '—'}</td>
                  <td className="px-6 py-4 text-text/55">{s.guardian?.contact || '—'}</td>
                  <td className="px-6 py-4 text-text/55">{s.mobile || '—'}</td>
                  <td className="px-6 py-4 text-text/55">{s.contact?.altMobile || '—'}</td>
                  <td className="px-6 py-4 text-text/55">{s.email || '—'}</td>
                  <td className="px-6 py-4 text-text/55">{s.contact?.address || '—'}</td>
                  <td className="px-6 py-4 text-text/55">{s.district || '—'}</td>
                  <td className="px-6 py-4 text-text/55">{s.contact?.state || '—'}</td>
                  <td className="px-6 py-4 text-text/55">{s.contact?.pin || '—'}</td>
                  <td className="px-6 py-4 text-text/55">{s.contact?.domicile || '—'}</td>
                  <td className="px-6 py-4 text-text/55">{s.course || '—'}</td>
                  <td className="px-6 py-4 text-text/55">{s.session || '—'}</td>
                  <td className="px-6 py-4 text-text/55">{s.college || '—'}</td>
                  <td className="px-6 py-4 text-text/55">{s.admissionType || '—'}</td>
                  <td className="px-6 py-4 text-text/55">{s.rank || '—'}</td>
                  <td className="px-6 py-4 text-text/55">{s.aadhaar || '—'}</td>
                  <td className="px-6 py-4 text-text/55">{s.abcId || '—'}</td>
                  <td className="px-6 py-4 text-text/55">{s.education?.examType || '—'}</td>
                  <td className="px-6 py-4 text-text/55">{s.education?.board || '—'}</td>
                  <td className="px-6 py-4 text-text/55">{s.education?.year || '—'}</td>
                  <td className="px-6 py-4 text-text/55">{s.education?.marks || '—'}</td>
                  <td className="px-6 py-4 text-text/55">{s.education?.cgpa || '—'}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={32} className="px-6 py-12 text-center text-text/45 text-sm">No students found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Details Modal */}
      <Modal open={!!selectedStudent} onClose={() => setSelectedStudent(null)} title="Student Details">
        {selectedStudent && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl border border-border/50">
              <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center text-xl font-bold">
                {selectedStudent.name?.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-text">{selectedStudent.name}</h3>
                <p className="text-xs text-text/55 font-mono">{selectedStudent.id}</p>
              </div>
            </div>

            <DetailSection icon={<GraduationCap className="w-4 h-4" />} title="Admission Details">
              <Grid>
                <Info label="Session" value={selectedStudent.session} />
                <Info label="College" value={selectedStudent.college} />
                <Info label="Course" value={selectedStudent.course} />
                <Info label="Admission Type" value={selectedStudent.admissionType} />
                <Info label="Category" value={selectedStudent.category} />
                <Info label="Rank" value={selectedStudent.rank} />
              </Grid>
            </DetailSection>

            <DetailSection icon={<User className="w-4 h-4" />} title="Personal Information">
              <Grid>
                <Info label="Father's Name" value={selectedStudent.fatherName} />
                <Info label="Mother's Name" value={selectedStudent.motherName} />
                <Info label="Date of Birth" value={selectedStudent.dob} />
                <Info label="Sex" value={selectedStudent.sex} />
                <Info label="Mobile" value={selectedStudent.mobile} />
                <Info label="Email" value={selectedStudent.email} />
                <Info label="Blood Group" value={selectedStudent.bloodGroup} />
                <Info label="Religion" value={selectedStudent.religion} />
              </Grid>
            </DetailSection>

            <DetailSection icon={<MapPin className="w-4 h-4" />} title="Contact & Guardian">
              <Grid>
                <Info label="Guardian" value={selectedStudent.guardian?.name} />
                <Info label="Relation" value={selectedStudent.guardian?.relation} />
                <Info label="G. Contact" value={selectedStudent.guardian?.contact} />
                <Info label="Address" value={selectedStudent.contact?.address} />
                <Info label="District" value={selectedStudent.district} />
                <Info label="PIN" value={selectedStudent.contact?.pin} />
              </Grid>
            </DetailSection>

            <DetailSection icon={<BookOpen className="w-4 h-4" />} title="Educational Background">
              <Grid>
                <Info label="Exam Type" value={selectedStudent.education?.examType} />
                <Info label="Board" value={selectedStudent.education?.board} />
                <Info label="Year" value={selectedStudent.education?.year} />
                <Info label="Marks" value={selectedStudent.education?.marks} />
                <Info label="Division" value={selectedStudent.education?.division} />
                <Info label="CGPA" value={selectedStudent.education?.cgpa} />
              </Grid>
            </DetailSection>
          </div>
        )}
      </Modal>

      {/* Add Student Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="flex min-h-full p-4">
            <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl animate-scale-in m-auto">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="text-lg font-bold text-text">Add Student</h2>
                <button onClick={() => setShowModal(false)}
                  className="p-1.5 text-text/45 hover:text-text hover:bg-muted/50 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 space-y-4">
              {[
                { label: 'Full Name',     key: 'name',       ph: 'e.g. Rahul Sharma',  type: 'text'  },
                // { label: "Guardian's Name", key: 'fatherName', ph: "Guardian's Name",       type: 'text'  },
                // { label: 'Category',      key: 'category',   ph: 'e.g. General, SC',   type: 'text'  },
                { label: 'Mobile',        key: 'mobile',     ph: '+91 XXXXX XXXXX',    type: 'tel'   },
                { label: 'Email',         key: 'email',      ph: 'you@example.com',    type: 'email' },
                { label: 'Course',        key: 'course',     ph: 'e.g. BCA',           type: 'text'  },
                // { label: 'Entrance Rank', key: 'rank',       ph: 'e.g. 1245',          type: 'text'  },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-text mb-1.5">{f.label}</label>
                  <input type={f.type} placeholder={f.ph} value={form[f.key]} onChange={setField(f.key)} className={inputCls} />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-border">
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted/50 transition-colors">
                Cancel
              </button>
              <button onClick={handleAdd}
                className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
                Add Student
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}