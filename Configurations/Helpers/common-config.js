'use strict';
let config = require('../Main');


exports.DATE_FORMAT = 'MM/DD/YYYY';
exports.DATE_TIME_FORMAT = 'MM/DD/YYYY h:mm a';

const CommonConfig = module.exports;

const ROLES = CommonConfig.ROLES = {
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
    CATEGORY: 3,
    RECIPE: 3
};

CommonConfig.FILES = {
    PROFILE: 'profile',
    IDENTIFICATIONCARD: 'identification_card',
    CERTIFICATE: 'certificate',
    CATEGORY: 'category',
    RECIPE: 'recipe'
};

CommonConfig.FOLDER_LOCATIONS = {
    PROFILE: config.FOLDER_LOCATION + 'profiles/',
    IDENTIFICATIONCARD: config.FOLDER_LOCATION + 'identification_cards/',
    CERTIFICATE: config.FOLDER_LOCATION + 'certificates/',
    CATEGORY: config.FOLDER_LOCATION + 'categories/',
    RECIPE: config.FOLDER_LOCATION + 'recipe/',
    MIX: config.FOLDER_LOCATION + 'mix/',
};

CommonConfig.FILE_LOCATIONS = {
    PROFILE: config.FILE_LOCATION + 'profiles/',
    IDENTIFICATIONCARD: config.FILE_LOCATION + 'identification_cards/',
    CERTIFICATE: config.FILE_LOCATION + 'certificates/',
    CATEGORY: config.FILE_LOCATION + 'categories/',
    RECIPE: config.FILE_LOCATION + 'recipe/',
    MIX: config.FILE_LOCATION + 'mix/',
};

CommonConfig.OPTIONS = {
    RANDOM_KEYS: {
        length: 8,
        numeric: true,
        letters: true,
        special: false,
        exclude: ['a', 'b', '1']
    },
    UNIQUE_RANDOM_KEYS: {
        length: 16,
        numeric: true,
        letters: false,
        special: false
    }
};

CommonConfig.WHITE_LIST = {
    IMAGE_EXTENSTIONS: ['.JPG', '.jpg', '.JPEG', '.jpeg', '.PNG', '.png']
};

CommonConfig.CONTENT_TYPE = {
    JSON: 'application/json',
    MULTIPART: 'multipart/form-data'
};

CommonConfig.ERRORS = {
    LOGIN_FAILED: 'Invalid username or password. Login failed.',
    ACCESS_DENIED: 'Access Denied/Forbidden',
    INTERNAL_SERVER_ERROR: 'Something wrong in your request. please try again later.',
    NON_AUTHORIZED: 'You are not authorized to perform this action.',
    TOKEN_EXPIRED: 'Temporary password has been expired.',
    HEADER_NOT_FOUND: 'Header not present in the request.',
    CONTENT_TYPE_MULTIPART: 'Invalid Content Type. Content-Type: multipart/form-data required.',
    CONTENT_TYPE_JSON: 'Invalid Content Type. Content-Type: applicatiotn/json required.',
    INVALID_FILE_FORMAT: 'Invalid image file format. Please upload only .JPG, JPEG or .PNG only.',
    CREATION: 'Unable to process your request! Please try again later.',
    PASSWORD_NOT_MATCHED: 'Password not matched. Please try again later.'
};

CommonConfig.SUCCESS = {
    EMAIL_SENT: 'We have sent an email to your registered email address. Thank you.',
    PASSWORD_CHANGED: 'Password has been changed successfully.',
    LOGGED_OUT: 'You have successfully logged out.'
};

CommonConfig.MAGIC_NUMBERS = {
    JPG: 'ffd8ffe0',
    JPG1: 'ffd8ffe1',
    JPG2: 'ffd8ffe2',
    JPG3: 'ffd8ffdb',
    PNG: '89504e47',
    GIF: '47494638'
};

CommonConfig.REASONS = {
    USER_LOGGED_OUT: 'User logged out.'
};

CommonConfig.EMAIL_TEMPLATES = {
    RESET_PASSWORD: 'resetpassword'
};

CommonConfig.EMAIL_FROM = 'Cook-A-Meal';

CommonConfig.REG_EXP = {
    PASSWORD: /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9].*[0-9]).{8,24}$/
};