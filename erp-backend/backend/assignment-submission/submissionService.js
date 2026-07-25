const submissionStore = require("./submissionStore");
const { getClientForUser } = require("../services/database.service");
function readUser(req) {
    return req.user || req.currentUser || {};
}

function requireStudent(user) {
    const role = String(user.role || "").toLowerCase();

    if (role !== "student") {
        const error = new Error(
            "Only students can submit assignments."
        );
        error.statusCode = 403;
        throw error;
    }
}

function validateStudentOwnership(payload, user) {
    if (
        payload.studentId &&
        String(payload.studentId) !== String(user.id)
    ) {
        const error = new Error(
            "You can only submit your own assignment."
        );
        error.statusCode = 403;
        throw error;
    }
}

function validateSubmission(payload, file) {
    const assignmentId = String(payload.assignmentId || "").trim();

    if (!assignmentId) {
        const error = new Error("Assignment ID is required.");
        error.statusCode = 400;
        throw error;
    }

    if (!file) {
        const error = new Error("Assignment file is required.");
        error.statusCode = 400;
        throw error;
    }

    return assignmentId;
}

function calculateSubmissionStatus(dueDate, isSubmitted = true) {

    if (!isSubmitted) {
        return "pending";
    }

    if (!dueDate) {
        return "submitted";
    }

    const today = new Date();
    const assignmentDueDate = new Date(dueDate);

    today.setHours(0, 0, 0, 0);
    assignmentDueDate.setHours(0, 0, 0, 0);

    return today > assignmentDueDate
        ? "late"
        : "submitted";
}

async function submitAssignment(payload, file, user, authHeader) {

    requireStudent(user);

    validateStudentOwnership(payload, user);

    const assignmentId = validateSubmission(payload, file);

    const existingSubmission =
        await submissionStore.findSubmissionByAssignmentAndStudent(
            assignmentId,
            user.id,
            authHeader
        );

    if (existingSubmission) {
        const error = new Error(
            "Assignment already submitted."
        );
        error.statusCode = 409;
        throw error;
    }

    const assignment =
        await submissionStore.getAssignmentDueDate(
            assignmentId,
            authHeader
        );

    if (!assignment) {
        const error = new Error("Assignment not found.");
        error.statusCode = 404;
        throw error;
    }

    const submissionStatus =
        calculateSubmissionStatus(assignment.due_date);

    return await submissionStore.addSubmission(
        {
            assignment_id: assignmentId,
            student_id: user.id,
            file_name: file.originalname,
            file_type: file.mimetype,
            file_size: file.size,
            status: submissionStatus,
            submitted_at: new Date().toISOString()
        },
        file,
        authHeader
    );
}

async function getSubmissionStatus(assignmentId, user, authHeader) {

    requireStudent(user);

    const submission =
        await submissionStore.findSubmissionStatus(
            assignmentId,
            user.id,
            authHeader
        );

    if (!submission) {
        return {
            assignmentId,
            studentId: user.id,
            status: "pending"
        };
    }

    return {
        assignmentId,
        studentId: user.id,
        status: submission.status,
        submittedAt: submission.submitted_at
    };
}

async function getStudentSubmissions(user, authHeader) {

    requireStudent(user);

    return await submissionStore.findStudentSubmissions(
        user.id,
        authHeader
    );
}

async function getAssignmentSubmissions(
    assignmentId,
    user,
    authHeader
) {

    const role = String(user.role || "").toLowerCase();

    if (
        role !== "teacher" &&
        role !== "admin" &&
        role !== "principal"
    ) {
        const error = new Error(
            "Only teachers, principals, and admins can view assignment submissions."
        );
        error.statusCode = 403;
        throw error;
    }

    return await submissionStore.findAssignmentSubmissions(
        assignmentId,
        authHeader
    );
}

async function downloadSubmission(id, user, authHeader) {

    const submission =
        await submissionStore.findSubmission(
            id,
            authHeader
        );

    if (!submission) {
        const error = new Error("Submission not found.");
        error.statusCode = 404;
        throw error;
    }

    const role = String(user.role || "").toLowerCase();

    if (role === "student") {
        if (String(submission.student_id) !== String(user.id)) {
            const error = new Error(
                "You are not authorized to access this submission."
            );
            error.statusCode = 403;
            throw error;
        }
    }

    if (role === "parent") {
        const error = new Error(
            "You are not authorized to access this submission."
        );
        error.statusCode = 403;
        throw error;
    }

    const downloadUrl =
    await submissionStore.createDownloadUrl(
        submission.file_url,
        authHeader
    );

return {
    ...submission,
    downloadUrl
};
}

module.exports = {
    submitAssignment,
    getSubmissionStatus,
    getStudentSubmissions,
    getAssignmentSubmissions,
    downloadSubmission,
    readUser
};