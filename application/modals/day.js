// The Day Model.
'use strict';

module.exports = function (sequelize, DataTypes) {
    // 1: The model schema.
    let modelDefinition = {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        mon: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        tue: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        wed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        thu: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        fri: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        sat: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        sun: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    };
    
    // 2: The model options.
    let modelOptions = {
        underscored: true
    };
    
    return sequelize.define('Day', modelDefinition, modelOptions);
};