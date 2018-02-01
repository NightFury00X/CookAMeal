const jwt = require('jsonwebtoken')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const db = require('../../application/modals')
const config = require('../main')
const CommonConfig = require('../helpers/common-config')

module.exports = {
    CommonMiddlewares: {
        CheckAuthorizationHeader: async (req, res, next) => {
            let contentType = req.get('Authorization')
            if (!contentType) {
                return next({
                    status: CommonConfig.STATUS_CODE.BAD_REQUEST,
                    message: CommonConfig.ERRORS.HEADER_NOT_FOUND
                }, false)
            }
            req.content_type = contentType
            next(null, req)
        },
        CheckProfileIsSelected: async (req, res, next) => {
            const {isGuest} = req.user
            if (isGuest) {
                next(null, req)
            }
            const {id} = req.user
            const userDetails = await db.UserType.findOne({
                where: {
                    id: {
                        [Op.eq]: `${id}`
                    }
                }
            })
            if (!userDetails.profileSelected) {
                return next({
                    profileSelected: userDetails.profileSelected,
                    message: 'Please select profile'
                }, false)
            }
            next(null, req)
        }
    },
    RequestMethodsMiddlewares: {
        ApplicationJsonData: async (req, res, next) => {
            let contentType = req.get('Content-Type')
            if (!contentType || contentType.split(';')[0] !== CommonConfig.CONTENT_TYPE.JSON) {
                return next({
                    status: CommonConfig.STATUS_CODE.BAD_REQUEST,
                    message: CommonConfig.ERRORS.CONTENT_TYPE_JSON
                }, false)
            }
            req.content_type = contentType
            next()
        },
        ApplicationFormData: async (req, res, next) => {
            let contentType = req.get('Content-Type')
            if (!contentType || contentType.split(';')[0] !== CommonConfig.CONTENT_TYPE.MULTIPART) {
                return next({
                    status: CommonConfig.STATUS_CODE.BAD_REQUEST,
                    message: CommonConfig.ERRORS.CONTENT_TYPE_MULTIPART
                }, false)
            }
            req.content_type = contentType
            next()
        }
    },
    AuthorizationMiddlewares: {
        AccessLevel: (accessLevel) => {
            return (req, res, next) => {
                if (!(accessLevel & req.user.userRole)) {
                    let response = {
                        message: CommonConfig.ERRORS.NON_AUTHORIZED,
                        status: CommonConfig.STATUS_CODE.FORBIDDEN
                    }
                    return next(response, false)
                }
                next()
            }
        }
    },
    TokenValidatorsMiddlewares: {
        CheckUserTokenIsValid: async (req, res, next) => {
            const {isGuest} = req.user
            if (isGuest) {
                return next(null, req)
            }
            const userTypeId = req.user.uniqueKey ? req.user.userId : req.user.id
            const isUserExists = await db.BlackListedToken.findOne({
                where: {
                    [Op.and]: [{
                        token: req.get('Authorization'),
                        userId: userTypeId
                    }]
                }
            })
            const response = {
                message: CommonConfig.ERRORS.NON_AUTHORIZED,
                status: CommonConfig.STATUS_CODE.FORBIDDEN
            }
            if (isUserExists) {
                return next(response, false)
            }
            return next()
        }
    },
    ResetPasswordMiddlewares: {
        CheckPasswordIsGenerated: async (req, res, next) => {
            try {
                const {email} = req.body
                let result = await db.ResetPassword.findOne({
                    where: {
                        [Op.and]: [{
                            email: `${email}`,
                            status: true,
                            isValid: true
                        }]
                    }
                })
                req.tokenStatus = false
                req.tokenData = false
                req.tokenData = false
                req.resetPasswordGenerated = !!result
                if (!result) {
                    return next()
                }
                req.tokenId = result.id
                let token = result.token.substring(4, result.length)
                let flag = await jwt.verify(token, config.keys.secret)
                req.tokenStatus = flag
                if (!flag) {
                    return next()
                }
                req.tokenData = {
                    id: result.id,
                    email: result.email,
                    token: result.token.substring(4, result.length)
                }
                next()
            } catch (error) {
                if (error.name !== 'TokenExpiredError') {
                    return next(error)
                }
                req.tokenStatus = false
                next(null, error)
            }
        }
    },
    TokenMiddlewares: {
        VerifyResetPasswordToken: async (req, res, next) => {
            try {
                if (!req.user.token) {
                    return next()
                }
                let result = req.user
                let token = result.token.substring(4, result.length)
                await jwt.verify(token, config.keys.secret)
                req.tokenStatus = true
                next()
            } catch (error) {
                if (error.name !== 'TokenExpiredError') {
                    return next(error)
                }
                req.tokenStatus = false
                return next()
            }
        }
    }
}
