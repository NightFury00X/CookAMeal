'use strict'

const CommonConfig = require('../../configurations/helpers/common-config')

module.exports = function (sequelize, DataTypes) {
    let modelDefinition = {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        dishName: {
            type: DataTypes.STRING(150),
            allowNull: false,
            set (value) {
                this.setDataValue('dishName', CommonConfig.toTitleCase(value))
            }
        },
        preparationTime: {
            type: DataTypes.STRING,
            allowNull: false
        },
        cookTime: {
            type: DataTypes.STRING,
            allowNull: false
        },
        tags: {
            type: DataTypes.STRING,
            allowNull: false
        },
        costPerServing: {
            type: DataTypes.STRING,
            allowNull: true
        },
        availableServings: {
            type: DataTypes.STRING,
            allowNull: true
        },
        orderByDateTime: {
            type: DataTypes.STRING,
            allowNull: true
        },
        pickUpByDateTime: {
            type: DataTypes.STRING,
            allowNull: true
        },
        serve: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        deliveryFee: {
            type: DataTypes.STRING,
            allowNull: true
        },
        totalCostOfIngredients: {
            type: DataTypes.DECIMAL,
            allowNull: false
        },
        eligibleFor: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE
    }

    let modelOptions = {
        getterMethods: {
            preparationTimeInMinute () {
                return ConvertToMinute(this.preparationTime)
            },
            cookTimeInMinute () {
                return ConvertToMinute(this.cookTime)
            }
        }
    }

    let Recipe = sequelize.define('Recipe', modelDefinition, modelOptions)

    Recipe.associate = function (models) {
        Recipe.hasOne(models.Day, {
            foreignKey: {
                name: 'recipeId',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        Recipe.hasMany(models.Ingredient, {
            foreignKey: {
                name: 'recipeId',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        Recipe.hasMany(models.MediaObject, {
            foreignKey: {
                name: 'recipeId',
                onDelete: 'CASCADE'
            }
        })
        Recipe.hasMany(models.RecipeAllergy, {
            foreignKey: {
                name: 'recipeId',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        Recipe.hasMany(models.Review, {
            foreignKey: {
                name: 'recipeId',
                onDelete: 'CASCADE'
            }
        })
        Recipe.hasMany(models.Favorite, {
            foreignKey: {
                name: 'recipeId',
                onDelete: 'CASCADE'
            }
        })
        Recipe.hasMany(models.OrderItem, {
            foreignKey: {
                name: 'recipeId',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        Recipe.hasMany(models.CartItem, {
            foreignKey: {
                name: 'recipeId',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        Recipe.hasMany(models.PreparationMethod, {
            foreignKey: {
                name: 'recipeId',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })

        Recipe.hasOne(models.RecipesGeoLocations, {
            foreignKey: {
                name: 'recipeId',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
    }
    return Recipe
}

/**
 * @return {string}
 */
function ConvertToMinute (time) {
    if (time) {
        let tempTime = time.split(':')
        let hrs = tempTime[0]
        let hours = (hrs / 60)
        let rhours = Math.floor(hours)
        let minutes = (hrs - rhours) * 60
        let mnt = tempTime[1]
        return (minutes + parseInt(mnt)) + ' Minutes'
    }
}
