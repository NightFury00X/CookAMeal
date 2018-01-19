const Sequelize = require('sequelize')
const Op = Sequelize.Op
const braintree = require('braintree')
const db = require('../../modals')
const CommonConfig = require('../../../configurations/helpers/common-config')
const config = require('../../../configurations/main')

const gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: config.braintree.merchantId,
    publicKey: config.braintree.publicKey,
    privateKey: config.braintree.privateKey
})

Scheduler = function () {
}

Scheduler.prototype.Order = {
    GetAllTransactionDetails: async () => {
        try {
            return await db.TransactionDetail.findAll({
                attributes: ['transactionId', 'status'],
                where: {
                    status: {
                        [Op.eq]: 'submitted_for_settlement'
                    }
                }
            })
        } catch (error) {
            return false
        }
    },
    UpdateTransactionStatus: async (transactionId, status) => {
        try {
            return await db.TransactionDetail.update({
                status: status
            }, {
                where: {
                    [Op.and]: [{
                        transactionId: transactionId
                    }]
                }
            })
        } catch (error) {
            return false
        }
    },
    GetOrdersListForCancellation: async () => {
        try {
            return await db.Order.findAll({
                attributes: ['id'],
                where: {
                    [Op.and]: [{
                        orderState: CommonConfig.ORDER.ORDER_STATE.PENDING,
                        paymentState: CommonConfig.ORDER.PAYMENT_STATE.COMPLETE,
                        isAccepted: false
                    }]
                }
            })
        } catch (error) {
            console.log('Error: ', error)
            return false
        }
    },
    CancelOrderById:
        async (orderId) => {
            try {
                console.log('order Id: ', orderId)
                const transaction = await db.TransactionDetail.findOne({
                    attributes: ['transactionId'],
                    where: {
                        orderId: {
                            [Op.eq]: orderId
                        }
                    }
                })
                if (!transaction) {
                    return false
                }
                const refunded = await gateway.transaction.refund(transaction.transactionId)
                console.log('Message: ', refunded)
                if (!refunded || !refunded.success) {
                    return false
                }
                console.log('Refunded: ', refunded)
                return await db.Order.update({
                    orderState: CommonConfig.ORDER.ORDER_STATE.CANCEL
                }, {
                    where: {
                        [Op.and]: [{
                            id: orderId,
                            orderState: CommonConfig.ORDER.ORDER_STATE.PENDING,
                            paymentState: CommonConfig.ORDER.PAYMENT_STATE.COMPLETE,
                            isAccepted: false
                        }]
                    }
                })
            } catch (error) {
                console.log('Error: ', error)
                return false
            }
        }
}

module.exports = new Scheduler()
