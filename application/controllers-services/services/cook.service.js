const Sequelize = require('sequelize')
const Op = Sequelize.Op
const db = require('../../modals')
const CommonService = require('./common.service')
const MapService = require('./map-service')
const CommonConfig = require('../../../configurations/helpers/common-config')

CookService = function () {
}

CookService.prototype.Recipe = {
    GetMyAllRecipesList: async (profileId) => {
        try {
            return await db.Recipe.findAll({
                attributes: ['id', 'dishName', 'createdAt', 'subCategoryId', 'categoryId'],
                include: [{
                    model: db.MediaObject,
                    attributes: ['imageUrl']
                }],
                where: {
                    profileId: {
                        [Op.eq]: `${profileId}`
                    }
                }
            })
        } catch (error) {
            throw (error)
        }
    },
    Add: async (recipe, files, userTypeId) => {
        const trans = await db.sequelize.transaction()
        try {
            let allergies
            let servingDays
            let ingredients
            if (recipe.baseAllergies) {
                allergies = JSON.parse(recipe.baseAllergies)
            }
            if (recipe.servingDays) {
                servingDays = JSON.parse(recipe.servingDays)
            }
            if (recipe.ingredients) {
                ingredients = JSON.parse(recipe.ingredients)
            }
            const profile = await CommonService.User.GetProfileIdByUserTypeId(userTypeId)
            recipe.profileId = profile.id
            const recipeData = await db.Recipe.create(recipe, {transaction: trans})
            if (!recipeData) {
                await trans.rollback()
                return null
            }
            const geoCordinations = await MapService.Map.FindGeoCordinationsByProfileId(profile.id)
            if (!geoCordinations) {
                await trans.rollback()
                return null
            }
            const cooksDealWith = await db.CooksDealWithCategory.findOne({
                where: {
                    [Op.and]: [{
                        CooksDealWithCategoryId: profile.id,
                        categoryId: recipe.categoryId
                    }]
                }
            })
            if (!cooksDealWith) {
                await db.CooksDealWithCategory.create({
                    latitude: geoCordinations.latitude,
                    longitude: geoCordinations.longitude,
                    cooksDealWithCategoryId: profile.id,
                    categoryId: recipe.categoryId
                }, {transaction: trans})
            }
            for (const index in allergies) {
                if (allergies.hasOwnProperty(index)) {
                    allergies[index].recipeId = recipeData.id
                    let allergydata = await db.RecipeAllergy.create(allergies[index], {transaction: trans})
                    if (!allergydata) {
                        await trans.rollback()
                        return null
                    }
                }
            }
            for (let index in files.recipe) {
                if (files.recipe.hasOwnProperty(index)) {
                    files.recipe[index].recipeId = recipeData.id
                    files.recipe[index].objectType = CommonConfig.OBJECT_TYPE.RECIPE
                    files.recipe[index].imageUrl = CommonConfig.FILE_LOCATIONS.RECIPE + files.recipe[index].filename
                    files.recipe[index].fileName = files.recipe[index].filename
                    files.recipe[index].originalName = files.recipe[index].originalname
                    files.recipe[index].mimeType = files.recipe[index].mimetype
                    delete files.recipe[index].filename
                    delete files.recipe[index].originalname
                    delete files.recipe[index].mimetype
                    const recipeImage = await db.MediaObject.create(files.recipe[index], {transaction: trans})
                    if (!recipeImage) {
                        await trans.rollback()
                        return null
                    }
                }
            }
            if (servingDays) {
                servingDays.recipeId = recipeData.id
                const daysData = await db.Day.create(servingDays, {transaction: trans})
                if (!daysData) {
                    await trans.rollback()
                    return null
                }
            }
            for (const index in ingredients) {
                if (ingredients.hasOwnProperty(index)) {
                    ingredients[index].recipeId = recipeData.id
                    let ingredientData = await db.Ingredient.create(ingredients[index], {transaction: trans})
                    if (!ingredientData) {
                        await trans.rollback()
                        return null
                    }
                }
            }
            await trans.commit()
            return true
        } catch (error) {
            await trans.rollback()
            throw (error)
        }
    },
    GetAllRecipeBySubCategory: async (profileId) => {
        try {
            return await db.SubCategory.findAll({
                attributes: ['id', 'name'],
                include: [{
                    attributes: ['id', 'dishName', 'costPerServing', 'orderByDateTime'],
                    model: db.Recipe,
                    where: {
                        profileId: {
                            [Op.eq]: profileId
                        }
                    },
                    include: [{
                        attributes: ['id'],
                        model: db.RecipeAllergy,
                        include: [{
                            attributes: ['id', 'name'],
                            model: db.Allergy
                        }]
                    }, {
                        model: db.MediaObject,
                        attributes: ['imageUrl']
                    }]
                }]
            })
        } catch (error) {
            throw (error)
        }
    },
    GetAllRecipeBySubCategoryById: async (profileId, Id) => {
        try {
            return await db.SubCategory.findAll({
                where: {
                    id: {
                        [Op.eq]: Id
                    }
                },
                attributes: ['id', 'name'],
                include: [{
                    attributes: ['id', 'dishName', 'costPerServing', 'orderByDateTime'],
                    model: db.Recipe,
                    where: {
                        profileId: {
                            [Op.eq]: profileId
                        }
                    },
                    include: [{
                        model: db.MediaObject
                    }]
                }]
            })
        } catch (error) {
            throw (error)
        }
    },
    GetDeliveryFeesByRecipeId: async (recipeId) => {
        try {
            return db.Recipe.findOne({
                attributes: ['costPerServing', 'availableServings', 'deliveryFee', 'profileId'],
                where: {
                    id: {
                        [Op.eq]: recipeId
                    }
                }
            })
        } catch (error) {
            throw (error)
        }
    }
}

CookService.prototype.Order = {
    CurrentOrders: async (createdBy) => {
        try {
            return await db.Order.findAll({
                where: {
                    createdBy: {
                        [Op.eq]: createdBy
                    }
                }
            })
        } catch (error) {
            throw (error)
        }
    }
}

module.exports = new CookService()
