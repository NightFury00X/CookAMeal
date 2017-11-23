'use strict';

let express = require('express'),
    bodyParser = require('body-parser'),
    expressValidator = require('express-validator'),
    morgan = require('morgan'),
    passport = require('passport'),
    errorHandler = require('errorhandler'),
    db = require('./Application/Modals'),
    heltmet = require('helmet'),
    winston = require('winston'),
    compression = require("compression"),
    mkdirp = require('mkdirp'),
    config = require('./Configurations/Main'),
    CommonConfig = require('./Configurations/Helpers/common-config');


const logger = new (winston.Logger)({
    transports: [
        // colorize the output to the console
        new (winston.transports.Console)({colorize: true})
    ]
});

// App related modules.
let hookJWTStrategy = require('./Configurations/Passport/passport-strategy');

// Upload file folder
let uploadFileLocation = __dirname + '/Uploads';

mkdirp.sync(uploadFileLocation);

// Initializations.
let app = express();

let server = require('http').createServer(app);

// Parse as urlencoded and json.
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(expressValidator());

// Hook up the HTTP logger.
app.use(morgan('common'));

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

app.use('/api', require('./Routes/routes')(passport));

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

// Main middleware
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

// Routes Error 404
app.use(function (req, res, next) {
    // let err = new Error('The Route ' + req.url + ' is Not Found');
    // res.status(CommonConfig.StatusCode.NOT_FOUND).send(
    //     {
    //         success: false,
    //         data: '{}',
    //         error: err.message
    //     }
    // );
    next();
});