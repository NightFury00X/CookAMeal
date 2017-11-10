let RequestMethods = {};

RequestMethods.GET = function (req, res, next) {
    if (req.method !== 'GET') {
        res.end(req.method.toUpperCase() + ' method not supported');
    } else {
        next();
    }
};

RequestMethods.POST = function (req, res, next) {
    if (req.method !== 'POST') {
        res.end(req.method.toUpperCase() + ' method not supported');
    } else {
        next();
    }
};

module.exports = RequestMethods;

