'use strict'

module.exports = function (sequelize, DataTypes) {
    let modelDefinition = {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE
    }
    let Certificate = sequelize.define('Certificate', modelDefinition)

    Certificate.associate = function (models) {
        Certificate.hasOne(models.MediaObject, {
            foreignKey: {
                name: 'certificateId',
                onDelete: 'CASCADE'
            }
        })
    }

    return Certificate
}
