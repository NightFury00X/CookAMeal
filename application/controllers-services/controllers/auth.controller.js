const {ResponseHelpers} = require('../../../configurations/helpers/helper')
const CommonConfig = require('../../../configurations/helpers/common-config')
const CommonService = require('../services/common.service')

let Auth = {
    LogOutUser: async (req, res, next) => {
        try {
            req.check('type').notEmpty()
            if (req.validationErrors() || req.validationErrors().length > 0) {
                return next({
                    message: CommonConfig.ERRORS.CREATION,
                    status: CommonConfig.STATUS_CODE.BAD_REQUEST
                }, false)
            }
            let tokenDetails = {
                user_type_id: req.user.id,
                token: req.get('Authorization'),
                reasons: CommonConfig.REASONS.USER_LOGGED_OUT
            }
            let data = await CommonService.User.Logout(tokenDetails)
            if (!data) {
                return next({
                    message: CommonConfig.ERRORS.INTERNAL_SERVER_ERROR,
                    status: CommonConfig.STATUS_CODE.INTERNAL_SERVER_ERROR
                }, false)
            }
            return ResponseHelpers.SetSuccessResponse({message: CommonConfig.SUCCESS.LOGGED_OUT}, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    ChangePassword: async (req, res, next) => {
        try {
            let userDetails = {
                id: req.user.id,
                email: req.user.user_id,
                password: req.body.new_password
            }
            let userData = await CommonService.GetResetPasswordData(req.user.user_id)
            const isMatch = await userData.comparePasswords(req.body.old_password)
            if (!isMatch) {
                return next({
                    message: CommonConfig.ERRORS.PASSWORD_NOT_MATCHED,
                    status: CommonConfig.STATUS_CODE.BAD_REQUEST
                }, false)
            }
            let data = await CommonService.ChangePassword(userDetails)
            if (!data) {
                return next({
                    message: CommonConfig.ERRORS.INTERNAL_SERVER_ERROR,
                    status: CommonConfig.STATUS_CODE.INTERNAL_SERVER_ERROR
                }, false)
            }
            const TokenData = await CommonService.GenerateTokenByUserTypeId(req.user.user_type_id)
            return ResponseHelpers.SetSuccessResponse({
                new_token: TokenData,
                message: CommonConfig.SUCCESS.PASSWORD_CHANGED
            }, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    ProfileCover: async (req, res, next) => {
        try {
            const userId = req.user.id
            const profile = await CommonService.User.GetProfileIdByUserTypeId(userId)
            const profileId = profile.id
            const result = await CommonService.User.ProfileCover({profile_id: profileId})
            return ResponseHelpers.SetSuccessResponse({message: 'Profile cover updated.'}, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    }
}

let AuthController = {
    Auth: Auth
}

module.exports = AuthController
