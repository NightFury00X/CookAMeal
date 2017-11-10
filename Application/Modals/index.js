let fs = require('fs'),
    path = require('path'),
    Sequelize = require('sequelize'),
    useTransaction = require('sequelize-transactions'),
    config = require('../../Configurations/Main');
let db = {};

let sequelize = new Sequelize(
    config.user.dbname,
    config.user.user,
    config.user.password,
    config.mysql
);

useTransaction(sequelize);

fs
    .readdirSync(__dirname)
    .filter((file) => {
        return (file.indexOf(".") !== 0) && (file !== 'index.js');
    })
    .forEach((file) => {
        let model = sequelize.import(path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(function (modelName) {
    if ('associate' in db[modelName]) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;