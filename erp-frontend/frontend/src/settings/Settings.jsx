import React, { useState } from "react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("School");
  const [toast, setToast] = useState(null);

  const showToast = () => {
    setToast("Settings saved successfully!");
    setTimeout(() => setToast(null), 3000);
  };

  const tabs = ["School", "Academic Year", "Profile", "Theme", "Security", "Roles"];

  return (
    <div className="bg-[#f4f5fb] min-h-[80vh] font-sans p-6 rounded-xl relative">
      {toast && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-lg shadow-lg font-semibold text-white bg-green-500">
          {toast}
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1f36]">System Settings</h1>
          <p className="text-gray-500 text-sm">Manage global school configurations and preferences</p>
        </div>
        <button onClick={showToast} className="bg-[#3949ab] hover:bg-[#283593] text-white px-5 py-2.5 rounded-lg font-semibold transition-colors shadow-sm">
          Save Settings
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-64 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {tabs.map(t => (
            <button 
              key={t} 
              onClick={() => setActiveTab(t)}
              className={`w-full text-left px-5 py-3.5 font-semibold text-sm border-l-4 transition-colors ${
                activeTab === t ? 'border-l-[#3949ab] bg-blue-50 text-[#3949ab]' : 'border-l-transparent text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t} Settings
            </button>
          ))}
        </div>

        <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-6">{activeTab} Settings</h2>
          
          {activeTab === "School" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">School Name</label>
                <input defaultValue="Delhi Public School" className="w-full border border-gray-300 rounded-lg p-2.5 focus:border-[#3949ab] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Registration No.</label>
                <input defaultValue="SCH-9821-DEL" className="w-full border border-gray-300 rounded-lg p-2.5 focus:border-[#3949ab] outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
                <textarea rows={3} defaultValue="Sector 12, RK Puram, New Delhi" className="w-full border border-gray-300 rounded-lg p-2.5 focus:border-[#3949ab] outline-none"></textarea>
              </div>
            </div>
          )}

          {activeTab === "Academic Year" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Current Academic Year</label>
                <select className="w-full border border-gray-300 rounded-lg p-2.5 focus:border-[#3949ab] outline-none">
                  <option>2023-2024</option>
                  <option>2024-2025</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Term Setup</label>
                <select className="w-full border border-gray-300 rounded-lg p-2.5 focus:border-[#3949ab] outline-none">
                  <option>Semesters (2)</option>
                  <option>Trimesters (3)</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === "Profile" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <input defaultValue="Admin User" className="w-full border border-gray-300 rounded-lg p-2.5 focus:border-[#3949ab] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input defaultValue="admin@school.edu" type="email" className="w-full border border-gray-300 rounded-lg p-2.5 focus:border-[#3949ab] outline-none" />
              </div>
            </div>
          )}

          {activeTab === "Theme" && (
            <div>
              <p className="text-gray-600 text-sm mb-4">Choose your preferred application appearance.</p>
              <div className="flex gap-4">
                <div className="border-2 border-[#3949ab] bg-gray-50 p-4 rounded-lg cursor-pointer">
                  <div className="w-16 h-12 bg-white border shadow-sm mb-2"></div>
                  <div className="text-center text-sm font-semibold text-[#3949ab]">Light Mode</div>
                </div>
                <div className="border-2 border-transparent bg-gray-800 p-4 rounded-lg cursor-pointer opacity-50">
                  <div className="w-16 h-12 bg-gray-900 border border-gray-700 shadow-sm mb-2"></div>
                  <div className="text-center text-sm font-semibold text-white">Dark Mode (Beta)</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Security" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Current Password</label>
                <input type="password" placeholder="••••••••" className="w-full max-w-sm border border-gray-300 rounded-lg p-2.5 focus:border-[#3949ab] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                <input type="password" placeholder="••••••••" className="w-full max-w-sm border border-gray-300 rounded-lg p-2.5 focus:border-[#3949ab] outline-none" />
              </div>
            </div>
          )}

          {activeTab === "Roles" && (
            <div>
              <p className="text-gray-600 text-sm mb-4">Manage permissions for different user roles.</p>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-3 border-b">Role</th>
                    <th className="p-3 border-b text-center">Manage Users</th>
                    <th className="p-3 border-b text-center">Manage Fees</th>
                    <th className="p-3 border-b text-center">View Reports</th>
                  </tr>
                </thead>
                <tbody>
                  {['Administrator', 'Teacher', 'Accountant'].map((role, idx) => (
                    <tr key={role} className="border-b border-gray-100">
                      <td className="p-3 font-semibold text-gray-700">{role}</td>
                      <td className="p-3 text-center"><input type="checkbox" defaultChecked={idx === 0} className="w-4 h-4 accent-[#3949ab]" /></td>
                      <td className="p-3 text-center"><input type="checkbox" defaultChecked={idx !== 1} className="w-4 h-4 accent-[#3949ab]" /></td>
                      <td className="p-3 text-center"><input type="checkbox" defaultChecked className="w-4 h-4 accent-[#3949ab]" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
