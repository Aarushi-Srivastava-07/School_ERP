const { getClientForUser } = require('../../services/database.service');
const cache = require('../utils/cache');

// TTL for aggregate counts (students, teachers, classes, pass rate).
// These change rarely — 5 minutes is a safe window.
const COUNTS_TTL_MS = 5 * 60 * 1000;

// TTL for today's attendance rate — shorter because teachers mark attendance
// throughout the school day. 1 minute keeps it reasonably fresh.
const ATTENDANCE_TTL_MS = 60 * 1000;

const getDashboardReport = async (req, res) => {
    try {
        const authHeader = req.get('Authorization');
        if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
            return res.status(401).json({ success: false, message: 'Invalid or missing token' });
        }
        const token = authHeader.split(' ')[1];

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // Two separate cache keys with different TTLs.
        // Keys are global (not user-scoped) because this ERP is single-tenant:
        // all admins/principals query identical data with no per-user RLS divergence.
        const AGGREGATES_KEY = 'dashboard:aggregates';
        const ATTENDANCE_KEY = `dashboard:attendance:${today}`;

        const cachedAggregates = cache.get(AGGREGATES_KEY);
        const cachedAttendance = cache.get(ATTENDANCE_KEY);

        // Both cache hits — return instantly
        if (cachedAggregates && cachedAttendance) {
            return res.json({
                success: true,
                cached: true,
                data: { ...cachedAggregates, ...cachedAttendance }
            });
        }

        const supabase = getClientForUser(token);

        // Build only the queries we actually need
        const queries = [];
        const queryKeys = [];

        if (!cachedAggregates) {
            queries.push(
                supabase.from('exam_marks').select('marks_obtained, passing_marks'),
                supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
                supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
                supabase.from('classes').select('*', { count: 'exact', head: true })
            );
            queryKeys.push('results', 'students', 'teachers', 'classes');
        }

        if (!cachedAttendance) {
            queries.push(
                supabase.from('attendance_records').select('status').eq('date', today)
            );
            queryKeys.push('attendance');
        }

        const results = await Promise.all(queries);

        // Map results back to named variables
        const byKey = {};
        queryKeys.forEach((key, i) => { byKey[key] = results[i]; });

        // Check for errors
        for (const key of queryKeys) {
            if (byKey[key]?.error) throw byKey[key].error;
        }

        // Compute and cache aggregates if they were missing
        let aggregates = cachedAggregates;
        if (!cachedAggregates) {
            const resultsData = byKey.results.data || [];
            let passCount = 0;
            resultsData.forEach(r => {
                if (Number(r.marks_obtained) >= Number(r.passing_marks)) passCount++;
            });
            const passRate = resultsData.length > 0 ? ((passCount / resultsData.length) * 100).toFixed(2) : 0;

            aggregates = {
                totalStudents: byKey.students.count || 0,
                totalTeachers: byKey.teachers.count || 0,
                totalClasses: byKey.classes.count || 0,
                recentPassRate: `${passRate}%`,
            };
            cache.set(AGGREGATES_KEY, aggregates, COUNTS_TTL_MS);
        }

        // Compute and cache today's attendance if it was missing
        let attendanceStat = cachedAttendance;
        if (!cachedAttendance) {
            const todayAttendance = byKey.attendance.data || [];
            let todayPresent = 0;
            todayAttendance.forEach(a => {
                if (a.status === 'present' || a.status === 'late') todayPresent++;
            });
            const todayAttendanceRate = todayAttendance.length > 0
                ? ((todayPresent / todayAttendance.length) * 100).toFixed(2)
                : 0;
            attendanceStat = { todayAttendanceRate: `${todayAttendanceRate}%` };
            cache.set(ATTENDANCE_KEY, attendanceStat, ATTENDANCE_TTL_MS);
        }

        return res.json({
            success: true,
            data: { ...aggregates, ...attendanceStat }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getDashboardReport };
