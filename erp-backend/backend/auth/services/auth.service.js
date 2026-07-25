"use strict";

const { createClient } = require("@supabase/supabase-js");

const DATABASE_CONFIG = require("../../config/database.config");
const AUTH_MESSAGES = require("../constants/authMessages");

const {
    SUPABASE: {
        URL,
        ANON_KEY,
    },
} = DATABASE_CONFIG;


const supabase = createClient(
    URL,
    ANON_KEY
);

/**
 * Handle user login.
 */
async function login(credentials) {
    if (!credentials) {
        const error = new Error(
            AUTH_MESSAGES.INVALID_REQUEST
        );

        error.statusCode = 400;

        throw error;
    }

    const {
        email,
        password,
    } = credentials;

    if (!email) {
        const error = new Error(
            AUTH_MESSAGES.EMAIL_REQUIRED
        );

        error.statusCode = 400;

        throw error;
    }

    if (!password) {
        const error = new Error(
            AUTH_MESSAGES.PASSWORD_REQUIRED
        );

        error.statusCode = 400;

        throw error;
    }

    const {
        data,
        error,
    } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        error.statusCode = error.status || 401;
        throw error;
    }

    return {
        message: AUTH_MESSAGES.LOGIN_SUCCESS,
        user: data.user,
        accessToken: data.session?.access_token,
        refreshToken: data.session?.refresh_token,
    };
}

/**
 * Handle user logout.
 */
async function logout(user) {
    if (!user) {
        const error = new Error(
            AUTH_MESSAGES.UNAUTHORIZED
        );

        error.statusCode = 401;

        throw error;
    }

    return {
        message: AUTH_MESSAGES.LOGOUT_SUCCESS,
    };
}

/**
 * Get authenticated user.
 */
async function getCurrentUser(user) {
    if (!user) {
        const error = new Error(
            AUTH_MESSAGES.UNAUTHORIZED
        );

        error.statusCode = 401;

        throw error;
    }

    return user;
}

module.exports = Object.freeze({
    login,
    logout,
    getCurrentUser,
});