function isAuthorized(req, res, callback) {
    return callback(null, req);
}

module.exports = isAuthorized;