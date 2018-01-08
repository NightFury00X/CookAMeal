const AdminService = require('../services/admin.service')
const CommonConfig = require('../../../configurations/helpers/common-config')
const {ResponseHelpers} = require('../../../configurations/helpers/helper')

let Category = {
    Add: async (req, res, next) => {
        try {
            if (!req.files || !req.files.category) {
                return ResponseHelpers.SetBadRequestResponse('Invalid category name/file', res)
            }
            let categoryName = {
                name: req.body.name
            }
            let result = await AdminService.Category.Add(req.user.id, categoryName, req.files)
            if (!result) {
                return ResponseHelpers.SetErrorResponse('Unable to add category', res)
            }
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            console.log('Ok')
            next(error)
        }
    }
}

let SubCategory = {
    Add: async (req, res, next) => {
        try {
            console.log('error')
            if (!req.body.name) {
                return ResponseHelpers.SetBadRequestResponse('Invalid sub-category name.', res)
            }
            let subCategory = req.body
            subCategory.user_type_id = req.user.id
            let result = await AdminService.SubCategory.Add(subCategory)
            if (!result) {
                return ResponseHelpers.SetErrorResponse('Unable to add sub-category.', res)
            }
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            return next(error)
        }
    }
}

let Allergy = {
    Add: async (req, res, next) => {
        try {
            if (!req.body.name) {
                return ResponseHelpers.SetBadRequestResponse('Invalid allergy name.', res)
            }
            let allergy = req.body
            allergy.user_type_id = req.user.id
            let result = await AdminService.Allergy.Add(allergy)
            if (!result) {
                return ResponseHelpers.SetErrorResponse('Unable to add allergy.', res)
            }
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            return next(error)
        }
    }
}

let Units = {
    Add: async (req, res, next) => {
        try {
            if (!req.body.unit_name || !req.body.sort_name) {
                return ResponseHelpers.SetBadRequestResponse('Invalid unit/sort name.', res)
            }
            let unit = req.body
            unit.user_type_id = req.user.id
            let result = await AdminService.Units.Add(unit)
            if (!result) {
                return ResponseHelpers.SetErrorResponse('Unable to add unit.', res)
            }
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            return next(error)
        }
    }
}

let PaymentMethod = {
    Add: async (req, res, next) => {
        try {
            let paymentMethod = req.body
            paymentMethod.user_type_id = req.user.id
            let result = await AdminService.PaymentMethod.Add(paymentMethod)
            if (!result) {
                return ResponseHelpers.SetErrorResponse('Unable to add payment method.', res)
            }
            return ResponseHelpers.SetSuccessResponse({message: 'Payment method added successfully.'}, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            return next(error)
        }
    }
}

let AdminController = {
    Category: Category,
    SubCategory: SubCategory,
    Allergy: Allergy,
    Units: Units,
    PaymentMethod: PaymentMethod
}

module.exports = AdminController
