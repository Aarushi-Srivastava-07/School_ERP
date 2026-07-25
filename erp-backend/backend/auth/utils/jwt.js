"use strict";



function generateToken() {
    throw new Error(
        "generateToken() is deprecated. Use Supabase Authentication."
    );
}

function verifyToken() {
    throw new Error(
        "verifyToken() is deprecated. Use supabase.auth.getUser(token)."
    );
}

function decodeToken() {
    throw new Error(
        "decodeToken() is deprecated. Use Supabase Authentication."
    );
}

module.exports = Object.freeze({
    generateToken,
    verifyToken,
    decodeToken,
});