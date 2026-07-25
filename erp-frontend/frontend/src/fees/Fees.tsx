import { useEffect, useState } from "react";
import api from "../api";

interface FeeRecord {
  id: number;
  studentName: string;
  studentId: string;
  feeType: string;
  amount: number;
  dueDate: string;
  status: string;
  lastPayment?: {
    amount: number;
    paymentMethod: string;
    paidAt: string;
  };
}

const Fees = () => {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [paymentPayload, setPaymentPayload] = useState({ studentId: "", amount: "", paymentMethod: "Cash" });

  useEffect(() => {
    fetchFees();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const fetchFees = async () => {
    try {
      const response = await api.get("/fees");
      const payload = response?.data?.data ?? response?.data ?? [];
      setFees(Array.isArray(payload) ? payload : []);
    } catch (error) {
      console.error("Failed to load fees", error);
      setToast({ message: "Unable to load fees.", type: "error" });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await api.post("/fees/pay", {
        studentId: paymentPayload.studentId,
        amount: Number(paymentPayload.amount),
        paymentMethod: paymentPayload.paymentMethod,
      });

      setToast({ message: "Payment recorded successfully.", type: "success" });
      setPaymentPayload({ studentId: "", amount: "", paymentMethod: "Cash" });
      await fetchFees();
    } catch (error) {
      setToast({ message: "Failed to record payment.", type: "error" });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Fees Management</h1>
          <p className="text-gray-500">Manage fee records and record payments.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Record Payment</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            required
            value={paymentPayload.studentId}
            onChange={(event) => setPaymentPayload({ ...paymentPayload, studentId: event.target.value })}
            placeholder="Student ID"
            className="border border-gray-300 rounded-lg p-2"
          />
          <input
            required
            type="number"
            min="1"
            value={paymentPayload.amount}
            onChange={(event) => setPaymentPayload({ ...paymentPayload, amount: event.target.value })}
            placeholder="Amount"
            className="border border-gray-300 rounded-lg p-2"
          />
          <select
            value={paymentPayload.paymentMethod}
            onChange={(event) => setPaymentPayload({ ...paymentPayload, paymentMethod: event.target.value })}
            className="border border-gray-300 rounded-lg p-2"
          >
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
          <button type="submit" className="md:col-span-3 bg-[#3949ab] hover:bg-[#283593] text-white px-4 py-2 rounded-lg font-semibold">
            Record Payment
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4">Student</th>
              <th className="p-4">Fee Type</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Due Date</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((fee) => (
              <tr key={fee.id} className="border-t border-gray-100">
                <td className="p-4">
                  <div className="font-semibold">{fee.studentName}</div>
                  <div className="text-sm text-gray-500">{fee.studentId}</div>
                </td>
                <td className="p-4">{fee.feeType}</td>
                <td className="p-4">${fee.amount}</td>
                <td className="p-4">{fee.dueDate}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${fee.status === "Paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {fee.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-[60] px-4 py-3 rounded-lg shadow-lg text-white font-semibold ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Fees;
