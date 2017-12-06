const timezone = 'UTC';
process.env.TZ = timezone;

exports.app = app = {
    title: 'Cook-A-Meal',
    host: 'localhost',
    port: 8081,
    ssl: false
};

exports.mssql = {
    dialect: 'mssql',
    host: 'localhost',
    port: 1433, // Default port
    define: {
        schema: "dbo",
        timestamps: true,
        freezeTableName: false,
    },
    raw: true,
    syncOnAssociation: true,
    timezone: timezone,
    dateStrings: true,
    typeCast: true,
    dialectOptions: {
        instanceName: 'MSSQLSERVER',
        requestTimeout: 300000,
        connectionTimeout: 300000,
        multipleStatements: true,
        useUTC: true,
        useIST: false
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
            // user: 'curacall2015@gmail.com',
            // pass: 'Curacall_2015'
            
            user: 'cookamealtest@gmail.com',
            pass: 'Admin@321'
        }
    }
};