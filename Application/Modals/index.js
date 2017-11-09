let fs = require('fs'),
    path = require('path'),
    Sequelize = require('sequelize'),
    config = require('../../Configurations/Main/config'),
    db = {};

let sequelize = new Sequelize(
    config.db.name,
    config.db.user,
    config.db.password,
    config.db.details
);

fs.readdirSync(__dirname).filter(function (file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js');
}).forEach(function (file) {
    let model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
});

db.UserModel = sequelize.import(__dirname + "/user");
db.AddressModel = sequelize.import(__dirname + "/address");

db.UserModel.associate(db);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;