// The Address Model.
'use strict';
const Country = require('../../configurations/helpers/helper').Country;

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
        street: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        city: {
            type: DataTypes.STRING(50),
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
            type: DataTypes.STRING(50),
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
            type: DataTypes.STRING(8),
            allowNull: false,
            validate: {
                isNumeric: {
                    args: ["^^[a-zA-Z-,]+(\\s{0,1}[a-zA-Z-, ])*$", 'i'],
                    msg: 'The zipcode you have entered is contains some bed characters.'
                }
            }
        },
        country: {
            type: DataTypes.STRING(50),
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
        currency_code: {
            type: DataTypes.STRING(5),
            allowNull: false
        },
        currency_symbol: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    };
    
    // 2: The model options.
    let modelOptions = {
        hooks: {
            beforeValidate: FindConutryDetails
        },
        underscored: true
    };
    
    return sequelize.define('Address', modelDefinition, modelOptions);
};


// Hashes the password for a user object.
async function FindConutryDetails(address) {
    const currencyDetails = await Country.GetCourrencyDetailsByCountryName(address.country);
    address.currency_code = currencyDetails.code;
    address.currency_symbol = currencyDetails.symbol;
}