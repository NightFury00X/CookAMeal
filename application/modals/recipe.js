// The Recipe Model.
'use strict';

const CommonConfig = require("../../configurations/helpers/common-config");

module.exports = function (sequelize, DataTypes) {
    // 1: The model schema.
    let modelDefinition = {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        dish_name: {
            type: DataTypes.STRING(150),
            allowNull: false,
            set(value) {
                this.setDataValue('dish_name', CommonConfig.toTitleCase(value));
            },
        },
        preparation_method: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        preparation_time: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        cook_time: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        tags: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        cost_per_serving: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        available_servings: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        order_by_date_time: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        pick_up_by_date_time: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        serve: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        delivery_fee: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        total_cost_of_ingredients: {
            type: DataTypes.DECIMAL,
            allowNull: false
        },
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    };
    
    // 2: The model options.
    let modelOptions = {
        getterMethods: {
            preparation_time_in_minute() {
                return ConvertToMinute(this.preparation_time);
            },
            cook_time_in_minute() {
                return ConvertToMinute(this.cook_time);
            }
        },
        underscored: true
    };
    
    let Recipe = sequelize.define('Recipe', modelDefinition, modelOptions);
    
    Recipe.associate = function (models) {
        Recipe.hasOne(models.Day, {
            foreignKey: {
                name: 'recipe_id',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        });
        Recipe.hasMany(models.Ingredient, {
            foreignKey: {
                name: 'recipe_id',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        });
        Recipe.hasMany(models.MediaObject, {
            onDelete: 'CASCADE'
        });
        Recipe.hasMany(models.RecipeAllergy, {
            foreignKey: {
                name: 'recipe_id',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        });
        Recipe.hasMany(models.Review, {
            onDelete: 'CASCADE'
        });
        Recipe.hasMany(models.Favorite, {
            onDelete: 'CASCADE'
        });
    };
    return Recipe;
};

/**
 * @return {string}
 */
function ConvertToMinute(time) {
    if (time) {
        let temp_time = time.split(':');
        let hrs = temp_time[0];
        let hours = (hrs / 60);
        let rhours = Math.floor(hours);
        let minutes = (hrs - rhours) * 60;
        let mnt = temp_time[1];
        return (minutes + parseInt(mnt)) + ' Minutes';
    }
}