// The Category Model.
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
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    };
    
    // 2: The model options.
    let modelOptions = {
        underscored: true
    };
    
    let Category = sequelize.define('Category', modelDefinition, modelOptions);
    
    Category.associate = function (models) {
        Category.hasMany(models.MediaObject, {
            onDelete: 'CASCADE'
        });
        Category.hasMany(models.Recipe,
            {
                foreignKey: {
                    allowNull: false,
                    onDelete: 'CASCADE'
                }
            });
    };
    
    return Category;
};