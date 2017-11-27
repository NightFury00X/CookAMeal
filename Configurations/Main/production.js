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

exports.UPLOAD_LOCATION = 'cookamealapi.cynotecksandbox.com/uploads/';

exports.DOMAIN = {
    NAME: 'uploads/'
};