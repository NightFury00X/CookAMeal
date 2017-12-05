'use strict';

const router = require('express').Router(),
    CommonController = require('../../Application/Controllers-Services/Controllers/common.controller');

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

module.exports = router;