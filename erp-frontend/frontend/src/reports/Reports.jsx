import React, { useState } from "react";
import api from "../api";
import { exportReportToPDF } from "../utils/exportPDF";
import { exportReportToExcel } from "../utils/exportExcel";

export default function Reports() {
  const [toast, setToast] = useState(null);
  const reports = [
    { title: "Student Reports", desc: "Admission trends, demographics, and active student lists.", icon: "🎓", color: "bg-blue-50 text-blue-600" },
    { title: "Teacher Reports", desc: "Staff allocation, attendance, and performance metrics.", icon: "👨‍🏫", color: "bg-indigo-50 text-indigo-600" },
    { title: "Attendance Reports", desc: "Daily, weekly, and monthly attendance summaries.", icon: "📅", color: "bg-green-50 text-green-600" },
    { title: "Examination Reports", desc: "Class-wise academic performance and grade distributions.", icon: "📑", color: "bg-yellow-50 text-yellow-600" },
    { title: "Fee Reports", desc: "Collection summaries, pending dues, and financial health.", icon: "💳", color: "bg-red-50 text-red-600" },
    { title: "Library Reports", desc: "Book issuance, overdue returns, and inventory status.", icon: "📚", color: "bg-purple-50 text-purple-600" },
  ];

  const fetchDataForReport = async (title) => {
    let response;
    if (title === "Student Reports") {
      response = await api.get("/students");
    } else if (title === "Teacher Reports") {
      response = await api.get("/teachers");
    } else if (title === "Attendance Reports") {
      response = await api.get("/reports/attendance");
    } else if (title === "Examination Reports") {
      response = await api.get("/exams");
    } else if (title === "Library Reports") {
      response = await api.get("/library/books");
    } else if (title === "Fee Reports") {
      response = await api.get("/fees");
    } else {
      return [];
    }
    return response?.data?.data ?? response?.data ?? [];
  };

  const formatReportData = (payload) => {
    const dataArray = Array.isArray(payload) ? payload : [payload];
    if (dataArray.length === 0 || !dataArray[0] || typeof dataArray[0] !== 'object') {
      return { columns: ["Notice"], rows: [["No data available"]] };
    }
    
    // Auto-generate columns from the first object, ignoring complex objects and IDs
    let columns = Object.keys(dataArray[0]).filter(key => typeof dataArray[0][key] !== 'object' && key !== '_id' && key !== 'id' && key !== 'password');
    let rows = dataArray.map(item => columns.map(col => String(item[col] ?? "—")));
    
    // Title case the headers
    columns = columns.map(col => col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1').trim());
    return { columns, rows, dataArray };
  };

  const handleExportExcel = async (report) => {
    try {
      showToast("Preparing Excel report…", "success");
      const payload = await fetchDataForReport(report.title);
      const { columns, rows } = formatReportData(payload);
      
      const fileName = `${report.title.replace(/[^\w-]+/g, "_")}_Report`;

      exportReportToExcel({
        sheetName: report.title,
        columns,
        rows,
        fileName,
      });
      showToast("Excel downloaded successfully.", "success");
    } catch (error) {
      console.error(error);
      showToast("Unable to load report data for Excel export.", "error");
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3000);
  };

  const handleExportPdf = async (report) => {
    try {
      showToast("Preparing PDF report…", "success");
      const payload = await fetchDataForReport(report.title);
      const { columns, rows, dataArray } = formatReportData(payload);
      
      const fileName = `${report.title.replace(/[^\w-]+/g, "_")}_Report`;

      exportReportToPDF({
        title: report.title,
        summary: [
          { label: "Report", value: report.title },
          { label: "Description", value: report.desc },
          { label: "Generated", value: new Date().toLocaleString() },
          { label: "Total Records", value: dataArray ? dataArray.length : 0 }
        ],
        columns,
        rows,
        fileName,
      });

      showToast("PDF downloaded successfully.", "success");
    } catch (error) {
      console.error(error);
      showToast("Unable to load report data for PDF export.", "error");
    }
  };

  return (
    <div className="bg-[#f4f5fb] min-h-[80vh] font-sans p-6 rounded-xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1f36]">Reports ;& Analytics</h1>
          <p className="text-gray-500 text-sm">Comprehensive school performance and operational reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <div key={report.title} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-4 ${report.color}`}>
              {report.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{report.title}</h3>
            <p className="text-sm text-gray-500 mb-6 min-h-[40px]">{report.desc}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleExportPdf(report)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
              >
                <span>📄</span> Export PDF
              </button>
              <button
                onClick={() => handleExportExcel(report)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
              >
                <span>📊</span> Export Excel
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Analytics Overview</h3>
        <div className="h-64 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 italic">
          [Charts & Graphs Dashboard Area]
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-[60] px-4 py-3 rounded-lg shadow-lg text-white font-semibold ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
