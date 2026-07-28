import {
  Search,
  Filter,
  Download,
  Eye,
  XCircle,
  File,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "../../components/ui/Toast";
import { TableSkeleton } from "../../components/ui/Skeleton";
import api from "../../api/axios";

const DOC_KEYS = ["doc10th", "doc12th", "idProof", "photo"];

const DOC_LABELS = {
  doc10th: "10th Marksheet",
  doc12th: "12th Marksheet",
  idProof: "ID Proof (Aadhaar)",
  photo: "Passport Photo",
};

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
  "Bachelor's Degree in Interior Design",
];

function StatusDot({ status }) {
  const cls = {
    Verified: "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]",
    Pending: "bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.4)]",
    Rejected: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]",
  };
  return (
    <span className={`w-2 h-2 rounded-full mr-2 inline-block animate-pulse ${cls[status]}`} />
  );
}

export function AdminDocuments() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState([]);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await api.get('/document/college');
        if (res.data.success) {
          setDocs(res.data.data);
        }
      } catch (err) {
        toast("Failed to load documents", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  const [docs, setDocs] = useState([]);

  // ✅ FILTER LOGIC (PRECise)
  const filtered = docs.filter((d) => {
    const searchLower = search.toLowerCase();
    const matchSearch =
      d.student.toLowerCase().includes(searchLower) ||
      d.id.toLowerCase().includes(searchLower) ||
      d.course.toLowerCase().includes(searchLower);

    const matchCourse =
      selectedCourses.length === 0 ||
      selectedCourses.includes(d.course);

    return matchSearch && matchCourse;
  });

  const openModal = (row) => {
    setSelectedStudent(row);
    setShowModal(true);
  };

  const handleDocAction = (studentId, docKey, newStatus) => {
    setDocs(prev => prev.map(s => s.id === studentId ? { ...s, [docKey]: newStatus } : s));
    if (selectedStudent?.id === studentId) {
      setSelectedStudent(prev => ({ ...prev, [docKey]: newStatus }));
    }
    toast(`${newStatus} successfully`, newStatus === 'Verified' ? 'success' : 'error');
  };

  // 🔥 BULK DOWNLOAD
  const handleBulkDownload = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/document/bulk', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courses: selectedCourses,
        }),
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "documents.zip";
      a.click();
    } catch {
      toast("Download failed", "error");
    }
  };

  // 🔥 STUDENT DOWNLOAD
  const handleStudentDownload = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/document/student', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: selectedStudent.id,
        }),
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedStudent.id}.zip`;
      a.click();
    } catch {
      toast("Download failed", "error");
    }
  };

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-text">
            Document Verification
          </h1>
          <p className="text-text/60 text-sm">
            Review and verify applicant uploaded documents.
          </p>
        </div>
        <button
          onClick={handleBulkDownload}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
        >
          <Download className="w-4 h-4" /> Bulk Download
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-card border border-border rounded-2xl shadow-sm">
        <div className="p-4 flex justify-between relative border-b border-border">
          {/* SEARCH */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text/45" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students..."
              className="pl-9 pr-4 py-2 border border-border rounded-xl w-full text-sm outline-none focus:border-primary transition-colors bg-card text-text placeholder:text-text/45"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2">
            {selectedCourses.length > 0 && (
              <button
                onClick={() => setSelectedCourses([])}
                className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary/15 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" /> Clear ({selectedCourses.length})
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium transition-all ${
                  showFilter || selectedCourses.length > 0
                    ? "bg-primary/10 border-primary/25 text-primary"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <Filter className="w-4 h-4" /> Filter
              </button>

              {showFilter && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-2xl shadow-2xl z-30 animate-scale-in origin-top-right overflow-hidden">
                  <div className="p-3 border-b border-border bg-muted/40 flex justify-between items-center">
                    <span className="text-xs font-bold text-text/55 uppercase">
                      Filter by Course
                    </span>
                    <button onClick={() => setShowFilter(false)} className="p-1 hover:bg-border/40 rounded-lg transition-colors">
                      <XCircle className="w-4 h-4 text-text/45" />
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto p-2">
                    <button
                      onClick={() => setSelectedCourses([])}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
                        selectedCourses.length === 0
                          ? "bg-primary text-white font-bold"
                          : "hover:bg-muted/60 text-text/70"
                      }`}
                    >
                      All Courses
                    </button>

                    {COURSES.map((course) => {
                      const isSelected = selectedCourses.includes(course);
                      return (
                        <button
                          key={course}
                          onClick={() =>
                            setSelectedCourses((prev) =>
                              isSelected
                                ? prev.filter((c) => c !== course)
                                : [...prev, course]
                            )
                          }
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-0.5 last:mb-0 flex justify-between items-center transition-colors ${
                            isSelected
                              ? "bg-primary text-white font-bold"
                              : "hover:bg-muted/60 text-text/70"
                          }`}
                        >
                          <span className="truncate pr-2">{course}</span>
                          {isSelected && <CheckCircle className="w-3 h-3" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-muted/50 text-text/60 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 text-left font-bold">Student ID</th>
                <th className="text-left font-bold">Student Name</th>
                <th className="text-left font-bold">Course</th>
                <th className="text-left font-bold">10th</th>
                <th className="text-left font-bold">12th</th>
                <th className="text-left font-bold">ID Proof</th>
                <th className="text-left font-bold">Photo</th>
                <th className="text-right px-6 font-bold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {filtered.map((row, i) => (
                <tr key={row.id} className="hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                  <td className="px-6 py-4 font-mono text-xs font-bold text-text/45">{row.id}</td>
                  <td className="font-bold text-text">{row.student}</td>
                  <td className="text-xs text-text/55 max-w-[150px] truncate">{row.course}</td>

                  {DOC_KEYS.map((k) => (
                    <td key={k}>
                      <div className="flex items-center">
                        <StatusDot status={row[k]} />
                        <span className={`text-[11px] font-bold ${
                          row[k] === 'Verified' ? 'text-green-600' : 
                          row[k] === 'Rejected' ? 'text-red-600' : 'text-yellow-600'
                        }`}>{row[k]}</span>
                      </div>
                    </td>
                  ))}

                  <td className="text-right px-6">
                    <button 
                      onClick={() => openModal(row)}
                      className="p-2 hover:bg-muted/50 border border-transparent hover:border-border rounded-xl transition-all hover:shadow-sm text-primary"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-text/45">
                      <File className="w-10 h-10 mb-2 opacity-20" />
                      <p className="text-sm font-medium">No students found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL - DETAILED VIEW */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh] border border-border mt-8 sm:mt-12" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/40">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-600/30">
                  {selectedStudent.student.charAt(0)}
                </div>
                <div>
                  <h2 className="font-bold text-text text-lg">{selectedStudent.student}</h2>
                  <p className="text-xs text-text/50 font-mono">{selectedStudent.id} • {selectedStudent.course}</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted/50 rounded-xl transition-colors">
                <XCircle className="w-6 h-6 text-text/45" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <h3 className="text-[10px] font-bold text-text/50 uppercase tracking-widest">Document Status & Actions</h3>
              <div className="grid gap-3">
                {DOC_KEYS.map((k) => (
                  <div key={k} className="p-4 border border-border rounded-2xl bg-muted/25 flex items-center justify-between group hover:bg-muted/40 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-card rounded-lg border border-border shadow-sm">
                        <File className="w-4 h-4 text-text/45" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text">{DOC_LABELS[k]}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <StatusDot status={selectedStudent[k]} />
                          <span className={`text-[10px] font-bold uppercase ${
                            selectedStudent[k] === 'Verified' ? 'text-green-600' : 
                            selectedStudent[k] === 'Rejected' ? 'text-red-600' : 'text-yellow-600'
                          }`}>{selectedStudent[k]}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setPreviewDoc({ name: DOC_LABELS[k], key: k, status: selectedStudent[k] })}
                        className="p-2 bg-card border border-border rounded-xl shadow-sm hover:text-primary hover:border-primary transition-all"
                        title="Preview"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDocAction(selectedStudent.id, k, 'Verified')}
                        className={`px-4 py-2 text-[10px] font-bold rounded-xl border transition-all ${
                          selectedStudent[k] === 'Verified' 
                          ? 'bg-green-500 border-green-500 text-white shadow-md shadow-green-500/20' 
                          : 'bg-card border-border text-text/60 hover:border-green-500/50 hover:text-success'
                        }`}
                      >
                        Verify
                      </button>
                      <button 
                        onClick={() => handleDocAction(selectedStudent.id, k, 'Rejected')}
                        className={`px-4 py-2 text-[10px] font-bold rounded-xl border transition-all ${
                          selectedStudent[k] === 'Rejected' 
                          ? 'bg-red-500 border-red-500 text-white shadow-md shadow-red-500/20' 
                          : 'bg-card border-border text-text/60 hover:border-red-500/50 hover:text-danger'
                        }`}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-border bg-muted/40">
              <button
                onClick={handleStudentDownload}
                className="w-full bg-gray-900 text-white py-3 flex justify-center items-center gap-2 rounded-2xl font-bold text-sm hover:bg-black transition-all shadow-xl shadow-black/10"
              >
                <Download className="w-4 h-4" />
                Download All Documents (.zip)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL (TOP LAYER) */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-fade-in" onClick={() => setPreviewDoc(null)}>
          <div className="bg-card rounded-[32px] w-full max-w-4xl max-h-[85vh] shadow-2xl overflow-hidden animate-scale-in flex flex-col border border-border mt-8 sm:mt-12" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                  <File className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-text text-lg">{previewDoc.name}</h3>
                  <p className="text-xs text-text/50 mt-0.5">Student: {selectedStudent.student}</p>
                </div>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="p-2 hover:bg-muted/50 rounded-2xl transition-all">
                <XCircle className="w-8 h-8 text-text/40 hover:text-text/60" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto bg-background p-4 flex flex-col items-center justify-start sm:justify-center">
              <div className="bg-card w-full max-w-[260px] sm:max-w-[340px] aspect-[3/4] rounded-2xl shadow-xl border border-border flex items-center justify-center relative my-auto shrink-0">
                <div className="text-center opacity-30 text-text">
                  <File className="w-20 h-20 mx-auto mb-4" />
                  <p className="font-bold text-xl uppercase tracking-widest italic">Preview Mock</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border flex justify-between items-center gap-4">
              <div className="flex gap-3">
                <button 
                  onClick={() => { handleDocAction(selectedStudent.id, previewDoc.key, 'Verified'); setPreviewDoc(null); }}
                  className="px-8 py-3 bg-green-500 text-white rounded-2xl font-bold text-sm hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
                >
                  Verify Now
                </button>
                <button 
                  onClick={() => { handleDocAction(selectedStudent.id, previewDoc.key, 'Rejected'); setPreviewDoc(null); }}
                  className="px-8 py-3 bg-red-500 text-white rounded-2xl font-bold text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Reject
                </button>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 border border-border rounded-2xl font-bold text-sm text-text/70 hover:bg-muted/50 transition-all">
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
