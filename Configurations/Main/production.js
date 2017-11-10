exports.app = app = {
    title: 'Cook-A-Meal',
    host: '132.148.87.196',
    port: 5151,
    ssl: false
};

exports.logging = {
    // http://www.senchalabs.org/connect/middleware-logger.html
    express_format: '[:date] ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms ":referrer" :remote-addr'
};

exports.mysql = {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql',
    logging: false
};

exports.user = {
    dbname: 'cookameal',
    user: 'cookamealuser',
    password: 'Ngy97%h1'
};

exports.keys = {
    secret: '/jVdfUX+u/Kn3qPY4+ahjwQgyV5UhkM5cdh1i2xhozE=' // Not anymore...
};