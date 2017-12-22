// The Ingredients Model.
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
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            set(value) {
                this.setDataValue('name', CommonConfig.toTitleCase(value));
            }
        },
        qty: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        cost: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    };
    
    // 2: The model options.
    let modelOptions = {
        underscored: true
    };
    
    let Ingredient = sequelize.define('Ingredient', modelDefinition, modelOptions);
    
    Ingredient.associate = function (models) {
        Ingredient.belongsTo(models.Unit, {
            foreignKey: {
                allowNull: false,
                onDelete: 'CASCADE'
            }
        });
    };
    
    return Ingredient;
    
    
};