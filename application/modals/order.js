'use strict'
module.exports = function (sequelize, DataTypes) {
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
                    this.setDataValue('orderType', 'Order-Food')
                } else {
                    this.setDataValue('orderType', 'Hire-a-Cook')
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
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                isIn: {
                    args: [[0, 1, 2]],
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
                    args: [[0, 1]],
                    msg: 'Invalid Payment State.'
                }
            }
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
