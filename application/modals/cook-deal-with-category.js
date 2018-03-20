'use strict'

module.exports = function (sequelize, DataTypes) {
    let modelDefinition = {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        latitude: {
            type: DataTypes.FLOAT
        },
        longitude: {
            type: DataTypes.FLOAT
        },
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE
    }

    const CookDealWithCategory = sequelize.define('CooksDealWithCategory', modelDefinition)

    CookDealWithCategory.associate = function (models) {
        CookDealWithCategory.belongsTo(models.Profile, {
            foreignKey: {
                name: 'cooksDealWithCategoryId',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
    }

    return CookDealWithCategory
}
