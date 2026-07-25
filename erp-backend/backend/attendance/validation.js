const validateAttendanceDate = (dateString) => {
    const inputDate = new Date(dateString);
    if (isNaN(inputDate.getTime())) {
        return { valid: false, message: "Invalid date format." };
    }

    const currentDate = new Date();
    
    const inputYear = inputDate.getFullYear();
    const inputMonth = inputDate.getMonth();
    const inputDay = inputDate.getDate();

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();

    if (
        inputYear > currentYear ||
        (inputYear === currentYear && inputMonth > currentMonth) ||
        (inputYear === currentYear && inputMonth === currentMonth && inputDay > currentDay)
    ) {
        return { valid: false, message: "Attendance date cannot be in the future." };
    }

    return { valid: true };
};

const validateAttendanceStatus = (status) => {
    const allowedStatuses = ['present', 'absent', 'late'];
    if (!allowedStatuses.includes(status?.toLowerCase())) {
        return { valid: false, message: "Status must be 'present', 'absent', or 'late'." };
    }
    return { valid: true };
};

module.exports = { validateAttendanceDate, validateAttendanceStatus };