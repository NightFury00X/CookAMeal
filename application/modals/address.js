// The Address Model.
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
        street: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                is: {
                    args: ["^^[a-zA-Z-,]+(\\s{0,1}[a-zA-Z-, ])*$", 'i'],
                    msg: 'The city you have entered is contains some bed characters.'
                }
            },
            set(value) {
                this.setDataValue('city', CommonConfig.toTitleCase(value));
            }
        },
        state: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                is: {
                    args: ["^^[a-zA-Z-,]+(\\s{0,1}[a-zA-Z-, ])*$", 'i'],
                    msg: 'The state you have entered is contains some bed characters.'
                }
            },
            set(value) {
                this.setDataValue('state', CommonConfig.toTitleCase(value));
            }
        },
        zip_code: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isNumeric: {
                    args: ["^^[a-zA-Z-,]+(\\s{0,1}[a-zA-Z-, ])*$", 'i'],
                    msg: 'The zipcode you have entered is contains some bed characters.'
                }
            }
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                is: {
                    args: ["^^[a-zA-Z-,]+(\\s{0,1}[a-zA-Z-, ])*$", 'i'],
                    msg: 'The country you have entered is contains some bed characters.'
                }
            },
            set(value) {
                this.setDataValue('country', CommonConfig.toTitleCase(value));
            }
        },
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    };
    
    // 2: The model options.
    let modelOptions = {
        underscored: true
    };
    
    return sequelize.define('Address', modelDefinition, modelOptions);
};