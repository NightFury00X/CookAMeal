const SchedulerService = require('../services/scheduler.service')
const braintree = require('braintree')
const config = require('../../../configurations/main')

const gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: config.braintree.merchantId,
    publicKey: config.braintree.publicKey,
    privateKey: config.braintree.privateKey
})

let Order = {
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

let SchedulerController = {
    Order: Order
}

module.exports = SchedulerController
