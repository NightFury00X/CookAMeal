function isAuthorized(req, res, next) {
   console.log('Req here: ', req.user);
}

module.exports = isAuthorized;