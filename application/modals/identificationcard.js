// The Identification Model.
'use strict';

const CommonConfig = require("../../configurations/helpers/common-config");
module.exports = function (sequelize, DataTypes) {
    // 1: The model schema.
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
            set(value) {
                this.setDataValue('type', CommonConfig.toTitleCase(value));
            }
        },
        type_id: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false
        },
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    };
    
    // 2: The model options.
    let modelOptions = {
        underscored: true
    };
    
    let IdentificationCard = sequelize.define('IdentificationCard', modelDefinition, modelOptions);
    
    IdentificationCard.associate = function (models) {
        IdentificationCard.hasOne(models.MediaObject, {
            onDelete: 'CASCADE'
        });
    };
    
    return IdentificationCard;
};