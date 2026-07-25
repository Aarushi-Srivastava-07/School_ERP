import { useEffect, useState } from "react";
import api from "../../api";

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalRevenue: 0,
    pendingFees: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/dashboard/stats");
        const payload = response?.data?.data ?? response?.data ?? {};
        setStats(payload);
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);

  const cards = [
    { title: "Total Students", value: stats.totalStudents.toLocaleString(), color: "text-blue-600" },
    { title: "Total Teachers", value: stats.totalTeachers.toLocaleString(), color: "text-purple-600" },
    { title: "Total Revenue", value: formatCurrency(stats.totalRevenue), color: "text-green-600" },
    { title: "Pending Fees", value: formatCurrency(stats.pendingFees), color: "text-orange-600" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cards.map((item) => (
        <div
          key={item.title}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md"
        >
          <p className="text-gray-500 text-sm">{item.title}</p>

          <h2 className={`text-3xl font-bold mt-2 ${item.color}`}>
            {item.value}
          </h2>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
