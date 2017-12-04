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
        requestTimeout: 300000,
        connectionTimeout: 300000,
    },
    logging: false,
    pool: {
        idleTimeoutMillis: 300000,
        max: 100
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
    {PATH: 'E:/Cook-A-Meal/uploads/categories'},
    {PATH: 'E:/Cook-A-Meal/uploads/recipe'}
];

exports.DOMAIN = {
    NAME: 'E:/Cook-A-Meal/'
    // NAME: 'E:/Cook-A-Meal'
};

exports.CONFIG = {
    EMAIL_ENGINE_OPTIONS: {
        viewEngine: {
            extname: '.hbs',
            layoutsDir: 'Views/'
        },
        viewPath: 'Views/',
        extName: '.hbs'
    },
    EMAIL_OPTIONS: {
        service: "gmail",
        auth: {
            user: 'curacall2015@gmail.com',
            pass: 'Curacall_2015'
        }
    }
};