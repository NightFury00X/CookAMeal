// Application configuration.
'use strict';

let config = module.exports;

config.db = {
    user: 'root',
    password: '',
    name: 'cookameal'
};

config.server = {
    port: 8081,
    test_env: 'test',
    test_port: 3001,
};

config.db.details = {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql'
};


config.keys = {
    secret: '/jVdfUX+u/Kn3qPY4+ahjwQgyV5UhkM5cdh1i2xhozE=' // Not anymore...
};

config.SALT_WORK_FACTOR = 12;

let userRoles = config.userRoles = {
    guest: 1,    // ...001
    user: 2,     // ...010
    admin: 4,    // ...100
    cook: 5,
    customer: 6
};

config.accessLevels = {
    guest: userRoles.guest | userRoles.user | userRoles.admin,    // ...111
    user: userRoles.user | userRoles.admin,                       // ...110
    admin: userRoles.admin                                        // ...100
};