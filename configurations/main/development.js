const timezone = 'UTC'
process.env.TZ = timezone

exports.app = app = {
    title: 'cook-A-Meal',
    host: 'localhost',
    port: 8081,
    ssl: false
}

exports.mssql = {
    dialect: 'mssql',
    host: 'localhost',
    port: 1433, // Default port
    define: {
        schema: 'dbo',
        timestamps: true,
        freezeTableName: false
    },
    raw: false,
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
    // logging: console.log,
    logging: false,
    pool: {
        idleTimeoutMillis: 300000,
        max: 100
    }
}

exports.user = {
    dbname: 'cookameal',
    user: 'sa',
    password: 'Admin@123'
}

exports.braintree = {
    merchantId: '2b38cp3xpz7w87ss',
    publicKey: 'b2s42p47ty4nv4yz',
    privateKey: '62e56995f67d15ee1f2591311d7a726a'
}

exports.keys = {
    secret: '/jVdfUX+u/Kn3qPY4+ahjwQgyV5UhkM5cdh1i2xhozE=' // Not anymore...
}

exports.FOLDER_LOCATION = 'E:/cook-A-Meal/uploads/'

exports.FILE_LOCATION = 'E:/cook-A-Meal/uploads/'

exports.UPLOAD_LOCATION = [
    {PATH: 'E:/cook-A-Meal/uploads/profiles'},
    {PATH: 'E:/cook-A-Meal/uploads/identification_cards'},
    {PATH: 'E:/cook-A-Meal/uploads/certificates'},
    {PATH: 'E:/cook-A-Meal/uploads/categories'},
    {PATH: 'E:/cook-A-Meal/uploads/recipe'}
]

exports.DOMAIN = {
    NAME: 'E:/cook-A-Meal/'
}

exports.CONFIG = {
    EMAIL_ENGINE_OPTIONS: {
        viewEngine: {
            extname: '.hbs',
            layoutsDir: 'views/'
        },
        viewPath: 'views/',
        extName: '.hbs'
    },
    EMAIL_OPTIONS: {
        service: 'gmail',
        auth: {
            user: 'curacall2015@gmail.com',
            pass: 'Curacall_2015'
        }
    }
}
