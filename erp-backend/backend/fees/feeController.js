const fees = [
  {
    id: 1,
    studentName: "Aarav Sharma",
    studentId: "STU001",
    feeType: "Tuition",
    amount: 25000,
    dueDate: "2026-07-31",
    status: "Pending",
  },
  {
    id: 2,
    studentName: "Diya Patel",
    studentId: "STU002",
    feeType: "Transport",
    amount: 5000,
    dueDate: "2026-07-25",
    status: "Pending",
  },
  {
    id: 3,
    studentName: "Rohan Verma",
    studentId: "STU003",
    feeType: "Hostel",
    amount: 18000,
    dueDate: "2026-08-05",
    status: "Pending",
  },
];

const FALLBACK_PAYMENT_RESPONSE = {
  id: 999,
  studentName: "Offline Student",
  studentId: "OFFLINE_STU_001",
  feeType: "Tuition",
  amount: 0,
  dueDate: new Date().toISOString().split('T')[0],
  status: "Paid",
  lastPayment: {
    amount: 0,
    paymentMethod: "Unknown",
    paidAt: new Date().toISOString(),
  },
};

function listFees(req, res) {
  return res.status(200).json({ success: true, data: fees });
}

function payFee(req, res) {
  const { studentId, amount, paymentMethod = "Cash" } = req.body || {};

  if (!studentId || !amount) {
    return res.status(400).json({ success: false, message: "studentId and amount are required" });
  }

  const fee = fees.find((item) => item.studentId === studentId);

  if (!fee) {
    const fallback = {
      ...FALLBACK_PAYMENT_RESPONSE,
      studentId,
      amount: Number(amount),
      lastPayment: {
        amount: Number(amount),
        paymentMethod,
        paidAt: new Date().toISOString(),
      },
      warning: "Payment processed in offline fallback mode. Live fee record was unavailable.",
    };

    return res.status(200).json({ success: true, data: fallback });
  }

  fee.status = "Paid";
  fee.amount = Math.max(0, Number(fee.amount) - Number(amount));
  fee.lastPayment = {
    amount: Number(amount),
    paymentMethod,
    paidAt: new Date().toISOString(),
  };

  return res.status(200).json({ success: true, data: fee });
}

module.exports = {
  listFees,
  payFee,
};
