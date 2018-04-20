const passport = require('passport')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const LocalStrategy = require('passport-local').Strategy
const db = require('../../application/modals')
const config = require('../main')
const CommonConfig = require('../helpers/common-config')
const localOptions = {
    usernameField: 'username'
}
const localLogin = new LocalStrategy(localOptions, async (userEmail, password, done) => {
    try {

        const userType = await db.UserType.findOne({
            where: {
                [Op.or]: {
                    emailId: `${userEmail}`,
                    facebookEmailId: `${userEmail}`
                }
            }
        })
        if (!userType) {
            return done({
                message: 'Email not found.',
                status: CommonConfig.STATUS_CODE.OK
            }, false)
        }
        const user = await db.User.findOne({
            where: {
                createdBy: {
                    [Op.eq]: `${userType.id}`
                }
            }
        })
        if (!user) {
            return done({
                message: 'Invalid user id or password.',
                status: CommonConfig.STATUS_CODE.OK
            }, false)
        }
        const isMatch = await user.comparePasswords(password)
        if (isMatch) {
            return done(null, user)
        }
        const userForResetPassword = await db.ResetPassword.findOne({
            where: {
                [Op.and]: [{
                    email: userEmail,
                    isValid: true,
                    status: true
                }]
            }
        })
        console.log('compare pawd')
        if (!userForResetPassword) {
            return done({
                message: 'Invalid user id or password.',
                status: CommonConfig.STATUS_CODE.OK
            }, false)
        }
        console.log('compare pawd')
        const isTempPasswordMatch = await userForResetPassword.comparePasswords(password)
        console.log('====================', isTempPasswordMatch)
        if (!isTempPasswordMatch) {
            return done({
                message: 'Invalid user id or password.',
                status: CommonConfig.STATUS_CODE.OK
            }, false)
        }
        return done(null, userForResetPassword)

        // const normalUserLogin = await db.User.findOne({
        //     where: {
        //         email: {
        //             [Op.eq]: `${username}`
        //         }
        //     }
        // })
        // if (normalUserLogin) {
        //     let isMatch = await normalUserLogin.comparePasswords(password)
        //     if (isMatch) return done(null, normalUserLogin)
        // }
        // const resetPasswordUserLogin = await db.ResetPassword.findOne({
        //     where: {
        //         [Op.and]: [{
        //             email: username,
        //             isValid: true,
        //             status: true
        //         }]
        //     }
        // })
        //
        // if (resetPasswordUserLogin) {
        //     const isMatch = await resetPasswordUserLogin.comparePasswords(password)
        //
        //     if (isMatch) {
        //         return done(null, resetPasswordUserLogin)
        //     }
        // } else {
        //     const temp = await db.ResetPassword.findOne({
        //         where: {
        //             [Op.and]: [{
        //                 email: username,
        //                 randomKey: password
        //             }]
        //         }
        //     })
        //     if (temp) {
        //         return done({
        //             message: CommonConfig.ERRORS.TOKEN_EXPIRED,
        //             status: CommonConfig.STATUS_CODE.OK
        //         }, false)
        //     }
        // }
        // done({
        //     message: CommonConfig.ERRORS.LOGIN_FAILED,
        //     status: CommonConfig.STATUS_CODE.OK
        // }, false)
    } catch (error) {
        return done({
            message: error,
            status: CommonConfig.STATUS_CODE.INTERNAL_SERVER_ERROR
        }, false)
    }
})

let jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
    secretOrKey: config.keys.secret
}

// login
let jwtLogin = new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
        const {isGuest} = payload
        if (isGuest) {
            const {userRole} = payload
            return done(null, {isGuest, userRole})
        }
        const {id, userRole, uniqueKey} = payload
        let user = await db.UserType.findById(id)
        if (!user) {
            return done({
                message: CommonConfig.ERRORS.ACCESS_DENIED,
                status: CommonConfig.STATUS_CODE.FORBIDDEN
            }, false)
        }
        if (!uniqueKey) {
            return done(null, user)
        } else {
            const userForResetPassword = await db.ResetPassword.findOne({
                where: {
                    [Op.and]: [{
                        uniqueKey: `${uniqueKey}`,
                        isValid: true,
                        status: true
                    }]
                }
            })
            if (!userForResetPassword) {
                return done({
                    message: CommonConfig.ERRORS.ACCESS_DENIED,
                    status: CommonConfig.STATUS_CODE.FORBIDDEN
                }, false)
            }
            console.log('=======================================')
            user.userRole = userRole
            return done(null, user)
        }
    } catch (error) {
        return done({
            message: error,
            status: CommonConfig.STATUS_CODE.INTERNAL_SERVER_ERROR
        }, false)
    }
})

passport.use(jwtLogin)
passport.use(localLogin)
