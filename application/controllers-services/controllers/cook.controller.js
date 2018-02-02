const {ResponseHelpers} = require('../../../configurations/helpers/helper')
const CookService = require('../services/cook.service')
const CommonService = require('../services/common.service')
const AuthService = require('../services/auth-service')
const CommonConfig = require('../../../configurations/helpers/common-config')

let Recipe = {
    GetAllRecipeBySubCategory: async (req, res, next) => {
        try {
            const profile = await CommonService.User.GetProfileIdByUserTypeId(req.user.id)
            let result = await CookService.Recipe.GetAllRecipeBySubCategory(profile.id)
            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    GetAllRecipeBySubCategoryById: async (req, res, next) => {
        try {
            let id = req.params['id']
            let result = await CookService.Recipe.GetAllRecipeBySubCategoryById('e4d2e9b2-6673-4bec-aa39-85d34add646a', id)

            return ResponseHelpers.SetSuccessResponse(result, res, CommonConfig.STATUS_CODE.OK)
        } catch (error) {
            next(error)
        }
    },
    Add: async (req, res, next) => {
        try {
            let recipeData = await CookService.Recipe.Add(req.body, req.files, req.user.id)
            if (!recipeData) {
                return next({
                    message: CommonConfig.ERRORS.CREATION,
                    status: CommonConfig.STATUS_CODE.BAD_REQUEST
                }, false)
            }
            return ResponseHelpers.SetSuccessResponse({Message: 'Your recipe added successfully.'}, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            next(error)
        }
    },
    GetAllRecipesList: async (req, res, next) => {
        try {
            const {id} = req.user
            const profile = await CommonService.User.GetProfileIdByUserTypeId(id)
            const recipe = await CookService.Recipe.GetMyAllRecipesList(profile.id)
            let recipeDetailsToJSON = JSON.parse(JSON.stringify(recipe[0]))
            const category = await CommonService.GetCategoryById(recipeDetailsToJSON.categoryId)
            const subCategory = await AuthService.SubCategory.FindById(recipeDetailsToJSON.subCategoryId)
            delete recipeDetailsToJSON.categoryId
            delete recipeDetailsToJSON.subCategoryId
            recipeDetailsToJSON.categoryName = category.name
            recipeDetailsToJSON.subCategoryName = subCategory.name
            if (recipeDetailsToJSON.MediaObjects.length > 0) {
                recipeDetailsToJSON.imageUrl = recipeDetailsToJSON.MediaObjects[0].imageUrl
            } else {
                recipeDetailsToJSON.imageUrl = null
            }
            delete recipeDetailsToJSON.MediaObjects
            return ResponseHelpers.SetSuccessResponse(recipeDetailsToJSON, res, CommonConfig.STATUS_CODE.CREATED)
        } catch (error) {
            next(error)
        }
    }
}

let CookController = {
    Recipe: Recipe
}

module.exports = CookController
