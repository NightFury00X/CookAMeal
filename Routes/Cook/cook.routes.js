'use strict';

const router = require('express').Router();
const CookController = require('../../Application/Controllers-Services/Controllers/cook.controller');
const RequestMethods = require("../../Configurations/middlewares/request-checker");
const uploadFile = require('../../Configurations/Helpers/file-upload-multer');

//1: Add Recipe
router.post('/recipe',
    RequestMethods.CheckContentType.ApplicationFormData,
    uploadFile,
    CookController.Recipe.Add);


module.exports = router;