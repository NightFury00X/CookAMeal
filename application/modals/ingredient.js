// The Ingredients Model.
'use strict';

const CommonConfig = require("../../configurations/helpers/common-config");
module.exports = function (sequelize, DataTypes) {
    // 1: The model schema.
    let modelDefinition = {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            set(value) {
                this.setDataValue('name', CommonConfig.toTitleCase(value));
            }
        },
        qty: {
            type: DataTypes.STRING,
            allowNull: false
        },
        cost: {
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
    
    let Ingredient = sequelize.define('Ingredient', modelDefinition, modelOptions);
    
    Ingredient.associate = function (models) {
        Ingredient.belongsTo(models.Unit, {onDelete: 'CASCADE'});
    };
    
    return Ingredient;
    
    
};