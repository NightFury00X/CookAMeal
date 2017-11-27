'use strict';
let config = require('../Main');

let CommonConfig = module.exports;

let ROLES = CommonConfig.ROLES = {
    COOK: 1,        //  0001
    CUSTOMER: 2,    //  0010
    ADMIN: 4,       //  0100
    ALL: 8          //  1000
};

CommonConfig.ACCESS_LEVELS = {
    ALL: ROLES.COOK | ROLES.CUSTOMER | ROLES.ADMIN,  // 0111
    COOK: ROLES.COOK | ROLES.ADMIN,                  // 0101
    CUSTOMER: ROLES.CUSTOMER | ROLES.ADMIN,          // 0110
    ADMIN: ROLES.ADMIN                               // 0100
};

CommonConfig.USER_TYPE = {
    NORMAL_USER: 1,
    FACEBOOK_USER: 2
};

CommonConfig.STATUS_CODE = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};

CommonConfig.OBJECT_TYPE = {
    PROFILE: 1,
    IDENTIFICATIONCARD: 2,
    CERTIFICATE: 3,
    CATEGORY: 3
};

CommonConfig.FILES = {
    PROFILE: 'profile',
    IDENTIFICATIONCARD: 'identification_card',
    CERTIFICATE: 'certificate',
    CATEGORY: 'category'
};

CommonConfig.FILE_LOCATIONS = {
    PROFILE: config.FILE_LOCATION + 'profiles/',
    IDENTIFICATIONCARD: config.FILE_LOCATION + 'identification_cards/',
    CERTIFICATE: config.FILE_LOCATION + 'certificates/',
    CATEGORY: config.FILE_LOCATION + 'categories/',
    MIX: config.FILE_LOCATION + 'mix/',
};

CommonConfig.WHITE_LIST = {
    IMAGE_EXTENSTIONS: ['.JPG', '.jpg', '.JPEG', '.jpeg', '.PNG', '.png']
};

CommonConfig.ERRORS = {
    INVALID_FILE_FORMAT: 'Invalid image file format. Please upload only .JPG, JPEG or .PNG only.'
};

CommonConfig.MAGIC_NUMBERS = {
    JPG: 'ffd8ffe0',
    JPG1: 'ffd8ffe1',
    PNG: '89504e47',
    GIF: '47494638'
};