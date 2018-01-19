const Sequelize = require('sequelize')
const Op = Sequelize.Op
const distance = require('google-distance')
const NodeGeocoder = require('node-geocoder')
const Config = require('../../../configurations/main')
const db = require('../../modals')

const options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: Config.Google.Map.key,
    formatter: null
}
distance.apiKey = Config.Google.Map.key
const geocoder = NodeGeocoder(options)

MapService = function () {
}

MapService.prototype.Map = {
    FindGeoCordinationsByProfileId: async (profileId) => {
        return db.Address.findOne({
            attributes: ['latitude', 'longitude'],
            where: {
                profile_id: {
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
                    attributes: ['id', 'category_id', 'profile_id', 'latitude', 'longitude'],
                    model: db.CooksDealWithCategory
                }]
            })
        } catch (error) {
            throw (error)
        }
    },
    FindGeoDistance: async (geoLocationList) => {
        return await new Promise((resolve, reject) => {
            distance.get(
                {
                    origins: ['30.2994681, 78.0580609'],
                    destinations: geoLocationList,
                    units: 'metric'
                },
                function (err, data) {
                    if (err) return reject(err)
                    return resolve(data)
                })
        })
    },
    FindCordinatesByLocation: async (location) => {
        return new Promise((resolve, reject) => {
            geocoder.geocode(location, function (err, res) {
                if (err) return reject(err)
                console.log('===================================================')
                const {latitude, longitude} = res[0]
                console.log('Geo Location: ', latitude, longitude)
                console.log('===================================================')
                return resolve(res)
            })
        })
    },
    FindAllNearestCooksByPosition: async (geoLocationList) => {
        const list = geoLocationList.filter((loc) => {
            return loc.distanceValue === 5312
        })
        return new Promise((resolve, reject) => {
            geocoder.batchGeocode(list, function (err, results) {
                console.log(results)
                if (err) return reject(err)
                return resolve(results)
            })
        })
    },
    FindCookProfileByCordinates: async (latitude, longitude) => {
        return await db.CooksDealWithCategory.findAll({
            attributes: ['profile_id'],
            where: {
                [Op.and]: [{
                    latitude: {
                        [Op.like]: `${latitude}%`
                    },
                    longitude: {
                        [Op.like]: `${longitude}%`
                    }
                }]
            }
        })
    }
}

module.exports = new MapService()
