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
            allowNull: false,
            unique: {
                args: true,
                msg: 'Oops. Looks like you already have an account. Please try to login.',
                fields: [sequelize.fn('lower', sequelize.col('email'))]
            },
        },
        type: { // 1 - Normal User, 2 - Facebook User
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                isIn: {
                    args: [['1', '2']], 
                    msg: "Invalid user type."
                }
            }
        },
        role: {   // 1 - Cook, 2 - Customer, 3 - Admin
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                isIn: {
                    args: [['1', '2']],
                    msg: "Invalid user role."
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
        UserTypeModel.hasOne(models.User);
        UserTypeModel.hasOne(models.Profile);
        UserTypeModel.hasOne(models.MediaObject);
        UserTypeModel.hasOne(models.Address);
        UserTypeModel.hasOne(models.Category);
        UserTypeModel.hasOne(models.Certificate);
        UserTypeModel.hasOne(models.IdentificationCard);
    };
    
    return UserTypeModel;
};