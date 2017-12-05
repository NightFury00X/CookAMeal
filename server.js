'use strict';

let express = require('express'),
    bodyParser = require('body-parser'),
    heltmet = require('helmet'),
    winston = require('winston'),
    expressValidator = require('express-validator'),
    passport = require('passport'),
    errorHandler = require('errorhandler'),
    DailyRotateFile = require('winston-daily-rotate-file'),
    expressWinston = require('express-winston'),
    compression = require("compression"),
    mkdirp = require('mkdirp'),
    fs = require('fs'),
    db = require('./Application/Modals'),
    config = require('./Configurations/Main'),
    CommonConfig = require('./Configurations/Helpers/common-config');

let logger = new (winston.Logger)({
    expressFormat: true,
    transports: [
        new winston.transports.Console({
            json: false,
            colorize: true,
        })
    ]
});

// App related modules.
// let hookJWTStrategy = require('./Configurations/Passport/passport-strategy');

// Upload file folder
let uploadFileLocation = __dirname + '/Uploads';

let logLocation = __dirname + '/Logs/Errors';

mkdirp.sync(uploadFileLocation);
mkdirp.sync(logLocation);

config.UPLOAD_LOCATION.forEach(function (location) {
    if (!fs.existsSync(location.PATH))
        fs.mkdirSync(location.PATH);
});

// Initializations.
let app = express();

let server = require('http').createServer(app);

// Parse as urlencoded and json.
app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());

app.use(expressValidator());

//To make requests lighter and load faster
app.use(compression());

app.use(errorHandler());

// Hook up Passport.
app.use(passport.initialize());

// Hook the passport JWT strategy.
// hookJWTStrategy(passport);

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials');
    res.header('Access-Control-Allow-Credentials', 'true');

    //intercepts OPTIONS method
    if ('OPTIONS' === req.method) {
        //respond with 200
        res.send(200);
    }
    else {
        //move on
        next();
    }
});

// Helmet
app.use(heltmet());

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
        let level = "";
        if (res.statusCode >= 100) {
            level = "info";
        }
        if (res.statusCode >= 400) {
            level = "warn";
        }
        if (res.statusCode >= 500) {
            level = "error";
        }
        // Ops is worried about hacking attempts so make Unauthorized and Forbidden critical
        if (res.statusCode === 401 || res.statusCode === 403) {
            level = "critical";
        }
        // No one should be using the old path, so always warn for those
        if (req.path === "/v1" && level === "info") {
            level = "warn";
        }
        return level;
    }
}));


// app.use('/api', require('./Routes/routes')(app));

require('./Routes/routes')(app);

// express-winston error Logger
app.use(expressWinston.errorLogger({
    expressFormat: true,
    exitOnError: false,
    transports: [
        new winston.transports.DailyRotateFile({
            name: 'file',
            datePattern: '_dd-MM-yyyy.log',
            colorize: true,
            json: true,
            filename: './Logs/Errors/error_log',
            maxsize: 50 * 1024 * 1024,
            maxFiles: 10,
            zippedArchive: true
        })
    ],
    meta: true
}));

db.sequelize.sync({
    Force: true
})
    .then(startApp)
    .catch(function (e) {
        throw new Error(e);
    });

function startApp() {
    let protocol = config.app.ssl ? 'https' : 'http';
    let port = process.env.PORT || config.app.port;
    let app_url = protocol + '://' + config.app.host + ':' + port;
    let env = process.env.NODE_ENV
        ? ('[' + process.env.NODE_ENV + ']') : '[development]';

    logger.info('Initiated...', env);
    server.listen(port, function () {
        logger.info(config.app.title + ' listening at ' + app_url + ' ' + env);
    });
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('The Route ' + req.url + ' is Not Found');
    err.status = 404;
    next(err);
});

// Error Response Handler
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        console.log(err);
        res.status(err.status || CommonConfig.STATUS_CODE.INTERNAL_SERVER_ERROR).send(
            {
                success: false,
                data: null,
                error: err.message,
                error_stack: {
                    error: err
                }
            }
        );
        next();
    });
} else {
    app.use(function (err, req, res, next) {
        // Do logging and user-friendly error message display
        res.status(err.status || CommonConfig.STATUS_CODE.INTERNAL_SERVER_ERROR).send(
            {
                success: false,
                data: null,
                error: err.message
            }
        );
        next();
    });
}
