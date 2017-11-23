// The Social Model.
'use strict';
let CommonConfig = require('../../Configurations/Helpers/common-config');

module.exports = function (sequelize, DataTypes) {
    // 1: The model schema.
    let modelDefinition = {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        typeId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false
        },
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    };
    
    // 2: The model options.
    let modelOptions = {
        hooks: {
            beforeCreate: UpdateLinkedMediaObject
        },
        underscored: true
    };
    
    let IdentificationCard = sequelize.define('IdentificationCard', modelDefinition, modelOptions);
    
    IdentificationCard.associate = function (models) {
        IdentificationCard.belongsTo(models.MediaObject);
    };
    
    return IdentificationCard;
};

function UpdateLinkedMediaObject(model, trans) {
    let MediaObject = this.associations.MediaObject.target;
    MediaObject.update({
        linkedObject: model.id
    }, {
        where: {
            user_type_id: model.user_type_id,
            objectType: CommonConfig.ObjectType.IdentificationCard
        }
    }, {transaction: trans}).then(function (media) {
        console.log('Update')
    });
}