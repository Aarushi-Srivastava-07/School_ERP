// Dashboard page without duplicate sidebar and trend
import StudentHeader from "../components/StudentHeader";
import DashboardStats from "../components/DashboardStats";
import TodaySchedule from "../components/TodaySchedule";
import RecentAssignments from "../components/RecentAssignments";
import UpcomingExams from "../components/UpcomingExams";
import NotificationsPanel from "../components/NotificationsPanel";

const Dashboard = () => {
  return (
    <>
      <StudentHeader />
      <DashboardStats />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-2">
          <TodaySchedule />
          <UpcomingExams />
        </div>
        <div>
          <RecentAssignments />
          <NotificationsPanel />
        </div>
      </div>
    </>
  );
};

export default Dashboard;