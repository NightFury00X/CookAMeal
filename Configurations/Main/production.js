exports.app = app = {
    title: 'Cook-A-Meal',
    host: '132.148.87.196',
    port: 5151,
    ssl: false
};

exports.mssql = {
    host: '132.148.87.196',
    dialect: 'mssql',
    define: {
        schema: "dbo",
        freezeTableName: false,
    },
    logging: true,
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
};

exports.user = {
    dbname: 'cookameal',
    user: 'cookamealuser',
    password: 'Ngy97%h1'
};

exports.keys = {
    secret: '/jVdfUX+u/Kn3qPY4+ahjwQgyV5UhkM5cdh1i2xhozE=' // Not anymore...
};

exports.FOLDER_LOCATION = 'uploads/';

exports.FILE_LOCATION = 'http://cookamealapi.cynotecksandbox.com/uploads/';

exports.UPLOAD_LOCATION = [
    {PATH: 'uploads/profiles'},
    {PATH: 'uploads/identification_cards'},
    {PATH: 'uploads/certificates'},
    {PATH: 'uploads/categories'}
];


exports.DOMAIN = {
    NAME: 'uploads/'
};

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
        host: 'smtp.gmail.com',
        port: 465,
        auth: {
            user: 'curacall2015@gmail.com',
            pass: 'Curacall_2015'
        }
    }
};