
import React from "react";

type Insight = {
  icon: string;
  title: string;
  description: string;
};

type AttendanceInsightsProps = {
  insights?: Insight[];
};

export const AttendanceInsights: React.FC<AttendanceInsightsProps> = ({
  insights = [],
}) => {
  const safeInsights = Array.isArray(insights) ? insights : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Attendance Insights
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {safeInsights.map((insight, index) => (
          <div
            key={index}
            className="p-4 bg-blue-50 rounded-lg border border-blue-100"
          >
            <div className="text-3xl mb-2">{insight.icon}</div>
            <h3 className="text-sm font-semibold text-gray-800 mb-1">
              {insight.title}
            </h3>
            <p className="text-xs text-gray-600">{insight.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
