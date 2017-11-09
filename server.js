'use strict';

let express = require('express'),
    bodyParser = require('body-parser'),
    expressValidator = require('express-validator'),
    morgan = require('morgan'),
    passport = require('passport'),
    errorHandler = require('errorhandler'),
    log = require('./Configurations/Libs/Log')(module),
    config = require('./Configurations/Main/config'),
    db = require('./Application/Modals'),
    heltmet = require('helmet');

// App related modules.
let hookJWTStrategy = require('./Configurations/Passport/passport-strategy');

// Initializations.
let app = express();

// Parse as urlencoded and json.
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(expressValidator());

// Hook up the HTTP logger.
app.use(morgan('dev'));

app.use(errorHandler());

// Hook up Passport.
app.use(passport.initialize());

// Hook the passport JWT strategy.
hookJWTStrategy(passport);

// Helmet
// app.use(heltmet());

// global.Domain = require('./Configurations/Domains/domain');

// Bundle API routes.
app.use('/api', require('./Routes/routes')(passport));

db.sequelize.sync({ Force: true
})
    .then(startApp)
    .catch(function (e) {
        throw new Error(e);
    });

function startApp() {
    app.listen(config.server.port, function () {
        console.log('Express server listening on port ' + config.server.port);
    });
}

// Enable CORS from client-side
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8081');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

app.use(function (req, res) {
    res.status(404);
    log.debug('Not found URL: %s', req.url);
    res.send({error: 'URL [' + req.url + '] not found!'});
});

app.use(function (err, req, res) {
    res.status(err.status || 500);
    log.error('Internal error(%d): %s', res.statusCode, err.message);
    res.send({error: err.message});
});