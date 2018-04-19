module.exports = function (sequelize, DataTypes) {
    let modelDefinition = {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        orderId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isCancelled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        isRejected: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userType: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: {
                    args: [['COOK', 'CUSTOMER']],
                    msg: 'Invalid User Type.'
                }
            }
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE
    }

    return sequelize.define('OrderStateMaster', modelDefinition)
}
