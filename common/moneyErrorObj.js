'use strict';

module.exports = function(actualErr, textErr, numErr) {
    let stubErr = {};
    stubErr.number = numErr || 400;
    stubErr.description = textErr;
    stubErr.stack = actualErr;
    return stubErr;
}
