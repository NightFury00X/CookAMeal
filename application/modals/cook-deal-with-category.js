// The Certificate Model.
'use strict'

module.exports = function (sequelize, DataTypes) {
    // 1: The model schema.
    let modelDefinition = {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        latitude: {
            type: DataTypes.FLOAT
        },
        longitude: {
            type: DataTypes.FLOAT
        },
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    }

    // 2: The model options.
    let modelOptions = {
        underscored: true
    }

    const CookDealWithCategory = sequelize.define('CooksDealWithCategory', modelDefinition, modelOptions)

    CookDealWithCategory.associate = function (models) {
        CookDealWithCategory.belongsTo(models.Profile, {
            foreignKey: {
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
    }

    return CookDealWithCategory
}
