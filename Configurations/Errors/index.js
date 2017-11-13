/**
 * @module errors/index
 * @description Errors Bootstrap
 */

'use strict';

let fs = require('fs'),
    errors = fs.readdirSync(__dirname + '/libs');

errors.forEach(function(el){

    let n = el.substring(0, el.indexOf('.'));
    module.exports[n] = require('./libs/' + el);

});

module.exports.CustomError = require('./custom-error');