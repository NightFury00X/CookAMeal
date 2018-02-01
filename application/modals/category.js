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
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            set (value) {
                this.setDataValue('name', CommonConfig.toTitleCase(value))
            }
        },
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE
    }

    let Category = sequelize.define('Category', modelDefinition)

    Category.associate = function (models) {
        Category.hasMany(models.MediaObject, {
            foreignKey: {
                name: 'categoryId',
                onDelete: 'CASCADE'
            }
        })
        Category.hasMany(models.Recipe, {
            foreignKey: {
                name: 'categoryId',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        Category.hasMany(models.CooksDealWithCategory, {
            foreignKey: {
                name: 'categoryId',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
    }

    return Category
}
