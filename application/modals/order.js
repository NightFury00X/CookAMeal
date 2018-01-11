// The Order Model.
'use strict'
module.exports = function (sequelize, DataTypes) {
    // 1: The model schema.
    let modelDefinition = {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        orderType: {
            type: DataTypes.STRING(12),
            validate: {
                isIn: {
                    args: [['Hire-a-Cook', 'Order-Food']],
                    msg: 'Invalid spice Level.'
                }
            },
            set (value) {
                if (parseInt(value) === 0) {
                    this.setDataValue('orderType', 'Hire-a-Cook')
                } else {
                    this.setDataValue('orderType', 'Order-Food')
                }
            }
        },
        spiceLevel: {
            type: DataTypes.STRING(100),
            validate: {
                isIn: {
                    args: [['Mild', 'Medium', 'Hot']],
                    msg: 'Invalid spice Level.'
                }
            }
        },
        orderServings: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        specialInstruction: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        deliveryType: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        deliveryFee: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        pickUpTime: {
            type: DataTypes.TIME,
            allowNull: false
        },
        taxes: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        totalAmount: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        orderState: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'pending'
        },
        paymentState: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'pending'
        },
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    }

    // 2: The model options.
    let modelOptions = {
        underscored: true
    }

    let Order = sequelize.define('Order', modelDefinition, modelOptions)
    Order.associate = function (models) {
        Order.hasMany(models.OrderItem, {
            foreignKey: {
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        Order.hasMany(models.TransactionDetail, {
            foreignKey: {
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
    }
    return Order
}
