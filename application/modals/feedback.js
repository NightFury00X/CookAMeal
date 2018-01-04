// The Favorite Model.
'use strict';

module.exports = function (sequelize, DataTypes) {
    // 1: The model schema.
    let modelDefinition = {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        feedbackType: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: {
                    args: [['bug', 'feedback']],
                    msg: "Invalid feedback type."
                }
            }
        },
        feedbackAs: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: {
                    args: [['cook', 'customer', 'Cook', 'Customer', 'COOK', 'CUSTOMER']],
                    msg: "Invalid user type."
                }
            }
        },
        comments: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    };
    
    // 2: The model options.
    let modelOptions = {
        underscored: true
    };
    
    return sequelize.define('Feedback', modelDefinition, modelOptions);
};