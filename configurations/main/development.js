const path = require('path')
const timezone = 'UTC'
process.env.TZ = timezone

exports.app = app = {
    title: 'cook-A-Meal',
    host: 'localhost',
    port: 8081,
    ssl: false
}

const BaseProject = path.join(__dirname, '../../')
const Uploads = `${BaseProject}` + `${'uploads/'}`

exports.mssql = {
    dialect: 'mssql',
    host: 'localhost',
    port: 1433,
    define: {
        schema: 'dbo',
        timestamps: true,
        freezeTableName: false,
        underscored: false
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
    logging: true,
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

const FileLocations = {
    Profile: Uploads + '/profiles',
    ProfileCover: Uploads + '/profile_cover',
    IdentificationCards: `${Uploads}` + `${'/identification_cards'}`,
    Certificates: `${Uploads}` + `${'/certificates'}`,
    Categories: `${Uploads}` + `${'/categories'}`,
    Recipe: `${Uploads}` + `${'/recipe'}`
}

exports.FOLDER_LOCATION = Uploads

exports.FILE_LOCATION = Uploads

exports.UPLOAD_LOCATION = [
    {PATH: FileLocations.Profile},
    {PATH: FileLocations.ProfileCover},
    {PATH: FileLocations.IdentificationCards},
    {PATH: FileLocations.Certificates},
    {PATH: FileLocations.Categories},
    {PATH: FileLocations.Recipe}
]

exports.DOMAIN = {
    NAME: BaseProject
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
