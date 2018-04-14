'use strict'
const Country = require('../../configurations/helpers/helper').Country

const CommonConfig = require('../../configurations/helpers/common-config')
module.exports = function (sequelize, DataTypes) {
    let modelDefinition = {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        street: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        city: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                is: {
                    args: ['^^[a-zA-Z-,]+(\\s{0,1}[a-zA-Z-, ])*$', 'i'],
                    msg: 'The city you have entered is contains some bed characters.'
                }
            },
            set (value) {
                this.setDataValue('city', CommonConfig.toTitleCase(value))
            }
        },
        state: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                is: {
                    args: ['^^[a-zA-Z-,]+(\\s{0,1}[a-zA-Z-, ])*$', 'i'],
                    msg: 'The state you have entered is contains some bed characters.'
                }
            },
            set (value) {
                this.setDataValue('state', CommonConfig.toTitleCase(value))
            }
        },
        zipCode: {
            type: DataTypes.STRING(8),
            allowNull: false,
            validate: {
                isNumeric: {
                    args: ['^^[a-zA-Z-,]+(\\s{0,1}[a-zA-Z-, ])*$', 'i'],
                    msg: 'The zipcode you have entered is contains some bed characters.'
                }
            }
        },
        country: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                is: {
                    args: ['^^[a-zA-Z-,]+(\\s{0,1}[a-zA-Z-, ])*$', 'i'],
                    msg: 'The country you have entered is contains some bed characters.'
                }
            },
            set (value) {
                this.setDataValue('country', CommonConfig.toTitleCase(value))
            }
        },
        currencyCode: {
            type: DataTypes.STRING(5),
            allowNull: false
        },
        currencySymbol: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        latitude: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        longitude: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE
    }
    let modelOptions = {
        hooks: {
            beforeValidate: FindConutryDetails
        }
    }

    const Address = sequelize.define('Address', modelDefinition, modelOptions)

    Address.associate = function (models) {
        Address.hasMany(models.Order, {
            foreignKey: {
                name: 'deliveredToCurrentAddressId',
                onDelete: 'CASCADE'
            }
        })
    }

    return Address
}

async function FindConutryDetails (address) {
    const currencyDetails = await Country.GetCourrencyDetailsByCountryName(address.country)
    address.currencyCode = currencyDetails.code
    address.currencySymbol = currencyDetails.symbol
}
