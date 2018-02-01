const AnonymousService = require('../services/anonymous.service')
const CommonService = require('../services/common.service')
const CommonConfig = require('../../../configurations/helpers/common-config')
const {ResponseHelpers, AuthenticationHelpers} = require('../../../configurations/helpers/helper')

let Anonymous = {
    FbCheck: async (req, res, next) => {
        try {
            const {facebookId, facebookEmailId} = req.body
            const fbData = await CommonService.User.CheckFacebookAlreadyLinked(facebookId, facebookEmailId)
            const msg = fbData ? 'Facebook account already linked with other account.' : null
            return ResponseHelpers.SetSuccessResponse({
                facebookExists: !!fbData,
                message: msg
            }, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    FbSignIn: async (req, res, next) => {
        try {
            const {facebookId, firstName, lastName, email, imageUrl, gender, verified} = req.body
            const isFacebookUserExists = await CommonService.User.CheckUserHasProfileByFacebookId(facebookId)
            if (!isFacebookUserExists) {
                const facebookDetails = {
                    facebookId: facebookId,
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    imageUrl: imageUrl,
                    gender: gender,
                    verified: verified
                }
                const facebookUser = await AnonymousService.AddFacebookUser(facebookDetails)
                if (!facebookUser) {
                    return null
                }
                const userData = {
                    id: `${facebookUser.createdBy}`,
                    email: email,
                    fullName: `${firstName}` + `${' '}` + `${lastName}`,
                    userRole: 2,
                    profileUrl: imageUrl,
                    hasProfile: false,
                    profileSelected: false
                }
                let userDetails = await CommonService.GetUserDetailsByUserTypeId(facebookUser.createdBy)
                const result = await CommonService.Token.FacebookToken(userDetails.userInfo, userData, false)
                return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
            }
            const userProfile = await CommonService.User.CheckUserHasProfileByFacebookId(facebookId)
            if (!userProfile) {
                return ResponseHelpers.SetErrorResponse('Unable to login with facebook.', res)
            }
            let userDetails = await CommonService.GetUserDetailsByUserTypeId(userProfile.id)
            let userData = {
                id: userDetails.id,
                email: userDetails.emailId || userDetails.facebookEmailId,
                fullName: `${firstName}` + `${' '}` + `${lastName}`,
                userRole: userDetails.userRole,
                profileUrl: userDetails.Profile.profileUrl,
                hasProfile: true,
                profileSelected: userDetails.profileSelected
            }
            let result = await CommonService.GenerateToken(userDetails.userInfo, userData)
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    SignUp: async (req, res, next) => {
        try {
            const registrationData = JSON.parse(req.body.details)
            if (!registrationData || !registrationData.user || !registrationData.address) {
                return ResponseHelpers.SetBadRequestResponse('Invalid request.', res)
            }
            const checkUserEmailExist = await CommonService.User.CheckUserEmailIdExist(registrationData.user.email)
            if (checkUserEmailExist) {
                return ResponseHelpers.SetBadRequestResponse({message: 'Email Id already registered.'}, res)
            }
            if (registrationData.facebook && registrationData.facebook.facebookId) {
                const checkFacebook = await CommonService.User.CheckUserHasProfileByFacebookId(registrationData.facebook.facebookId, registrationData.facebook.facebookId)
                if (checkFacebook) {
                    return ResponseHelpers.SetBadRequestResponse({message: 'Facebook already linked to another account.'}, res)
                }
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
    CheckUserEmailAndPassword: async (req, res, next) => {
        try {
            const {username, password} = req.body
            const userExist = await CommonService.User.CheckUserEmailIdExist(username)
            if (!userExist) {
                return ResponseHelpers.SetSuccessResponse({
                    flag: 0,
                    message: 'Email not exist in our database.'
                }, res, CommonConfig.STATUS_CODE.OK)
            }
            const checkUserHasLogin = await CommonService.User.CheckUserHasLogin(userExist.id)
            if (!checkUserHasLogin) {
                return ResponseHelpers.SetSuccessResponse({
                    flag: 1,
                    message: 'Email already registered, Please reset your password'
                }, res, CommonConfig.STATUS_CODE.OK)
            }
            const checkUserLogin = await CommonService.User.ValidateUserCredentials(userExist.id, password)
            if (!checkUserLogin) {
                return ResponseHelpers.SetSuccessResponse({
                    flag: 1,
                    message: 'Email already registered, Please reset your password'
                }, res, CommonConfig.STATUS_CODE.OK)
            }

            // generate token and redirect to dashboard
            const userDetails = {
                userId: userExist.id,
                createdBy: userExist.id,
                tokenId: false,
                tokenStatus: false
            }
            const result = await AnonymousService.Authenticate(userDetails)
            if (!result) {
                return ResponseHelpers.SetNotFoundResponse('Missing email and/or password.', res)
            }
            result.type = false
            result.flag = 2
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    AuthenticateUser: async (req, res, next) => {
        try {
            if (req.user.token && !req.tokenStatus) {
                const result = await CommonService.InvalidateResetPasswordTokenData(req.user.id)
                if (!result) {
                    return ResponseHelpers.SetErrorResponse('Unable to process request.', res)
                }
                return ResponseHelpers.SetForbiddenResponse('jtw token expired', res)
            }
            const userDetails = {
                userId: !req.tokenStatus ? req.user.id : false,
                createdBy: req.user.createdBy,
                tokenId: req.tokenStatus ? req.user.id : false,
                tokenStatus: !!req.tokenStatus
            }
            const result = await AnonymousService.Authenticate(userDetails)
            if (!result) {
                return ResponseHelpers.SetNotFoundResponse('Missing email and/or password.', res)
            }
            result.type = !req.user.randomKey
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    ResetPassword: async (req, res, next) => {
        try {
            let flag = true
            const {email} = req.body
            if (!email) {
                return ResponseHelpers.SetBadRequestResponse('Missing email.', res)
            }
            if (!req.resetPasswordGenerated && !req.tokenStatus && !req.tokenData) {
                const userModel = await CommonService.UserModel.GetDetailsByEmail(email)
                if (!userModel) {
                    return ResponseHelpers.SetNotFoundResponse('user not exists.', res)
                }
                const tempPassword = await CommonService.Keys.RandomKeys.GenerateRandomKey()
                const uniqueKey = await CommonService.Keys.RandomKeys.GenerateUnique16DigitKey()
                const token = await AuthenticationHelpers.GenerateTokenForResetPassword(userModel.userInfo, uniqueKey, false)
                const data = await AnonymousService.AddResetPasswordDetails({
                    email: userModel.emailId || userModel.facebookEmailId,
                    tempPassword: tempPassword,
                    randomKey: tempPassword,
                    token: token,
                    uniqueKey: uniqueKey,
                    createdBy: userModel.id
                }, email, null)
                if (!data) {
                    flag = false
                }
            } else if (req.resetPasswordGenerated && !req.tokenStatus && !req.tokenData) {
                const userModel = await CommonService.UserModel.GetDetailsByEmail(email)
                const tempPassword = await CommonService.Keys.RandomKeys.GenerateRandomKey()
                const uniqueKey = await CommonService.Keys.RandomKeys.GenerateUnique16DigitKey()
                const token = await AuthenticationHelpers.GenerateTokenForResetPassword(userModel.userInfo, unique_key, false)
                const result = await AnonymousService.AddResetPasswordDetails({
                    email: userModel.emailId || userModel.facebookEmailId,
                    tempPassword: tempPassword,
                    randomKey: tempPassword,
                    token: token,
                    uniqueKey: uniqueKey,
                    createdBy: userModel.id
                }, email, {tokenStatus: req.tokenStatus, tokenId: req.tokenId})
                if (!result) {
                    flag = false
                }
            } else if (req.resetPasswordGenerated && req.tokenData && req.tokenStatus) {
                const data = await AnonymousService.SendResetPasswordKeyToMail(req.tokenData.email)
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
    },
    GuestLogin: async (req, res, next) => {
        try {
            const guestDetails = {
                userRole: 8,
                isGuest: true
            }
            let result = await CommonService.Token.GuestLoginToken(guestDetails)
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    }
}

let AnonymousController = {
    Anonymous: Anonymous
}

module.exports = AnonymousController
