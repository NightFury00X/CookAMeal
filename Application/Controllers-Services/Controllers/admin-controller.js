let responseHelper = require('../../../Configurations/Helpers/ResponseHandler'),
    AdminService = require('../Services/admin.service'),
    CommonConfig = require('../../../Configurations/Helpers/common-config');

let Category = {
    Add: async (req, res, next) => {
        try {
            if (!req.files || !req.files.category)
                return next({
                    message: CommonConfig.ERRORS.CREATION,
                    status: CommonConfig.STATUS_CODE.BAD_REQUEST
                }, false);
    
            let categoryName = {
                name: req.body.name
            };
            let result = await AdminService.Category.Add(req.user.id, categoryName, req.files);
            return responseHelper.setSuccessResponse(result, res, CommonConfig.STATUS_CODE.CREATED);
        }
        catch (error) {
            next(error);
        }
    }
};

let SubCategory = {
    Add: async (req, res, next) => {
        try {
            let subCategory = req.body;
            subCategory.user_type_id = req.user.id;
            let result = await AdminService.SubCategory.Add(subCategory);
            if (result)
                return responseHelper.setSuccessResponse(result, res, CommonConfig.STATUS_CODE.CREATED);
        } catch (error) {
            return next(error);
        }
    }
};

let Allergy = {
    Add: async (req, res, next) => {
        try {
            let allergy = req.body;
            allergy.user_type_id = req.user.id;
            let result = await AdminService.Allergy.Add(allergy);
            if (result)
                return responseHelper.setSuccessResponse(result, res, CommonConfig.STATUS_CODE.CREATED);
        } catch (error) {
            return next(error);
        }
    }
};

let Units = {
    Add: async (req, res, next) => {
        try {
            let unit = req.body;
            unit.user_type_id = req.user.id;
            let result = await AdminService.Units.Add(unit);
            if (result)
                return responseHelper.setSuccessResponse(result, res, CommonConfig.STATUS_CODE.CREATED);
        } catch (error) {
            return next(error);
        }
    }
};

let AdminController = {
    Category: Category,
    SubCategory: SubCategory,
    Allergy: Allergy,
    Units: Units
};

module.exports = AdminController;