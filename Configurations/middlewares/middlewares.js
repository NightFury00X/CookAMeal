const jwt = require('jsonwebtoken'),
    Sequelize = require("sequelize"),
    Op = Sequelize.Op,
    db = require('../../Application/Modals'),
    config = require('../Main'),
    CommonConfig = require("../Helpers/common-config");

module.exports = {
    CommonMiddlewares: {
        CheckAuthorizationHeader: async (req, res, next) => {
            let content_type = req.get('Authorization');
            if (!content_type) {
                return next({
                    status: CommonConfig.STATUS_CODE.BAD_REQUEST,
                    message: CommonConfig.ERRORS.HEADER_NOT_FOUND
                }, false);
            }
            req.content_type = content_type;
            next(null, req);
        }
    },
    RequestMethodsMiddlewares: {
        ApplicationJsonData: async (req, res, next) => {
            let content_type = req.get('Content-Type');
            if (!content_type || content_type.split(';')[0] !== CommonConfig.CONTENT_TYPE.JSON) {
                return next({
                    status: CommonConfig.STATUS_CODE.BAD_REQUEST,
                    message: CommonConfig.ERRORS.CONTENT_TYPE_JSON
                }, false);
            }
            req.content_type = content_type;
            next();
        },
        ApplicationFormData: async (req, res, next) => {
            let content_type = req.get('Content-Type');
            if (!content_type || content_type.split(';')[0] !== CommonConfig.CONTENT_TYPE.MULTIPART) {
                return next({
                    status: CommonConfig.STATUS_CODE.BAD_REQUEST,
                    message: CommonConfig.ERRORS.CONTENT_TYPE_MULTIPART
                }, false);
            }
            req.content_type = content_type;
            next();
        }
    },
    AuthorizationMiddlewares: {
        AccessLevel: (access_level) => {
            return (req, res, next) => {
                if (!(access_level & req.user.user_role)) {
                    let response = {
                        message: CommonConfig.ERRORS.NON_AUTHORIZED,
                        status: CommonConfig.STATUS_CODE.FORBIDDEN
                    };
                    return next(response, false);
                }
                next();
            }
        }
    },
    TokenValidatorsMiddlewares: {
        CheckUserTokenIsValid: async (req, res, next) => {
            const userTypeId = req.user.unique_key ? req.user.user_type_id : req.user.id;
            const isExists = await db.BlackListedToken.findOne({
                where: {
                    [Op.and]: [{
                        token: req.get('Authorization'),
                        user_type_id: userTypeId
                    }]
                }
            });
            
            const response = {
                message: CommonConfig.ERRORS.NON_AUTHORIZED,
                status: CommonConfig.STATUS_CODE.FORBIDDEN
            };
            
            // If  record exists, handle it
            if (isExists)
                return next(response, false);
            
            //Otherwise, return ok
            return next();
        }
    },
    ResetPasswordMiddlewares: {
        CheckPasswordIsGenerated: async (req, res, next) => {
            try {
                let email = req.body.email;
                let result = await db.ResetPassword.findOne({
                    where: {
                        [Op.and]: [{
                            email: email,
                            status: true,
                            is_valid: true
                        }]
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
    TokenMiddlewares: {
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