const { getClientForUser } = require('../../services/database.service');

const getStudentPerformanceReport = async (req, res) => {
    try {
        const authHeader = req.get('Authorization');
        if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
            return res.status(401).json({ success: false, message: 'Invalid or missing token' });
        }
        const token = authHeader.split(' ')[1];
        const supabase = getClientForUser(token);
        
        const { studentId } = req.params;

        // IDOR Guard: Validate the requested studentId belongs to a class
        // the requester is authorized for. scopedClasses === null means Admin/Principal (full access).
        if (req.scopedClasses !== null) {
            const { data: memberCheck, error: memberError } = await supabase
                .from('attendance_records')
                .select('student_id')
                .eq('student_id', studentId)
                .in('class_id', req.scopedClasses)
                .limit(1);

            if (memberError) throw memberError;

            if (!memberCheck || memberCheck.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Forbidden: student does not belong to your assigned classes'
                });
            }
        }

        // Query 1: Fetch attendance records for the student (scoped to teacher's classes)
        let attendanceQuery = supabase
            .from('attendance_records')
            .select('status')
            .eq('student_id', studentId);
        if (req.scopedClasses !== null) {
            attendanceQuery = attendanceQuery.in('class_id', req.scopedClasses);
        }
        const { data: attendanceData, error: attendanceError } = await attendanceQuery;
        if (attendanceError) throw attendanceError;
        
        let presentDays = 0;
        const totalDays = attendanceData.length;
        attendanceData.forEach(record => {
            if (record.status === 'present' || record.status === 'late') presentDays++;
        });
        const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;
        
        // Query 2: Fetch exam marks for the student (scoped to teacher's classes)
        let marksQuery = supabase
            .from('exam_marks')
            .select('marks_obtained, max_marks')
            .eq('student_id', studentId);
        if (req.scopedClasses !== null) {
            marksQuery = marksQuery.in('class_id', req.scopedClasses);
        }
        const { data: marksData, error: marksError } = await marksQuery;
        if (marksError) throw marksError;
        
        let totalObtained = 0;
        let totalMax = 0;
        marksData.forEach(mark => {
            totalObtained += Number(mark.marks_obtained) || 0;
            totalMax += Number(mark.max_marks) || 0;
        });
        
        // Use average of percentages per exam, or total obtained / total max. 
        // We'll use total obtained / total max for a true weighted average.
        const averageMarks = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : 0;

        return res.json({
            success: true,
            data: {
                studentId,
                totalRecordedDays: totalDays,
                attendedDays: presentDays,
                attendancePercentage: `${attendancePercentage}%`,
                totalExams: marksData.length,
                averageMarks: `${averageMarks}%`
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getStudentPerformanceReport };

