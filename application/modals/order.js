'use strict'
module.exports = function (sequelize, DataTypes) {
    let modelDefinition = {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
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
                    this.setDataValue('orderType', 'Order-Food')
                } else {
                    this.setDataValue('orderType', 'Hire-a-Cook')
                }
            }
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
            type: DataTypes.DATE,
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
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                isIn: {
                    args: [[0, 1, 2, 3]],
                    msg: 'Invalid State.'
                }
            }
        },
        paymentState: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                isIn: {
                    args: [[0, 1, 2]],
                    msg: 'Invalid Payment State.'
                }
            }
        },
        isCurrentAddress: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        isOrderFromCart: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        cookId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        isAccepted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE
    }

    let Order = sequelize.define('Order', modelDefinition)
    Order.associate = function (models) {
        Order.hasMany(models.OrderItem, {
            foreignKey: {
                name: 'orderId',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
        Order.hasMany(models.TransactionDetail, {
            foreignKey: {
                name: 'orderId',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        })
    }
    return Order
}
