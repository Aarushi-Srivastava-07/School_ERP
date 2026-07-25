import { useEffect, useState, useCallback, type FC } from 'react';
import ResultStatistics from './ResultStatistics';
import MarksTable from './MarksTable';
import PerformanceChart from './PerformanceChart';
import { useAuth } from '../context/AuthContext';
import api from '../api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Subject {
  id: string;          // real DB result id — needed for PUT /exams/:id
  name: string;
  maxMarks: number;
  obtained: number;
  grade: string;
}

interface Summary {
  totalMarks: number;
  maxMarks: number;
  overallPercentage: number;
  overallGrade: string;
  studentRank: string;
  classAverage: string;
}

interface Toast {
  msg: string;
  type: 'success' | 'error';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const deriveGrade = (obtained: number, max: number): string => {
  const pct = max > 0 ? (obtained / max) * 100 : 0;
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  if (pct >= 33) return 'D';
  return 'F';
};

const buildSummary = (subjects: Subject[]): Summary => {
  const totalObtained = subjects.reduce((s, r) => s + r.obtained, 0);
  const totalMax = subjects.reduce((s, r) => s + r.maxMarks, 0);
  const pct = totalMax > 0 ? parseFloat(((totalObtained / totalMax) * 100).toFixed(1)) : 0;
  return {
    totalMarks: totalObtained,
    maxMarks: totalMax,
    overallPercentage: pct,
    overallGrade: deriveGrade(totalObtained, totalMax),
    studentRank: '—',       // rank requires aggregate query; placeholder
    classAverage: '—',      // same
  };
};

const mapRow = (r: any): Subject => ({
  id: r.id ?? '',
  name:
    r.subject_meta?.name ||
    r.subject_name ||
    (r.subject_id ? `Subject #${String(r.subject_id).substring(0, 6)}` : 'Unknown'),
  maxMarks: Number(r.max_marks) || 100,
  obtained: Number(r.marks_obtained) || 0,
  grade: r.grade || deriveGrade(Number(r.marks_obtained) || 0, Number(r.max_marks) || 100),
});

const getRemarks = (subjects: Subject[]) => ({
  strong: subjects.filter(s => s.obtained >= (s.maxMarks * 0.9)).map(s => s.name),
  weak: subjects.filter(s => s.obtained < (s.maxMarks * 0.75)).map(s => s.name),
});

// ─── Component ────────────────────────────────────────────────────────────────

const ResultsPage: FC = () => {
  const { user } = useAuth();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [editableSubjects, setEditableSubjects] = useState<Subject[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchResults = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const normalizedRole = user.role?.toLowerCase();
      const response =
        normalizedRole === 'student'
          ? await api.get('/exams/me')
          : await api.get('/exams/', {
              params: {
                // Pass optional filters as query params; undefined values are ignored by axios
                studentId: user.studentId ?? undefined,
                classId: user.classId ?? undefined,
              },
            });

      const rows: any[] = response.data?.data ?? [];
      if (rows.length > 0) {
        const mapped = rows.map(mapRow);
        setSubjects(mapped);
        setEditableSubjects(mapped.map(s => ({ ...s }))); // deep copy for editing
        setSummary(buildSummary(mapped));
      } else {
        // Empty DB — clear everything; no mock fallback
        setSubjects([]);
        setEditableSubjects([]);
        setSummary(null);
      }
    } catch (err: any) {
      console.error('Error fetching results:', err);
      showToast(
        err.response?.data?.error || 'Could not load results from the server.',
        'error'
      );
      setSubjects([]);
      setEditableSubjects([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user !== undefined) fetchResults();
  }, [user, fetchResults]);

  // ── Save handler ───────────────────────────────────────────────────────────
  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // For each edited subject, use PUT /exams/:id when we have a real id,
      // otherwise fall back to POST /exams/ (new entry).
      await Promise.all(
        editableSubjects.map(sub => {
          if (sub.id) {
            // Update existing result record
            return api.put(`/exams/${sub.id}`, {
              marks_obtained: sub.obtained,
              max_marks: sub.maxMarks,
            });
          } else {
            // Create a new result — requires student/class/exam/subject IDs
            // These should come from user context or a selector in a production flow.
            return api.post('/exams/', {
              student_id: (user as any)?.studentId,
              class_id: (user as any)?.classId,
              exam_id: (user as any)?.examId,
              subject_id: sub.name, // ideally a UUID from a subject selector
              marks_obtained: sub.obtained,
              max_marks: sub.maxMarks,
            });
          }
        })
      );

      setIsEditing(false);
      showToast('Marks saved successfully!');
      // Re-fetch so the table reflects the authoritative DB state
      await fetchResults();
    } catch (err: any) {
      console.error('Error saving marks:', err);
      showToast(
        err.response?.data?.error || 'Failed to save marks. Please try again.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditableSubjects(subjects.map(s => ({ ...s }))); // reset to last fetched state
    setIsEditing(false);
  };

  const { strong, weak } = getRemarks(editableSubjects);
  const isAdminOrTeacher =
    user?.role?.toLowerCase() === 'teacher' || user?.role?.toLowerCase() === 'admin';

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading)
    return (
      <div className="p-10 text-center text-gray-400 font-semibold">
        Loading exam results...
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 relative">

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 p-4 rounded-lg shadow-lg font-semibold text-white transition-all
            ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}
        >
          {toast.msg}
        </div>
      )}

      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Examination Results</h1>
          <p className="text-gray-500 mt-1">View and manage academic performance records</p>
        </div>

        {isAdminOrTeacher && (
          <div className="flex gap-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                disabled={subjects.length === 0}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Edit Marks
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-lg transition text-white
                    ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                  className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        )}
      </header>

      {subjects.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          <p className="text-lg font-semibold">No exam results found.</p>
          <p className="text-sm mt-1">Results will appear here once they are entered by a teacher.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summary Banner */}
          <div className="col-span-1 lg:col-span-3">
            {summary && <ResultStatistics summary={summary} />}
          </div>

          {/* Marks Table / Edit Form */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <div className="p-4 rounded-xl shadow-sm border border-gray-200 bg-white">
              {isEditing ? (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700">Edit Subject Marks</h3>
                  {editableSubjects.map((sub, index) => (
                    <div key={sub.id || index} className="flex justify-between items-center border-b pb-2">
                      <span className="text-gray-700 font-medium">{sub.name}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={sub.maxMarks}
                          value={sub.obtained}
                          className="border p-1 rounded w-20 text-center focus:border-blue-500 outline-none"
                          onChange={(e) => {
                            const updated = [...editableSubjects];
                            updated[index] = {
                              ...updated[index],
                              obtained: Math.min(parseInt(e.target.value) || 0, sub.maxMarks),
                            };
                            setEditableSubjects(updated);
                          }}
                        />
                        <span className="text-xs text-gray-400">/ {sub.maxMarks}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <MarksTable subjects={editableSubjects} />
              )}
            </div>

            {/* Performance Insight */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h3 className="font-semibold text-blue-800">Performance Insight</h3>
              <p className="text-sm text-blue-600 mt-1">
                <strong>Strengths:</strong> {strong.length > 0 ? strong.join(', ') : 'None'}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                <strong>Needs Improvement:</strong> {weak.length > 0 ? weak.join(', ') : 'None'}
              </p>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="col-span-1 p-4 rounded-xl shadow-sm border border-gray-200 bg-white">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Performance Trends</h3>
            <PerformanceChart subjects={editableSubjects} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsPage;
