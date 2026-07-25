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

async function authenticateToken(req, res, next) {
    const authorizationHeader = req.get("Authorization");

    if (!authorizationHeader) {
        return res.status(401).json({
            success: false,
            message: AUTH_MESSAGES.TOKEN_REQUIRED,
        });
    }

    const [scheme, token] = authorizationHeader.split(" ");

    if (
        scheme?.toLowerCase() !== "bearer" ||
        !token?.trim()
    ) {
        return res.status(401).json({
            success: false,
            message: AUTH_MESSAGES.INVALID_TOKEN,
        });
    }

    try {
        if (isDevelopment && DEV_MOCK_TOKENS.has(token)) {
            req.user = {
                id: token,
                email: `${token}@local.dev`,
                role: token.includes("admin") ? "admin" : token.includes("teacher") ? "teacher" : token.includes("student") ? "student" : token.includes("parent") ? "parent" : "user",
                token,
            };
            return next();
        }

        const supabase = getClientForUser(token);

        const {
            data,
            error,
        } = await supabase.auth.getUser(token);

        if (error || !data?.user) {
            return res.status(401).json({
                success: false,
                message: AUTH_MESSAGES.INVALID_TOKEN,
            });
        }

         req.user = {
    ...data.user,
    token,
};
        return next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message:
                error.message ||
                AUTH_MESSAGES.INVALID_TOKEN,
        });
    }
}

module.exports = Object.freeze({
    authenticateToken,
});