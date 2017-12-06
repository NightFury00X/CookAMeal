let db = require('../../Modals');

CookService = function () {
};

CookService.prototype.Recipe = {
    Add: async (recipe) => {
        const trans = await db.sequelize.transaction();
        try {
            let serving_days = JSON.parse(recipe.serving_days);
            console.log('Data: ', recipe);
            let ingredients = JSON.parse(recipe.ingredients);
            let recipeData = await db.Recipe.create(recipe, {transaction: trans});
            if (!recipeData) {
                await trans.rollback();
                return null;
            }

            serving_days.recipe_id = recipeData.id;
            serving_days = serving_days[0];
            let daysData = await db.Day.create(serving_days, {transaction: trans});
            if (!daysData) {
                await trans.rollback();
                return null;
            }

            for (let index in ingredients) {
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
                        model: db.MediaObject
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