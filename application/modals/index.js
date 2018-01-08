let fs = require('fs')
let path = require('path')
let Sequelize = require('sequelize')
let useTransaction = require('sequelize-transactions')
let config = require('../../configurations/main')
let db = {}
let sequelize = new Sequelize(
    config.user.dbname,
    config.user.user,
    config.user.password,
    config.mssql
)
useTransaction(sequelize)
fs.readdirSync(__dirname)
    .filter((file) => {
        return (file.indexOf('.') !== 0) && (file !== 'index.js')
    })
    .forEach((file) => {
        let model = sequelize.import(path.join(__dirname, file))
        db[model.name] = model
    })
Object.keys(db).forEach(function (modelName) {
    if ('associate' in db[modelName]) {
        db[modelName].associate(db)
    }
})
db.sequelize = sequelize
db.Sequelize = Sequelize
module.exports = db
