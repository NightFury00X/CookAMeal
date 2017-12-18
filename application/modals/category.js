// The Category Model.
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
            validate: {
                is: {
                    args: ["^^[a-zA-Z-,]+(\\s{0,1}[a-zA-Z-, ])*$", 'i'],
                    msg: 'The category name you have entered is contains some bed characters.'
                }
            },
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
        Category.hasMany(models.MediaObject, { onDelete: 'CASCADE' });
        Category.hasMany(models.Recipe, { onDelete: 'CASCADE' });
    };
    
    return Category;
};