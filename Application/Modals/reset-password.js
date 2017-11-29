// The Social Model.
'use strict';

module.exports = function (sequelize, DataTypes) {
    // 1: The model schema.
    let modelDefinition = {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
        },
        random_key: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        token: {
            type: DataTypes.STRING(500),
            allowNull: false
        },
        is_valid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        valid_upto: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1 //in hour
        }
    };
    
    // 2: The model options.
    let modelOptions = {
        underscored: true
    };
    
    return sequelize.define('ResetPassword', modelDefinition, modelOptions);
};