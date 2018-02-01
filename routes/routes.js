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

module.exports = function (app) {
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
