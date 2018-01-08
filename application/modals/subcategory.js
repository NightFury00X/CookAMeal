// The SubCategory Model.
'use strict'

const CommonConfig = require('../../configurations/helpers/common-config')
module.exports = function (sequelize, DataTypes) {
    // 1: The model schema.
    let modelDefinition = {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                is: {
                    args: ['^^[a-zA-Z-,]+(\\s{0,1}[a-zA-Z-, ])*$', 'i'],
                    msg: 'The category name you have entered is contains some bed characters.'
                }
            },
            set (value) {
                this.setDataValue('name', CommonConfig.toTitleCase(value))
            }
        },
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    }

    // 2: The model options.
    let modelOptions = {
        underscored: true
    }

    let SubCategory = sequelize.define('SubCategory', modelDefinition, modelOptions)

    SubCategory.associate = function (models) {
        SubCategory.hasMany(models.Recipe, {
            foreignKey: {
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
    }

    return SubCategory
}
