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
        errortype: {
            type: DataTypes.STRING
        },
        errorcode: {
            type: DataTypes.INTEGER
        },
        errormsg: {
            type: DataTypes.TEXT
        }
    };

    // 2: The model options.
    let modelOptions = {
        underscored: true
    };

    return sequelize.define('hello', modelDefinition, modelOptions);
};