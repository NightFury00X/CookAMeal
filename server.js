'use strict'
let express = require('express')
let bodyParser = require('body-parser')
let heltmet = require('helmet')
let expressValidator = require('express-validator')
let passport = require('passport')
let errorHandler = require('errorhandler')
let winston = require('winston')
let expressWinston = require('express-winston')
let compression = require('compression')
let mkdirp = require('mkdirp')
let fs = require('fs')
let db = require('./application/modals')
let config = require('./configurations/main')
let CommonConfig = require('./configurations/helpers/common-config')
let path = require('path')
require('winston-daily-rotate-file')

let logger = new (winston.Logger)({
    expressFormat: true,
    transports: [
        new winston.transports.Console({
            json: false,
            colorize: true
        })
    ]
})
let uploadFileLocation = path.resolve('/uploads')
let logLocation = path.resolve('/logs/errors')
mkdirp.sync(uploadFileLocation)
mkdirp.sync(logLocation)
config.UPLOAD_LOCATION.forEach(function (location) {
    if (!fs.existsSync(location.PATH)) {
        fs.mkdirSync(location.PATH)
    }
})
let app = express()
let server = require('http').createServer(app)
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
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials')
    res.header('Access-Control-Allow-Credentials', 'true')
    if (req.method === 'OPTIONS') {
        res.send(200)
    } else {
        next()
    }
})
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
            datePattern: '_dd-MM-yyyy.log',
            colorize: true,
            json: true,
            filename: './logs/errors/error_log',
            maxsize: 50 * 1024 * 1024,
            maxFiles: 10,
            zippedArchive: true
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
    let err = new Error('The Route ' + req.url + ' is Not Found')
    err.status = 404
    next(err)
})
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        const errorMessage = err.status !== 404 ? CommonConfig.ERRORS.UNABLE_TO_PROCESS : err.message
        res.status(err.status || CommonConfig.STATUS_CODE.INTERNAL_SERVER_ERROR).send(
            {
                success: false,
                data: null,
                error: errorMessage,
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
        const errorMessage = err.status === 500 ? CommonConfig.ERRORS.UNABLE_TO_PROCESS : err.message
        res.status(err.status || CommonConfig.STATUS_CODE.INTERNAL_SERVER_ERROR).send(
            {
                success: false,
                data: null,
                error: err,
                status: err.status
            }
        )
        next()
    })
}
