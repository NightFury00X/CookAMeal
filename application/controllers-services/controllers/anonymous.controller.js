const AnonymousService = require('../services/anonymous.service')
const CommonService = require('../services/common.service')
const CommonConfig = require('../../../configurations/helpers/common-config')
const {ResponseHelpers, AuthenticationHelpers} = require('../../../configurations/helpers/helper')

let Anonymous = {
    FbSignIn: async (req, res, next) => {
        try {
            req.check('fbid').notEmpty()
            if (req.validationErrors() || req.validationErrors().length > 0) {
                return next({
                    message: 'Unable to connect with facebook.',
                    status: CommonConfig.STATUS_CODE.BAD_REQUEST
                }, false)
            }
            let fbId = req.body.fbid
            let user = await CommonService.CheckUserTypeByUserId(fbId)
            if (!user) {
                return next({
                    message: 'facebook user not exist.',
                    status: CommonConfig.STATUS_CODE.OK
                }, false)
            }

            // Get User Details
            let userDetails = await CommonService.GetUserDetailsByUserTypeId(user.id)

            // Generate Token
            let userData = {
                id: userDetails.userid,
                email: userDetails.Profile.email,
                fullname: userDetails.Profile.fullName,
                user_type: userDetails.user_type,
                user_role: userDetails.user_role,
                profile_url: userDetails.Profile.MediaObjects.length > 0 ? userDetails.Profile.MediaObjects[0].imageurl : ''
            }

            let result = await CommonService.GenerateToken(userDetails.userInfo, userData)
            result.type = true
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    SignUp: async (req, res, next) => {
        try {
            const registrationData = JSON.parse(req.body.details)
            if (!registrationData || !registrationData.user || !registrationData.address || !registrationData.social) {
                return ResponseHelpers.SetBadRequestResponse('Invalid request.', res)
            }
            let result = await AnonymousService.SignUp(registrationData, req.files)
            if (!result) {
                return ResponseHelpers.SetErrorResponse('Unable to register user.', res)
            }
            result.type = true
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            next(error)
        }
    },
    AuthenticateUser: async (req, res, next) => {
        try {
            if (req.user.token && !req.token_status) {
                const result = await CommonService.InvalidateResetPasswordTokenData(req.user.id)
                if (!result) {
                    return ResponseHelpers.SetErrorResponse('Unable to process request.', res)
                }
                return ResponseHelpers.SetForbiddenResponse('jtw token expired', res)
            }
            const userDetails = {
                user_id: !req.token_status ? req.user.id : false,
                user_type_id: req.user.user_type_id,
                token_id: req.token_status ? req.user.id : false,
                token_status: !!req.token_status
            }
            const result = await AnonymousService.Authenticate(userDetails)
            if (!result) {
                return ResponseHelpers.SetNotFoundResponse('Missing email and/or password.', res)
            }
            result.type = !req.user.random_key
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    ResetPassword: async (req, res, next) => {
        try {
            let flag = true
            if (!req.body.email) {
                return ResponseHelpers.SetBadRequestResponse('Missing email.', res)
            }
            const email = req.body.email
            if (!req.reset_password_generated && !req.token_status && !req.token_data) {
                const userModel = await CommonService.UserModel.GetDetailsByEmail(email)
                if (!userModel) {
                    return ResponseHelpers.SetNotFoundResponse('user not exists.', res)
                }
                const tempPassword = await CommonService.Keys.RandomKeys.GenerateRandomKey()
                const uniqueKey = await CommonService.Keys.RandomKeys.GenerateUnique16DigitKey()
                const token = await AuthenticationHelpers.GenerateTokenForResetPassword(userModel.userInfo, unique_key, false)
                const data = await AnonymousService.AddResetPasswordDetails({
                    email: userModel.user_id,
                    temp_password: tempPassword,
                    random_key: tempPassword,
                    token: token,
                    unique_key: uniqueKey,
                    user_type_id: userModel.id
                }, email, null)
                if (!data) {
                    flag = false
                }
            } else if (req.reset_password_generated && !req.token_status && !req.token_data) {
                const userModel = await CommonService.UserModel.GetDetailsByEmail(email)
                const tempPassword = await CommonService.Keys.RandomKeys.GenerateRandomKey()
                const uniqueKey = await CommonService.Keys.RandomKeys.GenerateUnique16DigitKey()
                const token = await AuthenticationHelpers.GenerateTokenForResetPassword(userModel.userInfo, unique_key, false)
                const result = await AnonymousService.AddResetPasswordDetails({
                    email: userModel.user_id,
                    temp_password: tempPassword,
                    random_key: tempPassword,
                    token: token,
                    unique_key: uniqueKey,
                    user_type_id: userModel.id
                }, email, {token_status: req.token_status, token_id: req.token_id})
                if (!result) {
                    flag = false
                }
            } else if (req.reset_password_generated && req.token_data && req.token_status) {
                const data = await AnonymousService.SendResetPasswordKeyToMail(req.token_data.email)
                if (!data) {
                    flag = false
                }
            }
            if (!flag) {
                return ResponseHelpers.SetErrorResponse('Unable to process your request.', res)
            }
            return ResponseHelpers.SetSuccessResponse({
                email: email,
                message: CommonConfig.SUCCESS.EMAIL_SENT
            }, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    ChangePassword: async (req, res, next) => {
        try {
            const userDetails = {
                id: req.user.id,
                email: req.user.email,
                password: req.body.password
            }
            await CommonService.ChangePassword(userDetails)
            return ResponseHelpers.SetSuccessResponse(CommonConfig.SUCCESS.PASSWORD_CHANGED, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    }
}

let AnonymousController = {
    Anonymous: Anonymous
}

module.exports = AnonymousController
