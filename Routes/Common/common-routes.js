'use strict';

const router = require('express').Router(),
    CommonController = require('../../Application/Controllers-Services/Controllers/common.controller');

//1: Get All Category list
router.get('/category',
    CommonController.Category.GetAll);

//1: Get All Category by Id
router.get('/category/:id',
    CommonController.Category.FindById);

module.exports = router;