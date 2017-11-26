module.exports = {
    setSuccessResponse: function (data, res, statusCode) {
        let response = {
            "success": true,
            data: data,
            "error": null
        };
        this.setResponse(statusCode, response, res);
    },
    setErrorResponse: function (errors, res, statusCode) {
        let response = {
            "success": false,
            data: null,
            "error": errors
        };
        this.setResponse(statusCode, response, res);
    },
    setResponse: function (status, response, res) {
        res.status(status).json(response);
        res.end();
    }
};