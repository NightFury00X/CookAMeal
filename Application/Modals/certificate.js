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
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    };
    
    // 2: The model options.
    let modelOptions = {
        underscored: true
    };
    
    let Certificate = sequelize.define('Certificate', modelDefinition, modelOptions);
    
    Certificate.associate = function (models) {
        // Certificate.belongsTo(models.MediaObject);
        // Certificate.belongsTo(models.UserType);
    };
    
    return Certificate;
};