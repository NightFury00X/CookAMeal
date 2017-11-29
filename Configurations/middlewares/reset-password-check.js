let CommonMiddleware = {},
    db = require('../../Application/Modals');

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

module.exports = CommonMiddleware;

