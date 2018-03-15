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
        type: {
            type: DataTypes.STRING(100),
            allowNull: false,
            set (value) {
                this.setDataValue('type', CommonConfig.toTitleCase(value))
            }
        },
        typeId: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false
        },
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE
    }

    let IdentificationCard = sequelize.define('IdentificationCard', modelDefinition)

    IdentificationCard.associate = function (models) {
        IdentificationCard.hasMany(models.MediaObject, {
            foreignKey: {
                name: 'identificationCardId',
                onDelete: 'CASCADE'
            }
        })
    }

    return IdentificationCard
}
