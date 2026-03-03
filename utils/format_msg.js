/**
 * @param {string} message message to display 
 * @param {*} result response data
 * @param {boolean} error response boolean
 */
exports.format_msg = (message, result = null, error = false) => ({ message, result, error })