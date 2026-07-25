const express = require("express");

const router = express.Router();
const upload = require("./uploadMiddleware");
const { authenticateToken } = require("../auth/middleware/auth.middleware");
const { authorizeRoles } = require("../auth/middleware/role.middleware");

const {
    submitAssignment,
    getSubmissionStatus,
    getStudentSubmissions,
    getAssignmentSubmissions,
    downloadSubmission
} = require("./submissionController");

router.post(
    "/submit",
    authenticateToken,
    authorizeRoles("student"),
    upload.single("file"),
    submitAssignment
);

router.get(
    "/status/:assignmentId",
    authenticateToken,
    authorizeRoles("student"),
    getSubmissionStatus
);

router.get(
    "/student",
    authenticateToken,
    authorizeRoles("student"),
    getStudentSubmissions
);

router.get(
    "/assignment/:assignmentId",
    authenticateToken,
    authorizeRoles("teacher", "admin", "principal"),
    getAssignmentSubmissions
);

router.get(
    "/download/:submissionId",
    authenticateToken,
    downloadSubmission
);

module.exports = router;