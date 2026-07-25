"use strict";

const AUTH_MESSAGES = Object.freeze({

    /* Success */
    LOGIN_SUCCESS: "Login successful.",
    LOGOUT_SUCCESS: "Logout successful.",

    /* Authentication */
    LOGIN_REQUIRED: "Please log in to continue.",
    INVALID_CREDENTIALS: "Invalid email or password.",
    UNAUTHORIZED: "Unauthorized access.",
    FORBIDDEN: "You do not have permission to access this resource.",

    /* Authorization */
    INVALID_ROLE_CONFIGURATION:
        "At least one role must be provided for authorization.",

    /* JWT */
    TOKEN_REQUIRED: "Authentication token is required.",
    INVALID_TOKEN: "Invalid authentication token.",
    TOKEN_EXPIRED:
        "Authentication token has expired. Please log in again.",

    /* Account Security */
    ACCOUNT_LOCKED:
        "Your account has been temporarily locked due to multiple failed login attempts. Please try again after 5 minutes.",

    ACCOUNT_INACTIVE:
        "Your account is inactive. Please contact the administrator.",

    /* Validation */
    INVALID_REQUEST: "Invalid request data.",
    EMAIL_REQUIRED: "Email is required.",
    INVALID_EMAIL: "Please provide a valid email address.",
    PASSWORD_REQUIRED: "Password is required.",
    INVALID_PASSWORD: "Password must be a valid string.",

    /* Server */
    INTERNAL_SERVER_ERROR:
        "An unexpected server error occurred. Please try again later.",
});

module.exports = AUTH_MESSAGES;