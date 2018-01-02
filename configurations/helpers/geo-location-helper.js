const NodeGeocoder = require('node-geocoder');

const options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: 'AIzaSyCyZjxhFaAPLudPLGLUjJ24DkAw-so__fg',
    formatter: null
};

module.exports = {
    geocoder: NodeGeocoder(options)
};