exports.app = app = {
    title: 'Cook-A-Meal',
    host: 'localhost',
    port: 8081,
    ssl: false
};

exports.logging = {
    // http://www.senchalabs.org/connect/middleware-logger.html
    express_format: '[:date] ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms ":referrer" :remote-addr'
};

exports.mssql = {
    host: 'CYNODT022',
    dialect: 'mssql',
    define: {
        schema: "dbo",
        freezeTableName: true,
    },
    logging: false,
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
};

exports.user = {
    dbname: 'cookameal',
    user: 'sa',
    password: 'Admin@123'
};

exports.keys = {
    secret: '/jVdfUX+u/Kn3qPY4+ahjwQgyV5UhkM5cdh1i2xhozE=' // Not anymore...
};

exports.UPLOAD_LOCATION = 'E:\\Cook-A-Meal\\Uploads\\';