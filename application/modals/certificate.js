'use strict'

module.exports = function (sequelize, DataTypes) {
    let modelDefinition = {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE
    }
    let Certificate = sequelize.define('Certificate', modelDefinition)

    Certificate.associate = function (models) {
        Certificate.hasMany(models.MediaObject, {
            foreignKey: {
                name: 'certificateId',
                onDelete: 'CASCADE'
            }
        })
    }

    return Certificate
}
