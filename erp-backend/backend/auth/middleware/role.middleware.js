"use strict";

const {
    getClientForUser,
} = require("../../services/database.service");

const AUTH_MESSAGES = require("../constants/authMessages");

const isDevelopment = process.env.NODE_ENV !== "production";
const DEV_MOCK_TOKENS = new Set([
    "dev-mock-token",
    "dev-mock-token-admin",
    "dev-mock-token-teacher",
    "dev-mock-token-student",
    "dev-mock-token-parent",
]);

/**
 * Authorize user roles.
 */
function authorizeRoles(...allowedRoles) {
    if (allowedRoles.length === 0) {
        throw new Error(
            AUTH_MESSAGES.INVALID_ROLE_CONFIGURATION
        );
    }

    return async function (req, res, next) {
        const { user } = req;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: AUTH_MESSAGES.UNAUTHORIZED,
            });
        }

        try {
            const authorizationHeader = req.get("Authorization");

            if (!authorizationHeader) {
                return res.status(401).json({
                    success: false,
                    message: AUTH_MESSAGES.UNAUTHORIZED,
                });
            }

            const [, token] = authorizationHeader.split(" ");

            if (isDevelopment && DEV_MOCK_TOKENS.has(token)) {
                req.user.role = "admin";
                return next();
            }

            const supabase = getClientForUser(token);

            const {
                data,
                error,
            } = await supabase
                .from("users")
                .select("role")
                .eq("id", user.id)
                .single();
       

            if (error || !data) {
                return res.status(403).json({
                    success: false,
                    message: AUTH_MESSAGES.FORBIDDEN,
                });
            }

            if (!allowedRoles.includes(data.role)) {
                return res.status(403).json({
                    success: false,
                    message: AUTH_MESSAGES.FORBIDDEN,
                });
            }

            // Make role available to downstream middleware/controllers
            req.user.role = data.role;

            return next();
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message:
                    AUTH_MESSAGES.INTERNAL_SERVER_ERROR,
            });
        }
    };
}

module.exports = Object.freeze({
    authorizeRoles,
});