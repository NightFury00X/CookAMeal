let CommonMiddleware = {},
    db = require('../../Application/Modals'),
    CommonConfig = require("../Helpers/common-config");

CommonMiddleware.VarifyResetPasswordPassKey = async (req, res, next) => {
    try {
        let email = req.body.email;
        let isExists = await db.ResetPassword.findOne({
            where: {
                email: email,
                status: 1,
                is_valid: 1
            }
        });

        // If  record exists, handle it
        if (!isExists)
            return next();

        req.tokenData = {
            id: isExists.id,
            email: isExists.email,
            token: isExists.token.substring(4, isExists.length)
        };

        //Otherwise, return ok
        next();
    }
    catch (error) {
        next(error);
    }
};

CommonMiddleware.AccessToChangePassword = async (req, res, next) => {
    if (!req.user.id)
        return next({
            message: CommonConfig.ERRORS.ACCESS_DENIED,
            status: CommonConfig.STATUS_CODE.FORBIDDEN
        }, false);

    // TODO Check token is expired or not
    let data = await db.ResetPassword.findOne({
        where: {
            email: req.user.email
        }
    });

    next(null, data);
};
module.exports = CommonMiddleware;

