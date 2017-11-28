let multer = require('multer'),
    path = require('path'),
    fs = require('fs'),
    CommonConfig = require('./common-config');

let storage = multer.diskStorage({
    destination: function (req, file, callback) {
        let dest;
        switch (file.fieldname) {
            case CommonConfig.FILES.PROFILE:
                dest = CommonConfig.FOLDER_LOCATIONS.PROFILE;
                break;
            case CommonConfig.FILES.IDENTIFICATIONCARD:
                dest = CommonConfig.FOLDER_LOCATIONS.IDENTIFICATIONCARD;
                break;
            case CommonConfig.FILES.CERTIFICATE:
                dest = CommonConfig.FOLDER_LOCATIONS.CERTIFICATE;
                break;
            case CommonConfig.FILES.CATEGORY:
                dest = CommonConfig.FOLDER_LOCATIONS.CATEGORY;
                break;
            default:
                dest = CommonConfig.FOLDER_LOCATIONS.MIX;
                break;
        }
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
            if (req.files) {
                console.log('Files: ', req.files.profile);
                if (req.files.profile) {
                    if (!CheckFile(req.files.profile)) reject('You are uploading an invalid image file.');
                }
                if (req.files.certificate) {
                    if (!CheckFile(req.files.certificate)) reject('You are uploading an invalid image file.');
                }
                if (req.files.identification_card) {
                    if (!CheckFile(req.files.identification_card)) reject('You are uploading an invalid image file.');
                }
                if (req.files.category) {
                    if (!CheckFile(req.files.category)) reject('You are uploading an invalid image file.');
                }
            }
            return resolve(req.files);
        });
    });
};

/**
 * @return {boolean}
 */
function CheckFile(file) {
    try {
        console.log('File: ===========> ', file);
        let magic = fs.readFileSync(file[0].path).toString('hex', 0, 4);
        console.log('Magic: ',magic);
        if (!CheckMagicNumbers(magic)) {
            fs.unlinkSync(file[0].path);
            return false;
        }
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * @return {boolean}
 */
function CheckMagicNumbers(magic) {
    if (magic === CommonConfig.MAGIC_NUMBERS.JPG
        || magic === CommonConfig.MAGIC_NUMBERS.PNG) return true;
}

module.exports = uploadFile;