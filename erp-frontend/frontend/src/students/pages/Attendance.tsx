import React, { useEffect, useState } from "react";
import AttendanceCalendar from "../../attendance/components/AttendanceCalendar";
import AttendanceSummary from "../../attendance/components/AttendanceSummary";
import AttendanceTable from "../../attendance/components/AttendanceTable";
import AttendanceTrend from "../../attendance/components/AttendanceTrend";
import {
  getAttendanceSummary,
  getRecentAttendance,
  getAttendanceCalendar,
  getAttendanceTrend,
  type AttendanceRecord,
} from "../../api";

const Attendance: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
  const [summaryData, setSummaryData] = useState({
    overall: 0,
    present: 0,
    absent: 0,
    late: 0,
    total: 0,
  });
  const [calendarData, setCalendarData] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    days: [] as Array<{ day: number; status: "present" | "absent" | "late" | "holiday" }>,
  });
  const [trendData, setTrendData] = useState<Array<{ day: string; present: number; absent: number }>>([]);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch recent attendance data
        const recentData = await getRecentAttendance(10);
        setRecentAttendance(Array.isArray(recentData) ? recentData : []);

        // Fetch attendance summary
        const summary = await getAttendanceSummary();
        setSummaryData(summary || { overall: 0, present: 0, absent: 0, late: 0, total: 0 });

        // Fetch calendar data for current month
        const today = new Date();
        const calendar = await getAttendanceCalendar(today.getFullYear(), today.getMonth());
        setCalendarData(calendar || { year: today.getFullYear(), month: today.getMonth(), days: [] });

        // Fetch trend data
        const trend = await getAttendanceTrend();
        setTrendData(Array.isArray(trend) ? trend : []);
      } catch (err) {
        setError('Failed to load attendance data. Please try again later.');
        console.error('Error fetching attendance data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-100">
        <div className="text-center py-12 text-gray-500">Loading attendance data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-100">
        <div className="text-center py-12 text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-100 space-y-6">
      <AttendanceSummary 
        overall={summaryData.overall}
        present={summaryData.present}
        absent={summaryData.absent}
        late={summaryData.late}
      />
      <AttendanceCalendar 
        year={calendarData.year}
        month={calendarData.month}
        days={calendarData.days}
      />
      <AttendanceTrend trendData={trendData} />
      {/* Recent Attendance Table */}
      <AttendanceTable recent={recentAttendance} />
    </div>
  );
};

export default Attendance;
