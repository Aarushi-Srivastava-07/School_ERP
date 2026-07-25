import { FC, useEffect, useState } from "react";
import AttendanceSummary from "../components/AttendanceSummary";
import AttendanceCalendar from "../components/AttendanceCalendar";
import AttendanceTrend from "../components/AttendanceTrend";
import AttendanceTable from "../components/AttendanceTable";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

const Attendance: FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Real data state
  const [recentRecords, setRecentRecords] = useState<{ date: string; status: "Present" | "Absent" }[]>([]);
  const [percentage, setPercentage] = useState(0);

  // Mock data fallback structure
  const mockAttendanceData = {
    percentage: 92,
    monthly: [
      { month: "January", percent: 95 },
      { month: "February", percent: 90 },
      { month: "March", percent: 93 },
      { month: "April", percent: 91 },
      { month: "May", percent: 94 },
    ],
    recent: [
      { date: "2023-05-01", status: "Present" },
      { date: "2023-04-30", status: "Present" },
      { date: "2023-04-29", status: "Absent" },
      { date: "2023-04-28", status: "Present" },
      { date: "2023-04-27", status: "Present" },
    ] as { date: string; status: "Present" | "Absent" }[],
  };

  useEffect(() => {
    if (!user) return;
    
    api.get('/attendance/view')
      .then(res => {
         if (res.data && res.data.data && res.data.data.length > 0) {
             // Map backend records to UI format
             const formattedRecords = res.data.data.map((r: any) => ({
                 date: r.date,
                 status: r.status // Assuming the backend returns "Present" or "Absent"
             }));
             setRecentRecords(formattedRecords);
             
             // Calculate a rough percentage
             const presentCount = formattedRecords.filter((r: any) => r.status === 'Present').length;
             setPercentage(Math.round((presentCount / formattedRecords.length) * 100) || 0);
         } else {
             // Use mock data if backend has no records yet
             setRecentRecords(mockAttendanceData.recent);
             setPercentage(mockAttendanceData.percentage);
         }
      })
      .catch(err => {
         console.error("Failed to fetch attendance:", err);
         setRecentRecords(mockAttendanceData.recent);
         setPercentage(mockAttendanceData.percentage);
      })
      .finally(() => {
         setLoading(false);
      });
  }, [user]);

  if (loading) {
     return <div className="p-6 text-center text-gray-500">Loading attendance data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-100 space-y-6">
      {/* We pass percentage down to Summary if it supported it, but it seems it handles its own static state currently */}
      <AttendanceSummary />
      <AttendanceCalendar />
      <AttendanceTrend />
      <AttendanceTable recent={recentRecords} />
    </div>
  );
};

export default Attendance;
