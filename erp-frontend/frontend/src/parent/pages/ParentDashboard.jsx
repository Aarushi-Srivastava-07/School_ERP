import ChildProfileCard from "../components/ChildProfileCard.jsx";
import AcademicOverview from "../components/AcademicOverview.jsx";
import SchoolServices from "../components/SchoolServices.jsx";
import ChildActivity from "../components/ChildActivity.jsx";
import QuickActions from "../components/QuickActions.jsx";

function ParentDashboard() {
  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <ChildProfileCard />
      </div>
      <AcademicOverview />
      <SchoolServices />
      <ChildActivity />
      <QuickActions />
    </div>
  );
}

export default ParentDashboard;