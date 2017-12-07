'use strict';

const router = require('express').Router(),
    CommonController = require('../../Application/Controllers-Services/Controllers/common.controller'),
    {ValidateParams, ValidateBody} = require('../../Configurations/middlewares/validation'),
    {ParamSchemas, BodySchemas} = require('../../Application/Schemas/schema');

//1: Get All Category list
router.get('/category',
    CommonController.Category.GetAll);

//1: Get All Category by Id
router.get('/category/:id',
    CommonController.Category.FindById);

//1: Get All Allergies list
router.get('/subcategory',
    CommonController.SubCategory.GetAll);

//1: Get All Allergies list
router.get('/allergy',
    CommonController.Allergy.GetAll);

//1: Get All Allergies list
router.get('/unit',
    CommonController.Units.GetAll);

//1: Get All Recipe list by category Id
router.get('/recipe/:id',
    ValidateParams(ParamSchemas.idSchema, 'id'),
    CommonController.Recipe.GetAllRecipeByCategoryId);

module.exports = router;