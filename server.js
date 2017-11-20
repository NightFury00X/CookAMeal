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
    cors = require('cors'),
    compression = require("compression"),
    mkdirp = require('mkdirp'),
    fileUpload = require('express-fileupload'),
    config = require('./Configurations/Main');

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
// app.use(fileUpload());
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

// app.use(express.logger({format: config.logging.express_format}));

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

// Enable CORS from client-side
// app.use(cors({
//     origin: ['http://localhost:8082'],
//     methods: ['GET', 'DELETE', 'PUT', 'OPTIONS'],
//     allowedHeaders: ['content-type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With', 'Access-Control-Allow-Credentials']
// }));
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials');
//     res.header('Access-Control-Allow-Credentials', 'true');
//     next();
// });

// Main middleware
app.use(function (err, req, res, next) {
    // Do logging and user-friendly error message display
    res.status(500).send(
        {
            success: false,
            data: '{}',
            error: err.message
        }
    );
    next();
});

// Routes
app.use(function (req, res, next) {
    next();
});

// app.use(function (req, res) {
//     res.status(404);
//     logger.error('Not found URL: %s', req.url);
//     res.send({error: 'URL [' + req.url + '] not found!'});
// });
//
// app.use(function (err, req, res) {
//     res.status(err.status || 500);
//     logger.error('Internal error(%d): %s', res.statusCode, err.message);
//     res.send({error: err.message});
// });