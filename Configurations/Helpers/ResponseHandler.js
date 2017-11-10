log = require('../Libs/log')(module);

module.exports = {
    setSuccessResponse: function (data, res, statusCode) {
        let response = {
            "success": true,
            result: data,
            "error": []
        };
        this.setResponse(statusCode, response, res);
    },
    setErrorResponse: function (errors, res, statusCode) {
        let response = {
            "success": false,
            data: [],
            "error": errors
        };
        this.setResponse(statusCode, response, res);
    },
    setResponse: function (status, response, res) {
        res.status(status).json(response);
        res.end();
    }
};