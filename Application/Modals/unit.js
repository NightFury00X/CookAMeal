// The Address Model.
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
        unit_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        sort_name: {
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
    
    let Unit = sequelize.define('Unit', modelDefinition, modelOptions);
    
    Unit.associate = function (models) {
        Unit.hasOne(models.Ingredient, {onDelete: 'CASCADE'});
    };
    
    return Unit;
};