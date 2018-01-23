'use strict'
const router = require('express').Router()
const FileUploader = require('../../configurations/helpers/file-upload-multer')
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

router.post('/profile-cover',
    RequestMethodsMiddlewares.ApplicationFormData,
    FileUploader.UploadProfileCover,
    AuthController.Auth.ProfileCover)
module.exports = router
