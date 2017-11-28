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
    dialect: 'mssql',
    host: 'localhost',
    port: 1433, // Default port
    define: {
        schema: "dbo",
        freezeTableName: false
    },
    dialectOptions: {
        instanceName: 'MSSQLSERVER14',
        requestTimeout: 30000
    },
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
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

exports.FOLDER_LOCATION = 'E:/Cook-A-Meal/uploads/';

exports.FILE_LOCATION = 'E:/Cook-A-Meal/uploads/';

exports.UPLOAD_LOCATION = [
    {PATH: 'E:/Cook-A-Meal/uploads/profiles'},
    {PATH: 'E:/Cook-A-Meal/uploads/identification_cards'},
    {PATH: 'E:/Cook-A-Meal/uploads/certificates'},
    {PATH: 'E:/Cook-A-Meal/uploads/categories'}
];

exports.DOMAIN = {
    NAME: 'E:/Cook-A-Meal/'
    // NAME: 'E:/Cook-A-Meal'
};