const Sequelize = require('sequelize')
const Op = Sequelize.Op
const distance = require('google-distance')
const Config = require('../../../configurations/main')
const db = require('../../modals')
const CommonConfig = require('../../../configurations/helpers/common-config')

const NodeGeocoder = require('node-geocoder')

const options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: 'AIzaSyCyZjxhFaAPLudPLGLUjJ24DkAw-so__fg',
    formatter: null
}

let geocoder = NodeGeocoder(options)

distance.apiKey = Config.Google.Map.key

MapService = function () {
}

MapService.prototype.GetUserDetailsByUserTypeId = async (userTypeId) => {
    try {
        return await db.UserType.findOne({
            where: {
                id: {
                    [Op.eq]: `${userTypeId}`
                }
            },
            include: [{
                model: db.Profile,
                include: [{
                    model: db.Address
                }]
            }]
        })
    } catch (error) {
        throw (error)
    }
}

MapService.prototype.Map = {
    GetGeoCordinatesFromAddress: async (address) => {
        console.log('address: ', address)
        return await geocoder.geocode(`${address}`)
    },
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
                    attributes: ['id', 'categoryId', 'cooksDealWithCategoryId'],
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
    FindGeoDistance: async (origin, destination, units, filter) => {

        // console.log('origin: ', origin)
        // console.log('destination: ', destination)
        // console.log('units: ', units)
        // console.log('filter: ', filter)
        let distanceValue = 5000
        if (units === 'metric') {
            distanceValue = filter * 1000
        } else {
            distanceValue = filter * 1600
        }
        // console.log('units: ', units)
        // console.log('distance: ', distanceValue)
        const distanceData = await new Promise((resolve, reject) => {
            distance.get(
                {
                    origin: `${origin}`,
                    destination: `${destination.latitude}` + ',' + `${destination.longitude}`,
                    units: `${units}`
                },
                function (err, data) {
                    console.log('Results: ', err)
                    if (err) {
                        return resolve(null)
                        // if (err.indexOf('ZERO_RESULTS') > -1) {
                        //     return resolve(null)
                        // }
                        // return reject(err)
                    }
                    return resolve(data)
                })
        })
        if (!distanceData) {
            return false
        }
        if (distanceData.distanceValue <= distanceValue) {
            return distanceData
        } else {
            return false
        }
        // return distanceData
    }
}

module.exports = new MapService()
