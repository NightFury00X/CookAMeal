let db = require('../../Modals'),
    CommonService = require('./common.service');
const CommonConfig = require("../../../Configurations/Helpers/common-config");

CookService = function () {
};

CookService.prototype.Recipe = {
    Add: async (recipe, files, user_type_id) => {
        const trans = await db.sequelize.transaction();
        try {
            let allergies;
            let serving_days;
            let ingredients;
            if (recipe.base_allergies)
                allergies = JSON.parse(recipe.base_allergies);
            if (recipe.serving_days)
                serving_days = JSON.parse(recipe.serving_days);
            if (recipe.ingredients)
                ingredients = JSON.parse(recipe.ingredients);
            const profile = await CommonService.User.GetProfileIdByUserTypeId(user_type_id);
            recipe.profile_id = profile.id;
            const recipeData = await db.Recipe.create(recipe, {transaction: trans});
            if (!recipeData) {
                await trans.rollback();
                return null;
            }
    
            //add allergies
            for (const index in allergies) {
                allergies[index].recipe_id = recipeData.id;
                let allergydata = await db.RecipeAllergy.create(allergies[index], {transaction: trans});
                if (!allergydata) {
                    await trans.rollback();
                    return null;
                }
            }
    
            //store recipe image
            for (let index in files.recipe) {
                files.recipe[index].recipe_id = recipeData.id;
                files.recipe[index].object_type = CommonConfig.OBJECT_TYPE.RECIPE;
                files.recipe[index].imageurl = CommonConfig.FILE_LOCATIONS.RECIPE + files.recipe[index].filename;
    
                console.log(files.recipe[index]);
                const recipeImage = await db.MediaObject.create(files.recipe[index], {transaction: trans});
                console.log(recipeImage);
                if (!recipeImage) {
                    await trans.rollback();
                    return null;
                }
            }
    
            if (serving_days.length > 0) {
                serving_days = serving_days[0];
                console.log('Serving days: ', serving_days);
                serving_days.recipe_id = recipeData.id;
                const daysData = await db.Day.create(serving_days, {transaction: trans});
                if (!daysData) {
                    await trans.rollback();
                    return null;
                }
            }
            for (const index in ingredients) {
                ingredients[index].recipe_id = recipeData.id;
                let ingredientData = await db.Ingredient.create(ingredients[index], {transaction: trans});
                if (!ingredientData) {
                    await trans.rollback();
                    return null;
                }
            }
            await trans.commit();
            return true;
        } catch (error) {
            console.log(error);
            await trans.rollback();
            throw (error);
        }
    },
    GetAllRecipeBySubCategory: async (profileId) => {
        try {
            return await db.SubCategory.findAll({
                attributes: ['id', 'name'],
                include: [{
                    attributes: ['id', 'dish_name', 'cost_per_serving', 'order_by_date_time'],
                    model: db.Recipe,
                    where: {
                        profile_id: profileId
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
                        attributes: ['imageurl']
                    }]
                }]
            });
        } catch (error) {
            throw (error);
        }
    },
    GetAllRecipeBySubCategoryById: async (profileId, Id) => {
        try {
            return await db.SubCategory.findAll({
                where: {id: Id},
                attributes: ['id', 'name'],
                include: [{
                    attributes: ['id', 'dish_name', 'cost_per_serving', 'order_by_date_time'],
                    model: db.Recipe,
                    where: {
                        profile_id: profileId
                    },
                    include: [{
                        model: db.MediaObject
                    }]
                }]
            });
        } catch (error) {
            throw (error);
        }
    }
};

module.exports = new CookService();