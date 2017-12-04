let jwt = require('jsonwebtoken'),
    db = require('../../Application/Modals'),
    config = require('../Main');

module.exports = {
    ResetPassword: {
        CheckPasswordIsGenerated: async (req, res, next) => {
            try {
                let email = req.body.email;
                let result = await db.ResetPassword.findOne({
                    where: {
                        email: email,
                        status: true,
                        is_valid: true
                    }
                });
                
                req.token_status = false;
                req.token_data = false;
                req.token_data = false;
                req.reset_password_generated = !!result;
                
                if (!result)
                    return next();
                
                req.token_id = result.id;
                
                let token = result.token.substring(4, result.length);
                
                let flag = await jwt.verify(token, config.keys.secret);
                
                req.token_status = flag;
                if (!flag)
                    return next();
                
                req.token_data = {
                    id: result.id,
                    email: result.email,
                    token: result.token.substring(4, result.length)
                };
                
                next();
            }
            catch (error) {
                if (error.name !== 'TokenExpiredError')
                    return next(error);
                
                req.token_status = false;
                next(null, error);
            }
        }
    },
    Token: {
        VerifyResetPasswordToken: async (req, res, next) => {
            try {
                // If normal user login
                if (!req.user.token)
                    return next();
                
                let result = req.user;
                
                let token = result.token.substring(4, result.length);
                
                
                await jwt.verify(token, config.keys.secret);
                
                req.token_status = true;
                
                next();
            } catch (error) {
                if (error.name !== 'TokenExpiredError')
                    return next(error);
                
                req.token_status = false;
                return next();
            }
        }
    }
};