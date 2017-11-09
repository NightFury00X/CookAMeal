let fs = require('fs'),
    path = require('path'),
    Sequelize = require('sequelize'),
    useTransaction = require('sequelize-transactions'),
    config = require('../../Configurations/Main/config'),
    db = {};

let sequelize = new Sequelize(
    config.db.name,
    config.db.user,
    config.db.password,
    config.db.details
);

useTransaction(sequelize);

fs.readdirSync(__dirname).filter(function (file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js');
}).forEach(function (file) {
    let model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
});

Object.keys(db).forEach(function (modelName) {
    // console.log('Ok', modelName);
    if (modelName === 'user') {
        console.log('ok');
        // db.UserModel.associate(db);
    }
    // db[modelName].options.associate(db);
    if (db[modelName].options.hasOwnProperty('associate')) {
        console.log('Ok');
        db[modelName].options.associate(db)
    }
});
// Object.keys(db).forEach(function(modelName) {
//     // console.log('Model: ', modelName);
//     if ('associate' in db[modelName]) {
//         console.log('Model: ');
//         // return db[modelName].associate(db);
//     }
// });

db.UserModel = sequelize.import(__dirname + "/user");
db.AddressModel = sequelize.import(__dirname + "/address");
db.SocialModel = sequelize.import(__dirname + "/social");

// db.UserModel.associate(db);

db.UserModel.hasMany(db.AddressModel);
db.UserModel.hasMany(db.SocialModel);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;