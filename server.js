'use strict';

let express = require('express'),
    bodyParser = require('body-parser'),
    expressValidator = require('express-validator'),
    multer = require('multer'),
    json = require('morgan-json'),
    passport = require('passport'),
    errorHandler = require('errorhandler'),
    db = require('./Application/Modals'),
    heltmet = require('helmet'),
    winston = require('winston'),
    DailyRotateFile = require('winston-daily-rotate-file'),
    expressWinston = require('express-winston'),
    compression = require("compression"),
    mkdirp = require('mkdirp'),
    config = require('./Configurations/Main'),
    CommonConfig = require('./Configurations/Helpers/common-config');
// var multer = require('multer');
var upload = multer();

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
let hookJWTStrategy = require('./Configurations/Passport/passport-strategy');

// Upload file folder
let uploadFileLocation = __dirname + '/Uploads';

let logLocation = __dirname + '/logs/errors';

mkdirp.sync(uploadFileLocation);
mkdirp.sync(logLocation);

// Initializations.
let app = express();

let server = require('http').createServer(app);

// Parse as urlencoded and json.
app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());

app.use(expressValidator());

// Hook up the HTTP logger.
// const format = json(':remote-addr :remote-user :date :method :url HTTP:http-version :status :res[content-length] :referrer :user-agent');
// app.use(morgan(format));
const format = ':remote-addr :remote-user :date :method :url HTTP:http-version :status :res[content-length] :referrer :user-agent';
// app.use(morgan(format));

//To make requests lighter and load faster
app.use(compression());

app.use(errorHandler());

// Hook up Passport.
app.use(passport.initialize());

// Hook the passport JWT strategy.
hookJWTStrategy(passport);

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

// Helmet
app.use(heltmet());

app.use(expressWinston.logger({
    expressFormat: true,
    colorize: true,
    exitOnError:true,
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

app.use('/api', require('./Routes/routes')(passport));

// express-winston error Logger
app.use(expressWinston.errorLogger({
    expressFormat: true,
    exitOnError:false,
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
}));

// Optionally you can include your custom error handler after the logging.
// app.use(express.errorLogger({
//     dumpExceptions: true,
//     showStack: true
// }));

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

// Error Response Handler
app.use(function (err, req, res, next) {
    // Do logging and user-friendly error message display
    res.status(CommonConfig.StatusCode.INTERNAL_SERVER_ERROR).send(
        {
            success: false,
            data: '{}',
            error: err.message
        }
    );
    next();
});