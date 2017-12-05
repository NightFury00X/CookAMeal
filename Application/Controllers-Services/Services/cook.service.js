let randomString = require('random-string'),
    db = require('../../Modals'),
    {generateToken} = require('../../../Configurations/Helpers/authentication'),
    CommonConfig = require('../../../Configurations/Helpers/common-config');

CookService = function () {
};

CookService.prototype.Recipe = {
    Add: async (recipe) => {
        const trans = await db.sequelize.transaction();
        try {
            let serving_days = JSON.parse(recipe.serving_days);
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
    }
};

module.exports = new CookService();