"use strict";

const authService = require("../services/auth.service");

/**
 * Send successful API response.
 */
function sendResponse(res, statusCode, data) {
    return res.status(statusCode).json({
        success: true,
        data,
    });
}

/**
 * Handle API errors.
 */
function handleError(res, error) {
    return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Something went wrong.",
    });
}

/**
 * Login user.
 */
async function login(req, res) {
    try {
        const result = await authService.login(req.body);

        return sendResponse(res, 200, result);
    } catch (error) {
        return handleError(res, error);
    }
}

/**
 * Logout authenticated user.
 */
async function logout(req, res) {
    try {
        const result = await authService.logout(req.user);

        return sendResponse(res, 200, result);
    } catch (error) {
        return handleError(res, error);
    }
}

/**
 * Get currently authenticated user.
 */
async function getCurrentUser(req, res) {
    try {
        const result = await authService.getCurrentUser(req.user);

        return sendResponse(res, 200, result);
    } catch (error) {
        return handleError(res, error);
    }
}

module.exports = Object.freeze({
    login,
    logout,
    getCurrentUser,
});