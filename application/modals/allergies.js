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
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE
    }

    let Allergy = sequelize.define('Allergy', modelDefinition)

    Allergy.associate = function (models) {
        Allergy.hasMany(models.RecipeAllergy, {
            foreignKey: {
                name: 'allergyId',
                onDelete: 'CASCADE'
            }
        })
    }

    return Allergy
}
