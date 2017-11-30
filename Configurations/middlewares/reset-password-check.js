let CommonMiddleware = {},
    db = require('../../Application/Modals');
const CommonConfig = require("../Helpers/common-config");

CommonMiddleware.VarifyResetPasswordPassKey = async (req, res, next) => {
    try {
        let email = req.body.email;
        let isExists = await db.ResetPassword.findOne({
            attributes: ['email'],
            where: {
                email: email,
                status: 1,
                is_valid: 1
            }
        });
        
        // If  record exists, handle it
        if (isExists)
            req.tokenData = {
                email: isExists.email
            };
        
        //Otherwise, return ok
        next();
    }
    catch (error) {
        next(error);
    }
};

CommonMiddleware.AccessToChangePassword = async (req, res, next) => {
    console.log('Requested user: ', req.user);
    if (!req.user.type)
        return next({
            message: 'Access Denied/Forbidden',
            status: CommonConfig.STATUS_CODE.FORBIDDEN
        }, false);
    
    // TODO Check token is expired or not
    let data = db.ResetPassword.findOne({
        where: {
            email: req.user.email
        }
    });
    next();
};
module.exports = CommonMiddleware;

