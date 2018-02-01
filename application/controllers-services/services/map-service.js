const Sequelize = require('sequelize')
const Op = Sequelize.Op
const distance = require('google-distance')
const Config = require('../../../configurations/main')
const db = require('../../modals')
const CommonConfig = require('../../../configurations/helpers/common-config')

distance.apiKey = Config.Google.Map.key

MapService = function () {
}

MapService.prototype.Map = {
    FindAllCooksLocationsForMap: async () => {
        return await db.Profile.findAll({
            attributes: ['id', 'firstname', 'lastname'],
            where: {
                userRole: {
                    [Op.eq]: CommonConfig.ROLES.COOK
                }
            },
            include: [{
                attributes: ['imageUrl'],
                model: db.MediaObject
            }, {
                attributes: ['latitude', 'longitude'],
                model: db.Address
            }]
        })
    },
    FindGeoCordinationsByProfileId: async (profileId) => {
        return db.Address.findOne({
            attributes: ['latitude', 'longitude'],
            where: {
                profileId: {
                    [Op.eq]: profileId
                }
            }
        })
    },
    FindAllCooksDealsWithCategoryForMap: async () => {
        try {
            return await db.Category.findAll({
                attributes: ['id', 'name'],
                include: [{
                    attributes: ['id', 'categoryId', 'profileId'],
                    model: db.CooksDealWithCategory,
                    include: [{
                        model: db.Profile,
                        attributes: ['id', 'firstname', 'lastname'],
                        where: {
                            userRole: {
                                [Op.eq]: CommonConfig.ROLES.COOK
                            }
                        },
                        include: [{
                            attributes: ['imageUrl'],
                            model: db.MediaObject
                        }, {
                            attributes: ['latitude', 'longitude'],
                            model: db.Address
                        }]
                    }]
                }]
            })
        } catch (error) {
            throw (error)
        }
    },
    FindGeoDistance: async (origin, destination) => {
        const distanceData = await new Promise((resolve, reject) => {
            distance.get(
                {
                    origin: origin,
                    destination: `${destination.latitude}` + ',' + `${destination.longitude}`,
                    units: 'metric'
                },
                function (err, data) {
                    if (err) return reject(err)
                    return resolve(data)
                })
        })
        let totalMeters = 0
        if (distanceData.distance.indexOf('km')) {
            totalMeters = distanceData.distance.split(' ')[0] * 1000
        } else {
            totalMeters = distanceData.distance.split(' ')[0]
        }
        if (totalMeters >= 0 && totalMeters < 10000) {
            return distanceData
        } else {
            return false
        }
    }
}

module.exports = new MapService()
