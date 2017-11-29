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
        user_id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
                args: true,
                msg: 'Oops. Looks like you already have an account. Please try to login.',
                fields: [sequelize.fn('lower', sequelize.col('email'))]
            },
        },
        user_type: { // 1 - Normal User, 2 - Facebook User
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                isIn: {
                    args: [['1', '2']],
                    msg: "Invalid user type."
                }
            }
        },
        user_role: {   // 1 - Cook, 2 - Customer, 3 - Admin
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
                    username: this.user_id,
                    user_role: this.user_role,
                    user_type: this.user_type
                }
            }
        }
    };
    
    let UserTypeModel = sequelize.define('UserType', modelDefinition, modelOptions);
    
    UserTypeModel.associate = function (models) {
        UserTypeModel.hasOne(models.User, {onDelete: 'CASCADE'});
        UserTypeModel.hasOne(models.Profile, {onDelete: 'CASCADE'});
        UserTypeModel.hasMany(models.BlackListedToken, {onDelete: 'CASCADE'});
        UserTypeModel.hasMany(models.ResetPassword, {onDelete: 'CASCADE'});
    };
    
    return UserTypeModel;
};