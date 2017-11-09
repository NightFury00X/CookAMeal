let fs = require('fs'),
    path = require('path'),
    Sequelize = require('sequelize'),
    env = process.env.NODE_ENV || "development",
    useTransaction = require('sequelize-transactions'),
    config = require('../../Configurations/Main/config');
let db = {};

let sequelize = new Sequelize(
    config.db.name,
    config.db.user,
    config.db.password,
    config.db.details
);

useTransaction(sequelize);


fs
    .readdirSync(__dirname)
    .filter((file) => {
        return (file.indexOf(".") !== 0) && (file !== 'index.js');
    })
    .forEach((file) => {
        console.log('File: ', file);
        let model = sequelize.import(path.join(__dirname, file));
        console.log('Name: ', model.name);
        db[model.name] = model;
    });


Object.keys(db).forEach(function (modelName) {
    if ('associate' in db[modelName]) {
        db[modelName].associate(db);
    }
});

// Object.keys(db).forEach(function(modelName) {
//     // console.log('Model: ', modelName);
//     if ('associate' in db[modelName]) {
//         console.log('Model: ');
//         return db[modelName].associate(db);
//     }
// });

// db.UserModel = sequelize.import(__dirname + "/user");
// db.AddressModel = sequelize.import(__dirname + "/address");
// db.SocialModel = sequelize.import(__dirname + "/social");
// db.library = sequelize.import(__dirname + "/library");
// db.student = sequelize.import(__dirname + "/student");

// db.UserModel.associate(db);

// db.UserModel.hasMany(db.AddressModel);
// db.UserModel.hasMany(db.SocialModel);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;