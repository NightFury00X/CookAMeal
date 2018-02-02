'use strict'
const passport = require('passport')
const requireAuth = passport.authenticate('jwt', {session: false, failWithError: true})
const {
    AuthorizationMiddlewares,
    TokenValidatorsMiddlewares,
    CommonMiddlewares
} = require('../configurations/middlewares/middlewares')

// passport Strategy
require('../configurations/passport/passport-strategy')

const BaseApi = require('express').Router()
const AuthRoutes = require('express').Router()
const CommonRoutes = require('express').Router()
const AdminRoutes = require('express').Router()
const CookRoutes = require('express').Router()
const CommonConfig = require('../configurations/helpers/common-config')
const CommonController = require('../application/controllers-services/controllers/common.controller')
const {ValidateBody} = require('../configurations/middlewares/validation')
const {BodySchemas} = require('../application/schemas/schema')
const {
    RequestMethodsMiddlewares
} = require('../configurations/middlewares/middlewares')
const FacebookStrategy = require('passport-facebook').Strategy

module.exports = function (app) {
    const fbOpt = {
        clientID: '299744253859215',
        clientSecret: '273ecbcf51e1ded55a808f90835b196b',
        callbackURL: 'http://localhost:8081/facebook/callback'
    }
    const fbCallback = function (accessToken, refreshToken, profile, cb) {
        console.log('accessToken: ', accessToken)
        console.log('refreshToken: ', refreshToken)
        console.log('profile: ', profile)
    }

    passport.use(new FacebookStrategy(fbOpt, fbCallback))

    /* FACEBOOK ROUTER */
    BaseApi.get('/facebook',
        passport.authenticate('facebook', {scope: ['email']}))

    BaseApi.get('/facebook/callback',
        passport.authenticate('facebook', function (err, user, info) {
            if (err) {
                console.log('error: ', err)
            }
            console.log('User: ', user)
        }))

    // 1: anonymous routes
    BaseApi.use('/api',
        require('./anonymous/anonymous.routes'))

    // 2: auth routes
    BaseApi.use('/api', AuthRoutes)
    BaseApi.use('/api/change-profile',
        [CommonMiddlewares.CheckAuthorizationHeader,
            requireAuth,
            TokenValidatorsMiddlewares.CheckUserTokenIsValid,
            AuthorizationMiddlewares.AccessLevel(CommonConfig.ACCESS_LEVELS.ALL),
            RequestMethodsMiddlewares.ApplicationJsonData,
            ValidateBody(BodySchemas.ChangeProfile)],
        CommonController.User.ChangeProfile)

    AuthRoutes.use('/auth',
        [CommonMiddlewares.CheckAuthorizationHeader,
            requireAuth,
            CommonMiddlewares.CheckProfileIsSelected,
            TokenValidatorsMiddlewares.CheckUserTokenIsValid,
            AuthorizationMiddlewares.AccessLevel(CommonConfig.ACCESS_LEVELS.AUTH)],
        require('./auth/auth-routes'))

    // 3: common routes
    BaseApi.use('/api', CommonRoutes)
    CommonRoutes.use('/common',
        [CommonMiddlewares.CheckAuthorizationHeader,
            requireAuth,
            CommonMiddlewares.CheckProfileIsSelected,
            TokenValidatorsMiddlewares.CheckUserTokenIsValid,
            AuthorizationMiddlewares.AccessLevel(CommonConfig.ACCESS_LEVELS.ALL)],
        require('./common/common-routes'))

    // 4: admin routes
    BaseApi.use('/api', AdminRoutes)
    AdminRoutes.use('/admin',
        [CommonMiddlewares.CheckAuthorizationHeader,
            requireAuth,
            CommonMiddlewares.CheckProfileIsSelected,
            TokenValidatorsMiddlewares.CheckUserTokenIsValid,
            AuthorizationMiddlewares.AccessLevel(CommonConfig.ACCESS_LEVELS.ADMIN)],
        require('./admin/admin.routes'))

    // 5: cook routes
    BaseApi.use('/api', CookRoutes)
    CookRoutes.use('/cook',
        [CommonMiddlewares.CheckAuthorizationHeader,
            requireAuth,
            CommonMiddlewares.CheckProfileIsSelected,
            TokenValidatorsMiddlewares.CheckUserTokenIsValid,
            AuthorizationMiddlewares.AccessLevel(CommonConfig.ACCESS_LEVELS.COOK)],
        require('./cook/cook.routes'))

    app.use(BaseApi)
}
