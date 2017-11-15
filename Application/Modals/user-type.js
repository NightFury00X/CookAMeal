// The User Type Model.
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
        userid: {
            type: DataTypes.STRING,
            allowNull: false
        },
        type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                isIn: {
                    args: [['1', '2']], // 1 - normal login, 2 -facebook login
                    msg: "Invalid user type."
                }
            }
        },
        role: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                isIn: {
                    args: [['1', '2']],
                    msg: "Invalid user type."
                }
            }
        },
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    };
    
    // 2: The model options.
    let modelOptions = {
        underscored: true,
        getterMethods: {
            userInfo() {
                return {
                    id: this.id,
                    username: this.userid,
                    role: this.role,
                    type: this.type
                }
            }
        }
    };
    
    let UserTypeModel = sequelize.define('UserType', modelDefinition, modelOptions);
    
    UserTypeModel.associate = function (models) {
        UserTypeModel.hasMany(models.User, {onDelete: 'CASCADE'});
        UserTypeModel.hasMany(models.Profile, {onDelete: 'CASCADE'});
        UserTypeModel.hasMany(models.MediaObject, {onDelete: 'CASCADE'});
    };
    
    return UserTypeModel;
};