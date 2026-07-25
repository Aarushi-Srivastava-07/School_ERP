import React, { useState, useEffect, useCallback } from "react";
import api from "../api";

const CLASS_OPTIONS = ["Grade 10 - A", "Grade 10 - B", "Grade 11 - A"];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const periods = ["P1 (8:00 - 8:45)", "P2 (8:45 - 9:30)", "Break (9:30 - 10:00)", "P3 (10:00 - 10:45)", "P4 (10:45 - 11:30)"];

/**
 * Transforms the flat array from the backend into a keyed schedule object:
 * { Monday: [{subject, teacher, room, isBreak}, ...], Tuesday: [...], ... }
 */
function buildScheduleFromRows(rows) {
  const schedule = {};
  days.forEach(day => {
    // Pre-fill all periods with empty slots
    schedule[day] = periods.map(p => ({
      subject: "Free Period",
      teacher: "-",
      room: "-",
      isBreak: p.includes("Break"),
    }));
  });

  rows.forEach(row => {
    const day = row.day;
    const idx = row.period_index;
    if (schedule[day] && idx >= 0 && idx < periods.length) {
      schedule[day][idx] = {
        subject: row.subject || "Free Period",
        teacher: row.teacher || "-",
        room: row.room || "-",
        isBreak: row.is_break || false,
      };
    }
  });

  return schedule;
}

export default function Timetable() {
  const [selectedClass, setSelectedClass] = useState("Grade 10 - A");
  const [schedule, setSchedule] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    day: days[0],
    periodIndex: 0,
    subject: "",
    teacher: "",
    room: "",
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch timetable from backend whenever selectedClass changes
  const fetchTimetable = useCallback(async () => {
    setIsLoading(true);
    setSchedule({});
    try {
      const res = await api.get(`/timetable/${encodeURIComponent(selectedClass)}`);
      const rows = res.data?.data ?? [];
      setSchedule(buildScheduleFromRows(rows));
    } catch (err) {
      console.error("Failed to fetch timetable:", err);
      showToast(
        err.response?.data?.error || "Could not load timetable from server.",
        "error"
      );
      setSchedule(buildScheduleFromRows([])); // render empty grid gracefully
    } finally {
      setIsLoading(false);
    }
  }, [selectedClass]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  const handleAddEntry = () => {
    setModalData({ day: days[0], periodIndex: 0, subject: "", teacher: "", room: "" });
    setIsModalOpen(true);
  };

  const handleEditEntry = (day, periodIndex, entry) => {
    setModalData({
      day,
      periodIndex,
      subject: entry?.subject === "Free Period" ? "" : entry?.subject || "",
      teacher: entry?.teacher === "-" ? "" : entry?.teacher || "",
      room: entry?.room === "-" ? "" : entry?.room || "",
    });
    setIsModalOpen(true);
  };

  const handleModalSave = async () => {
    setIsSubmitting(true);
    try {
      await api.post("/timetable/update", {
        className: selectedClass,
        day: modalData.day,
        periodIndex: modalData.periodIndex,
        subject: modalData.subject || "Free Period",
        teacher: modalData.teacher || "-",
        room: modalData.room || "-",
        isBreak: periods[modalData.periodIndex].includes("Break"),
      });

      setIsModalOpen(false);
      showToast("Timetable updated successfully!");

      // Re-fetch from backend so the UI is perfectly synced
      await fetchTimetable();
    } catch (err) {
      console.error("Error saving timetable entry:", err);
      showToast(
        err.response?.data?.error || "Failed to save. Please try again.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toastBg = toast?.type === "error" ? "bg-red-500" : "bg-green-500";

  return (
    <div className="bg-[#f4f5fb] min-h-[80vh] font-sans p-6 rounded-xl relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-lg shadow-lg font-semibold text-white ${toastBg} transition-all`}>
          {toast.msg}
        </div>
      )}

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-lg">Edit Timetable Entry</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Day</label>
                  <select
                    value={modalData.day}
                    onChange={(e) => setModalData({ ...modalData, day: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:border-[#3949ab] outline-none"
                  >
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Period</label>
                  <select
                    value={modalData.periodIndex}
                    onChange={(e) => setModalData({ ...modalData, periodIndex: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:border-[#3949ab] outline-none"
                  >
                    {periods.map((p, idx) => (
                      !p.includes("Break") && <option key={idx} value={idx}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={modalData.subject}
                  onChange={(e) => setModalData({ ...modalData, subject: e.target.value })}
                  placeholder="e.g. Mathematics"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:border-[#3949ab] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Teacher</label>
                <input
                  type="text"
                  value={modalData.teacher}
                  onChange={(e) => setModalData({ ...modalData, teacher: e.target.value })}
                  placeholder="e.g. Mr. Sharma"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:border-[#3949ab] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Room</label>
                <input
                  type="text"
                  value={modalData.room}
                  onChange={(e) => setModalData({ ...modalData, room: e.target.value })}
                  placeholder="e.g. 101"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:border-[#3949ab] outline-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleModalSave}
                disabled={isSubmitting}
                className={`px-5 py-2 rounded-lg font-semibold shadow-sm transition-colors text-white ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#3949ab] hover:bg-[#283593]"}`}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1f36]">Timetable Management</h1>
          <p className="text-gray-500 text-sm">Manage class schedules and teacher allocations</p>
        </div>
        <button onClick={handleAddEntry} className="bg-[#3949ab] hover:bg-[#283593] text-white px-5 py-2.5 rounded-lg font-semibold transition-colors shadow-sm">
          + Add Entry
        </button>
      </div>

      <div className="bg-white p-4 rounded-t-xl border-t border-l border-r border-gray-200 flex gap-4 items-center">
        <label className="text-sm font-semibold text-gray-700">Select Class:</label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 focus:border-[#3949ab] outline-none min-w-[150px]"
        >
          {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-gray-400 font-semibold">Loading schedule...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-[#f8f9fc]">
                  <th className="p-4 border border-gray-200 text-gray-500 font-bold uppercase text-xs w-[12%]">Day / Time</th>
                  {periods.map(p => <th key={p} className="p-4 border border-gray-200 text-gray-500 font-bold uppercase text-xs w-[17%]">{p}</th>)}
                </tr>
              </thead>
              <tbody>
                {days.map(day => {
                  const daySchedule = schedule[day] || Array(periods.length).fill({ subject: "Free Period", teacher: "-", room: "-" });
                  return (
                    <tr key={day}>
                      <td className="p-4 border border-gray-200 font-bold text-gray-700 bg-gray-50">{day}</td>
                      {periods.map((p, idx) => {
                        const entry = daySchedule[idx];
                        return (
                          <td key={idx} className={`border border-gray-200 p-2 ${entry?.isBreak || p.includes("Break") ? "bg-gray-100" : "hover:bg-blue-50 cursor-pointer group"}`}>
                            {entry?.isBreak || p.includes("Break") ? (
                              <span className="text-gray-400 font-semibold text-sm">BREAK</span>
                            ) : (
                              <div className="h-full w-full min-h-[60px] rounded-lg flex flex-col justify-center relative">
                                <div className="font-semibold text-[#3949ab] text-sm">{entry?.subject || "Free Period"}</div>
                                <div className="text-xs text-gray-500">{entry?.teacher || "-"}</div>
                                <div className="text-xs text-gray-400">{entry?.room && entry.room !== "-" ? `Room ${entry.room}` : "-"}</div>

                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditEntry(day, idx, entry);
                                    }}
                                    className="bg-white border border-gray-300 rounded p-1 text-xs hover:bg-gray-100 text-gray-600"
                                  >
                                    ✎
                                  </button>
                                </div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
