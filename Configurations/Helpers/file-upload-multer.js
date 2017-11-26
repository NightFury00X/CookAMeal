let multer = require('multer'),
    path = require('path'),
    fs = require('fs'),
    CommonConfig = require('./common-config');

let storage = multer.diskStorage({
    destination: function (req, file, callback) {
        let dest;
        switch (file.fieldname) {
            case CommonConfig.FILES.PROFILE:
                dest = CommonConfig.FILE_LOCATIONS.PROFILE;
                break;
            case CommonConfig.FILES.IDENTIFICATIONCARD:
                dest = CommonConfig.FILE_LOCATIONS.IDENTIFICATIONCARD;
                break;
            case CommonConfig.FILES.CERTIFICATE:
                dest = CommonConfig.File_Locations.Certificate;
                break;
            case CommonConfig.FILES.CATEGORY:
                dest = CommonConfig.FILE_LOCATIONS.CATEGORY;
                break;
            default:
                dest = CommonConfig.FILE_LOCATIONS.MIX;
                break;
        }
        if (!fs.existsSync(dest))
            fs.mkdirSync(dest);
        callback(null, dest);
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
let upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        let ext = path.extname(file.originalname).toLowerCase();
        if (CommonConfig.WHITE_LIST.IMAGE_EXTENSTIONS.indexOf(ext) < 0) {
            return callback(new Error(CommonConfig.ERRORS.INVALID_FILE_FORMAT))
        }
        callback(null, true)
    },
    // limits: {
    //     fileSize: 5000000
    // }
}).fields([{name: CommonConfig.FILES.PROFILE, maxCount: 1}, {name: CommonConfig.FILES.CERTIFICATE, maxCount: 1}, {
    name: CommonConfig.FILES.IDENTIFICATIONCARD,
    maxCount: 1
}, {name: CommonConfig.FILES.CATEGORY, maxCount: 1}]);

let uploadFile = function (req, res) {
    return new Promise((resolve, reject) => {
        upload(req, res, function (error) {
            if (error) return reject(error);
            return resolve(req.files);
        });
    });
};

module.exports = uploadFile;