import { Activity } from "lucide-react";
import {
  ParentSection,
  ParentCard,
  CardHeader,
  EmptyState,
} from "./parentShared.jsx";

// Note: this intentionally does NOT read ERPContext's `activities` array —
// that log records admin CRUD events (student/teacher/parent record changes)
// and is not parent-facing content. A real parent-facing activity feed
// (attendance marked, marks published, assignment graded, etc.) requires a
// backend feed that doesn't exist yet, so a single honest empty state is
// shown instead of repurposing unrelated admin data.

function ChildActivity() {
  return (
    <ParentSection
      title="Child Activity"
      subtitle="Recent activity, teacher updates, and school notifications"
    >
      <ParentCard>
        <CardHeader
          icon={<Activity size={17} />}
          title="Recent Activity Feed"
        />

        <EmptyState
          icon="📭"
          title="No recent activity available."
          message="Recent activities, latest teacher updates, latest assignment updates, and school notifications will appear here once connected to the backend."
        />
      </ParentCard>
    </ParentSection>
  );
}

export default ChildActivity;