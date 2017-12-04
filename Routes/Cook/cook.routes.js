'use strict';

const router = require('express').Router();
const CookController = require('../../Application/Controllers-Services/Controllers/cook.controller');
const RequestMethods = require("../../Configurations/middlewares/request-checker");
const FileUploader = require('../../Configurations/Helpers/file-upload-multer');
const {ValidateBody} = require('../../Configurations/middlewares/validation'),
    {BodySchemas} = require('../../Application/Schemas/schema');

//1: Add Recipe
router.post('/recipe',
    RequestMethods.CheckContentType.ApplicationFormData,
    FileUploader.uploadDataFiles,
    ValidateBody(BodySchemas.Recipe),
    CookController.Recipe.Add);


module.exports = router;