'use strict'
const express = require('express')
const bodyParser = require('body-parser')
const heltmet = require('helmet')
const expressValidator = require('express-validator')
const passport = require('passport')
const errorHandler = require('errorhandler')
const winston = require('winston')
const expressWinston = require('express-winston')
const compression = require('compression')
const mkdirp = require('mkdirp')
const fs = require('fs')
const cors = require('cors')
const db = require('./application/modals')
const config = require('./configurations/main')
const CommonConfig = require('./configurations/helpers/common-config')
const path = require('path')
require('winston-daily-rotate-file')
const cron = require('node-cron')
const SchedulerController = require('./application/controllers-services/controllers/scheduler.controller')

const task = cron.schedule('* * * * */3', function () {
    console.log('Scheduler started')
    SchedulerController.Order.CancelOrder()
}, false)

const task2 = cron.schedule('*/1 * * * *', function () {
    console.log('Invalidate Reset Password Token Scheduler started')
    SchedulerController.User.InvalidateForgetPasswordToken()
}, false)

// task2.start()

// task.start()

const logger = new (winston.Logger)({
    expressFormat: true,
    transports: [
        new winston.transports.Console({
            json: false,
            colorize: true
        })
    ]
})
const uploadFileLocation = path.resolve('/uploads')
const logLocation = path.resolve('/logs/errors')

mkdirp.sync(uploadFileLocation)
mkdirp.sync(logLocation)
config.UPLOAD_LOCATION.forEach(function (location) {
    if (!fs.existsSync(location.PATH)) {
        fs.mkdirSync(location.PATH)
    }
})
const app = express()
const server = require('http').createServer(app)
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(expressValidator())
// app.use(function (req, res, next) {
//     for (let item in req.body) {
//         if (req.body.hasOwnProperty(item)) {
//             req.sanitize(item).escape()
//         }
//     }
//     next()
// })
app.use(compression())
app.use(errorHandler())
app.use(passport.initialize())

const whitelist = ['http://cookamealpwa.cynotecksandbox.com']
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    'methods': 'GET, HEAD ,PUT ,PATCH ,POST ,DELETE',
    'preflightContinue': false,
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials',
    'Access-Control-Allow-Credentials': true
}

if (app.get('env') === 'development') {
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials')
        res.header('Access-Control-Allow-Credentials', 'true')
        if (req.method === 'OPTIONS') {
            res.sendStatus(200)
        } else {
            next()
        }
    })
} else {
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials')
        res.header('Access-Control-Allow-Credentials', 'true')
        if (req.method === 'OPTIONS') {
            res.sendStatus(200)
        } else {
            next()
        }
    })
}
app.use(heltmet())
app.use(expressWinston.logger({
    expressFormat: true,
    colorize: true,
    exitOnError: true,
    transports: [
        new winston.transports.Console({
            json: false,
            colorize: true
        })
    ],
    meta: true,
    requestWhitelist: ['url', 'headers', 'method', 'httpVersion', 'originalUrl', 'query'],
    statusLevels: true, // default value
    level: function (req, res) {
        let level = ''
        if (res.statusCode >= 100) {
            level = 'info'
        }
        if (res.statusCode >= 400) {
            level = 'warn'
        }
        if (res.statusCode >= 500) {
            level = 'error'
        }
        // Ops is worried about hacking attempts so make Unauthorized and Forbidden critical
        if (res.statusCode === 401 || res.statusCode === 403) {
            level = 'critical'
        }
        // No one should be using the old path, so always warn for those
        if (req.path === '/v1' && level === 'info') {
            level = 'warn'
        }
        return level
    }
}))
require('./routes/routes')(app)
app.use(expressWinston.errorLogger({
    expressFormat: true,
    exitOnError: false,
    transports: [
        new winston.transports.DailyRotateFile({
            name: 'file',
            datePattern: 'yyyy-MM-dd',
            colorize: true,
            json: true,
            filename: './logs/errors/error_log',
            maxsize: 50 * 1024 * 1024,
            prepend: true
        })
    ],
    meta: true
}))
db.sequelize.sync(
    {Force: true}
)
    .then(startApp)
    .catch(function (error) {
        throw new Error(error)
    })

function startApp () {
    let protocol = config.app.ssl ? 'https' : 'http'
    let port = process.env.PORT || config.app.port
    let appUrl = protocol + '://' + config.app.host + ':' + port
    let env = process.env.NODE_ENV ? ('[' + process.env.NODE_ENV + ']') : '[development]'
    logger.info('Initiated...', env)
    server.listen(port, function () {
        logger.info(config.app.title + ' listening at ' + appUrl + ' ' + env)
    })
}

app.use(function (req, res, next) {
    console.log('Error: ')
    const err = new Error('The Route ' + req.url + ' is Not Found')
    err.status = 404
    next(err)
})
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        console.log('Error: ', err)
        res.status(err.status || CommonConfig.STATUS_CODE.INTERNAL_SERVER_ERROR).send(
            {
                success: false,
                data: null,
                error: err.message,
                errorStack: {
                    error: err
                },
                status: err.status
            }
        )
        next()
    })
} else {
    app.use(function (err, req, res, next) {
        console.log('Error: ', err)
        res.status(err.status || CommonConfig.STATUS_CODE.INTERNAL_SERVER_ERROR).send(
            {
                success: false,
                data: null,
                error: err.message,
                status: err.status
            }
        )
        next()
    })
}
