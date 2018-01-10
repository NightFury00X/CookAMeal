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
    logging: false,
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

exports.braintree = {
    merchantId: '8kdyn2qdd3tp7fp2',
    publicKey: 'pf3t3gf5t8qq8tqp',
    privateKey: 'e693df667c9716d284419efa0c55efa3'
}

exports.keys = {
    secret: '/jVdfUX+u/Kn3qPY4+ahjwQgyV5UhkM5cdh1i2xhozE=' // Not anymore...
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
