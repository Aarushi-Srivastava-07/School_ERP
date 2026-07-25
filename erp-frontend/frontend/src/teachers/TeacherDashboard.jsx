import { useState, useMemo } from 'react'
import TeacherCard from '../components/TeacherCard.jsx'
import Attendance from '../components/Attendance.jsx'
import './TeacherDashboard.css'

/* ==========================================================================
   STATIC / SEED DATA
   In production this would come from an API layer — kept as local state
   per project requirements (no backend, no API calls, no localStorage).
   ========================================================================== */

const TEACHER_PROFILE = {
  name: 'Mr. Arun',
  designation: 'Mathematics Teacher',
  employeeId: 'TCH20260001',
}

const SUMMARY_CARDS = [
  {
    id: 'total-classes',
    title: 'Total Classes',
    count: 4,
    description: 'Classes assigned this academic year',
    accent: 'navy',
    icon: '🏫',
  },
  {
    id: 'todays-classes',
    title: "Today's Classes",
    count: 3,
    description: 'Scheduled between 9:00 AM – 2:30 PM',
    accent: 'amber',
    icon: '🕘',
  },
  {
    id: 'pending-review',
    title: 'Assignments Pending Review',
    count: 12,
    description: 'Submissions awaiting evaluation',
    accent: 'danger',
    icon: '📝',
  },
  {
    id: 'recent-marks',
    title: 'Recent Marks Uploaded',
    count: 28,
    description: 'Entries uploaded in the last 7 days',
    accent: 'success',
    icon: '📊',
  },
]

const CLASSES = [
  { id: 'c10a', className: '10-A', subject: 'Mathematics', studentCount: 38, subjectAccent: 'math' },
  { id: 'c10b', className: '10-B', subject: 'Mathematics', studentCount: 35, subjectAccent: 'math' },
  { id: 'c11a', className: '11-A', subject: 'Algebra', studentCount: 32, subjectAccent: 'physics' },
  { id: 'c12b', className: '12-B', subject: 'Calculus', studentCount: 29, subjectAccent: 'chemistry' },
]

const ASSIGNMENTS = [
  {
    id: 'a1',
    title: 'Mathematics Assignment 1',
    subject: 'Mathematics',
    dueDate: '28 Jun 2026',
    submissionCount: '34/38',
    status: 'Active',
  },
  {
    id: 'a2',
    title: 'Physics Unit Test',
    subject: 'Physics',
    dueDate: '30 Jun 2026',
    submissionCount: '29/32',
    status: 'Active',
  },
  {
    id: 'a3',
    title: 'Algebra Worksheet',
    subject: 'Algebra',
    dueDate: '24 Jun 2026',
    submissionCount: '32/32',
    status: 'Closed',
  },
  {
    id: 'a4',
    title: 'Calculus Practice Set 4',
    subject: 'Calculus',
    dueDate: '02 Jul 2026',
    submissionCount: '11/29',
    status: 'Upcoming',
  },
]

const MARKS_SEED = [
  { id: 'm1', name: 'Aarav Sharma', subject: 'Mathematics', marks: 92, grade: 'A+' },
  { id: 'm2', name: 'Diya Mehta', subject: 'Mathematics', marks: 78, grade: 'B+' },
  { id: 'm3', name: 'Kabir Nair', subject: 'Mathematics', marks: 65, grade: 'C' },
  { id: 'm4', name: 'Ishita Rao', subject: 'Algebra', marks: 88, grade: 'A' },
  { id: 'm5', name: 'Vihaan Gupta', subject: 'Mathematics', marks: 54, grade: 'D' },
  { id: 'm6', name: 'Anaya Joshi', subject: 'Calculus', marks: 95, grade: 'A+' },
  { id: 'm7', name: 'Reyansh Iyer', subject: 'Algebra', marks: 71, grade: 'B' },
  { id: 'm8', name: 'Myra Pillai', subject: 'Mathematics', marks: 83, grade: 'A' },
  { id: 'm9', name: 'Arjun Verma', subject: 'Calculus', marks: 47, grade: 'D' },
  { id: 'm10', name: 'Saanvi Reddy', subject: 'Algebra', marks: 90, grade: 'A+' },
  { id: 'm11', name: 'Vivaan Kapoor', subject: 'Mathematics', marks: 76, grade: 'B+' },
  { id: 'm12', name: 'Kiara Desai', subject: 'Calculus', marks: 68, grade: 'C' },
  { id: 'm13', name: 'Aditya Singh', subject: 'Mathematics', marks: 81, grade: 'A' },
  { id: 'm14', name: 'Riya Choudhary', subject: 'Algebra', marks: 59, grade: 'D' },
]

const MARKS_PER_PAGE = 5

function gradeAccent(grade) {
  if (grade === 'A+' || grade === 'A') return 'grade-pill--top'
  if (grade === 'B+' || grade === 'B') return 'grade-pill--mid'
  return 'grade-pill--low'
}

const STATUS_BADGE = {
  Active: 'assignment-badge--active',
  Closed: 'assignment-badge--closed',
  Upcoming: 'assignment-badge--upcoming',
}

function TeacherDashboard() {
  const today = useMemo(
    () =>
      new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [],
  )

  /* ---------------- Marks table: search + pagination state ---------------- */
  const [marksSearch, setMarksSearch] = useState('')
  const [marksPage, setMarksPage] = useState(1)

  const filteredMarks = useMemo(() => {
    const term = marksSearch.trim().toLowerCase()
    if (term === '') return MARKS_SEED
    return MARKS_SEED.filter(
      (entry) =>
        entry.name.toLowerCase().includes(term) || entry.subject.toLowerCase().includes(term),
    )
  }, [marksSearch])

  const marksTotalRecords = filteredMarks.length
  const marksTotalPages = Math.max(1, Math.ceil(marksTotalRecords / MARKS_PER_PAGE))
  const marksSafePage = Math.min(marksPage, marksTotalPages)

  const paginatedMarks = useMemo(() => {
    const start = (marksSafePage - 1) * MARKS_PER_PAGE
    return filteredMarks.slice(start, start + MARKS_PER_PAGE)
  }, [filteredMarks, marksSafePage])

  const marksRangeStart = marksTotalRecords === 0 ? 0 : (marksSafePage - 1) * MARKS_PER_PAGE + 1
  const marksRangeEnd = Math.min(marksSafePage * MARKS_PER_PAGE, marksTotalRecords)
  const marksPageNumbers = Array.from({ length: marksTotalPages }, (_, index) => index + 1)

  function handleMarksSearchChange(event) {
    setMarksSearch(event.target.value)
    setMarksPage(1)
  }

  function goToMarksPage(page) {
    setMarksPage(Math.min(Math.max(1, page), marksTotalPages))
  }

  return (
    <div className="erp-shell">
      {/* ---------------------------- HEADER ---------------------------- */}
      <header className="erp-header">
        <div className="erp-header__brand">
          <div className="erp-header__logo" aria-hidden="true">SE</div>
          <div>
            <span className="erp-header__org">School ERP</span>
            <span className="erp-header__module">Teacher Workspace</span>
          </div>
        </div>

        <div className="erp-header__profile">
          <div className="erp-header__greeting">
            <h1>Welcome, {TEACHER_PROFILE.name}</h1>
            <p>
              {TEACHER_PROFILE.designation} &middot; Employee ID{' '}
              <span className="tabular-num">{TEACHER_PROFILE.employeeId}</span>
            </p>
          </div>
          <div className="erp-header__date">
            <span className="erp-header__date-label">Today</span>
            <span className="erp-header__date-value">{today}</span>
          </div>
          <div className="erp-header__avatar" aria-hidden="true">AR</div>
        </div>
      </header>

      <main className="erp-main">
        {/* ---------------------------- SUMMARY CARDS ---------------------------- */}
        <section className="dashboard-section">
          <div className="summary-grid">
            {SUMMARY_CARDS.map((card) => (
              <TeacherCard
                key={card.id}
                title={card.title}
                count={card.count}
                description={card.description}
                accent={card.accent}
                icon={card.icon}
              />
            ))}
          </div>
        </section>

        {/* ---------------------------- CLASSES ---------------------------- */}
        <section className="dashboard-section">
          <div className="section-heading">
            <h2>My Classes</h2>
            <span className="section-heading__meta">{CLASSES.length} classes assigned</span>
          </div>
          <div className="classes-grid">
            {CLASSES.map((cls) => (
              <article key={cls.id} className={`class-card class-card--${cls.subjectAccent}`}>
                <div className="class-card__top">
                  <h3>Class {cls.className}</h3>
                  <span className="class-card__subject-tag">{cls.subject}</span>
                </div>
                <div className="class-card__stats">
                  <span className="class-card__count tabular-num">{cls.studentCount}</span>
                  <span className="class-card__count-label">Students Enrolled</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ---------------------------- ATTENDANCE ---------------------------- */}
        <section className="dashboard-section">
          <Attendance />
        </section>

        {/* ---------------------------- ASSIGNMENTS ---------------------------- */}
        <section className="dashboard-section">
          <div className="section-heading">
            <h2>Assignments</h2>
            <span className="section-heading__meta">{ASSIGNMENTS.length} total</span>
          </div>
          <div className="assignments-grid">
            {ASSIGNMENTS.map((assignment) => (
              <article key={assignment.id} className="assignment-card">
                <div className="assignment-card__top">
                  <h3>{assignment.title}</h3>
                  <span className={`assignment-badge ${STATUS_BADGE[assignment.status]}`}>
                    {assignment.status}
                  </span>
                </div>
                <p className="assignment-card__subject">{assignment.subject}</p>
                <div className="assignment-card__meta">
                  <div className="assignment-card__meta-item">
                    <span className="assignment-card__meta-label">Due Date</span>
                    <span className="assignment-card__meta-value">{assignment.dueDate}</span>
                  </div>
                  <div className="assignment-card__meta-item">
                    <span className="assignment-card__meta-label">Submissions</span>
                    <span className="assignment-card__meta-value tabular-num">
                      {assignment.submissionCount}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ---------------------------- RECENT MARKS ---------------------------- */}
        <section className="dashboard-section">
          <div className="marks-panel">
            <div className="panel-heading">
              <h3>Recent Marks</h3>
              <span className="panel-heading__meta">{marksTotalRecords} entries on record</span>
            </div>

            <div className="marks-toolbar">
              <div className="search-field">
                <span className="search-field__icon" aria-hidden="true">⌕</span>
                <input
                  type="text"
                  placeholder="Search by student name or subject..."
                  value={marksSearch}
                  onChange={handleMarksSearchChange}
                  aria-label="Search marks by name or subject"
                />
              </div>
            </div>

            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Subject</th>
                    <th>Marks</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMarks.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="empty-row">No matching marks records.</td>
                    </tr>
                  ) : (
                    paginatedMarks.map((entry) => (
                      <tr key={entry.id}>
                        <td>{entry.name}</td>
                        <td>{entry.subject}</td>
                        <td className="tabular-num">{entry.marks} / 100</td>
                        <td>
                          <span className={`grade-pill ${gradeAccent(entry.grade)}`}>{entry.grade}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="pagination-bar">
              <span className="pagination-bar__summary">
                Showing <strong>{marksRangeStart}–{marksRangeEnd}</strong> of{' '}
                <strong>{marksTotalRecords}</strong> Records
              </span>
              <div className="pagination-bar__controls">
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => goToMarksPage(marksSafePage - 1)}
                  disabled={marksSafePage === 1}
                >
                  Previous
                </button>
                <div className="pagination-bar__pages">
                  {marksPageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={`pagination-page ${page === marksSafePage ? 'pagination-page--active' : ''}`}
                      onClick={() => goToMarksPage(page)}
                      aria-current={page === marksSafePage ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => goToMarksPage(marksSafePage + 1)}
                  disabled={marksSafePage === marksTotalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default TeacherDashboard
