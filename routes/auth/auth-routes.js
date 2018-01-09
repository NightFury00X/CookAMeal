'use strict'
const router = require('express').Router()
const AuthController = require('../../application/controllers-services/controllers/auth.controller')
const {ValidateBody} = require('../../configurations/middlewares/validation')
const {BodySchemas} = require('../../application/schemas/schema')
const {
    RequestMethodsMiddlewares
} = require('../../configurations/middlewares/middlewares')

// 1: Logout
router.post('/logout',
    RequestMethodsMiddlewares.ApplicationJsonData,
    AuthController.Auth.LogOutUser)

// 2: Change Password
router.put('/changepassword',
    RequestMethodsMiddlewares.ApplicationJsonData,
    ValidateBody(BodySchemas.ChangePassword),
    AuthController.Auth.ChangePassword)

module.exports = router
