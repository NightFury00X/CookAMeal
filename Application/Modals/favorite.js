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
        is_favorite: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        },
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    };
    
    // 2: The model options.
    let modelOptions = {
        underscored: true
    };
    
    let Favorite = sequelize.define('Favorite', modelDefinition, modelOptions);
    
    Favorite.associate = function (models) {
        Favorite.belongsTo(models.Recipe, {onDelete: 'CASCADE'});
    };
    
    return Favorite;
};