
import React, { useEffect, useState } from "react";
import { AttendanceOverview } from "../components/AttendanceOverview";
import { SubjectAttendance } from "../components/SubjectAttendance";
import { MonthlyAttendance } from "../components/MonthlyAttendance";
import { AttendanceInsights } from "../components/AttendanceInsights";
import {
  getAttendanceOverview,
  getSubjectAttendance,
  getMonthlyAttendanceReport,
  getAttendanceInsights,
  downloadAttendanceReport,
} from "../../api";

export const AttendanceReports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState({
    overall: 0,
    present: 0,
    absent: 0,
    late: 0,
  });
  const [subjects, setSubjects] = useState<Array<{ name: string; present: number; absent: number; percentage: number }>>([]);
  const [monthlyData, setMonthlyData] = useState<Array<{ month: string; present: number; absent: number; percentage: number }>>([]);
  const [insights, setInsights] = useState<Array<{ icon: string; title: string; description: string }>>([]);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all report data in parallel
        const [overviewData, subjectsData, monthlyData, insightsData] = await Promise.all([
          getAttendanceOverview(),
          getSubjectAttendance(),
          getMonthlyAttendanceReport(),
          getAttendanceInsights(),
        ]);

        setOverview(overviewData || { overall: 0, present: 0, absent: 0, late: 0 });
        setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
        setMonthlyData(Array.isArray(monthlyData) ? monthlyData : []);
        setInsights(Array.isArray(insightsData) ? insightsData : []);
      } catch (err) {
        setError('Failed to load attendance reports. Please try again later.');
        console.error('Error fetching attendance reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const handleDownload = async () => {
    try {
      const blob = await downloadAttendanceReport('pdf');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'attendance-report.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Failed to download report. Please try again.');
      console.error('Error downloading report:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12 text-gray-500">Loading attendance reports...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12 text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Attendance Reports
          </h1>
          <p className="text-gray-600">
            View your complete attendance summary and insights
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            📥 Download Report
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            🖨️ Print Report
          </button>
        </div>
      </div>

      <AttendanceOverview
        overall={overview.overall}
        present={overview.present}
        absent={overview.absent}
        late={overview.late}
      />

      <SubjectAttendance subjects={subjects} />

      <MonthlyAttendance monthlyData={monthlyData} />

      <AttendanceInsights insights={insights} />
    </div>
  );
};
