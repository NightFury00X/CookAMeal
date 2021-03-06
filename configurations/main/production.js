const timezone = 'UTC'
process.env.TZ = timezone

exports.app = app = {
    title: 'cook-A-Meal',
    host: '132.148.87.196',
    port: 5151,
    ssl: false
}

exports.mssql = {
    host: '132.148.87.196',
    dialect: 'mssql',
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
        requestTimeout: 300000,
        connectionTimeout: 300000,
        multipleStatements: true,
        useUTC: true,
        useIST: false
    },
    logging: true,
    pool: {
        idleTimeoutMillis: 300000,
        max: 100
    }
}

exports.user = {
    dbname: 'cookameal',
    user: 'cookamealuser',
    password: 'Ngy97%h1'
}

exports.Google = {
    Map: {
        key: 'AIzaSyCytNKQu9qjaEnVOftb483j7uIr3b_rWuQ'
    }
}

exports.braintree = {
    merchantId: '7wz2tcmtpr3t64sj',
    publicKey: '3hffpmpsshj4jxd6',
    privateKey: '9269ac26a66911423827275a03940bb9'
}

exports.keys = {
    secret: '/jVdfUX+u/Kn3qPY4+ahjwQgyV5UhkM5cdh1i2xhozE='
}

exports.FOLDER_LOCATION = 'uploads/'

exports.FILE_LOCATION = 'http://cookamealapi.cynotecksandbox.com/uploads/'

exports.UPLOAD_LOCATION = [
    {PATH: 'uploads/profiles'},
    {PATH: 'uploads/identification_cards'},
    {PATH: 'uploads/certificates'},
    {PATH: 'uploads/categories'},
    {PATH: 'uploads/recipe'}
]

exports.DOMAIN = {
    NAME: 'uploads/'
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
