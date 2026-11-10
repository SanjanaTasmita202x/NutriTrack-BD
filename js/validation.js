// Shared generic validation helpers
// Pure functions with zero DOM coupling

/**
 * Validates email format using standard pattern
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const trimmed = email.trim();
    // Standard RFC-compliant lightweight regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed);
}

/**
 * Validates password meets minimum length requirement
 * @param {string} password
 * @param {number} minLength
 * @returns {boolean}
 */
function isValidPassword(password, minLength = 8) {
    if (!password || typeof password !== 'string') return false;
    return password.length >= minLength;
}

/**
 * Checks if two passwords match and are non-empty
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {boolean}
 */
function passwordsMatch(password, confirmPassword) {
    if (!password || !confirmPassword) return false;
    return password === confirmPassword;
}

/**
 * Validates that a value is a valid positive number
 * @param {any} val
 * @param {number|null} min
 * @param {number|null} max
 * @returns {boolean}
 */
function isValidPositiveNumber(val, min = 1, max = null) {
    const num = parseFloat(val);
    if (isNaN(num) || !isFinite(num)) return false;
    if (min !== null && num < min) return false;
    if (max !== null && num > max) return false;
    return true;
}

/**
 * Trims and sanitizes basic text input
 * @param {string} str
 * @returns {string}
 */
function sanitizeTextInput(str) {
    if (!str || typeof str !== 'string') return '';
    return str.trim();
}
