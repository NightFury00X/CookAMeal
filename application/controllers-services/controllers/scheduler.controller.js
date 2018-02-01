const SchedulerService = require('../services/scheduler.service')
const braintree = require('braintree')
const moment = require('moment')
const config = require('../../../configurations/main')

const gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: config.braintree.merchantId,
    publicKey: config.braintree.publicKey,
    privateKey: config.braintree.privateKey
})

const Order = {
    CancelOrder: async () => {
        try {
            const transactionList = await SchedulerService.Order.GetAllTransactionDetails()
            for (const transaction of transactionList) {
                console.log(transaction.status)
                const transactionDetails = await gateway.transaction.find(transaction.transactionId)
                if (transactionDetails.status === transaction.status) {
                    console.log('Details: ', transactionDetails.status)
                } else {
                    // update transaction details
                    await SchedulerService.Order.UpdateTransactionStatus(transaction.transactionId, transactionDetails.status)
                    console.log('Details: ', transactionDetails.status)
                }
            }
            // const ordersList = await SchedulerService.Order.GetOrdersListForCancellation()
            // for (const order of ordersList) {
            //     const result = await SchedulerService.Order.CancelOrderById(order.id)
            //     console.log('Result: ', result)
            // }
        } catch (error) {
            console.log('Error: ', error)
        }
    }
}

const User = {
    InvalidateForgetPasswordToken: async () => {
        try {
            const resetPasswordRequests = await SchedulerService.User.GetAllValidResetPasswordRequests()
            for (const request of resetPasswordRequests) {
                console.log('==========================================================')
                console.log(request.createdAt)
                const startDate = new Date(request.createdAt)
                const currentDate = new Date()
                const totalHours = moment(currentDate).diff(startDate, 'hours')
                if (totalHours >= 1) {
                    await SchedulerService.User.InvalidateForgetPasswordToken(request.id)
                }
                console.log('==========================================================')
            }
        } catch (error) {
            console.log('Error: ', error)
        }
    }
}

const SchedulerController = {
    Order: Order,
    User: User
}

module.exports = SchedulerController
