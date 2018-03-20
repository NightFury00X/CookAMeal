'use strict'

const CommonConfig = require('../../configurations/helpers/common-config')
module.exports = function (sequelize, DataTypes) {
    let modelDefinition = {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            set (value) {
                this.setDataValue('name', CommonConfig.toTitleCase(value))
            }
        },
        qty: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        cost: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE
    }

    let Ingredient = sequelize.define('Ingredient', modelDefinition)

    Ingredient.associate = function (models) {
        Ingredient.belongsTo(models.Unit, {
            foreignKey: {
                name: 'unitId',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
    }

    return Ingredient
}
