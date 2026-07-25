const multer = require("multer");

// Allowed MIME types
const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

// Store file in memory
const storage = multer.memoryStorage();

// Sanitize filename
const sanitizeFileName = (filename) => {
    return filename
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .replace(/_+/g, "_");
};

// Validate file
const fileFilter = (req, file, cb) => {

    // Check MIME type
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(
            new Error("Only PDF, DOC, and DOCX files are allowed."),
            false
        );
    }

    // Sanitize original filename
    file.originalname = sanitizeFileName(file.originalname);

    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    }
});

module.exports = upload;