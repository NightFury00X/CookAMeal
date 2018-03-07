const multer = require('multer')
const path = require('path')
const fs = require('fs')
const CommonConfig = require('./common-config')

let storage = multer.diskStorage({
    destination: function (req, file, callback) {
        let dest
        switch (file.fieldname) {
            case CommonConfig.FILES.PROFILE:
                dest = CommonConfig.FOLDER_LOCATIONS.PROFILE
                break
            case CommonConfig.FILES.PROFILECOVER:
                dest = CommonConfig.FOLDER_LOCATIONS.PROFILECOVER
                break
            case CommonConfig.FILES.IDENTIFICATIONCARD:
                dest = CommonConfig.FOLDER_LOCATIONS.IDENTIFICATIONCARD
                break
            case CommonConfig.FILES.CERTIFICATE:
                dest = CommonConfig.FOLDER_LOCATIONS.CERTIFICATE
                break
            case CommonConfig.FILES.CATEGORY:
                dest = CommonConfig.FOLDER_LOCATIONS.CATEGORY
                break
            case CommonConfig.FILES.RECIPE:
                dest = CommonConfig.FOLDER_LOCATIONS.RECIPE
                break
            default:
                dest = CommonConfig.FOLDER_LOCATIONS.MIX
                break
        }
        callback(null, dest)
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
let upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        let ext = path.extname(file.originalname).toLowerCase()
        if (CommonConfig.WHITE_LIST.IMAGE_EXTENSTIONS.indexOf(ext) < 0) {
            return callback(new Error(CommonConfig.ERRORS.INVALID_FILE_FORMAT))
        }
        callback(null, true)
    }
    // limits: {
    //     fileSize: 5000000
    // }
}).fields([
    {name: CommonConfig.FILES.PROFILE, maxCount: 1},
    {name: CommonConfig.FILES.PROFILECOVER, maxCount: 1},
    {name: CommonConfig.FILES.CERTIFICATE, maxCount: 1},
    {name: CommonConfig.FILES.IDENTIFICATIONCARD, maxCount: 1},
    {name: CommonConfig.FILES.CATEGORY, maxCount: 1},
    {name: CommonConfig.FILES.RECIPE, maxCount: 2}
])

let uploadFile = function (req, res, next) {
    upload(req, res, function (error) {
        if (error) return next(error)
        if (req.files) {
            if (req.files.profile) {
                if (!CheckFile(req.files.profile)) {
                    return next({
                        message: 'You are uploading an invalid profile image file.',
                        status: CommonConfig.STATUS_CODE.BAD_REQUEST
                    }, false)
                }
            }
            if (req.files.certificate) {
                if (!CheckFile(req.files.certificate)) {
                    return next({
                        message: 'You are uploading an invalid certificate image file.',
                        status: CommonConfig.STATUS_CODE.BAD_REQUEST
                    }, false)
                }
            }
            if (req.files.identification_card) {
                if (!CheckFile(req.files.identification_card)) {
                    return next({
                        message: 'You are uploading an invalid identification card image file.',
                        status: CommonConfig.STATUS_CODE.BAD_REQUEST
                    }, false)
                }
            }
            if (req.files.category) {
                if (!CheckFile(req.files.category)) {
                    return next({
                        message: 'You are uploading an invalid recipe image file.',
                        status: CommonConfig.STATUS_CODE.BAD_REQUEST
                    }, false)
                }
            }
        }
        return next()
    })
}

let uploadDataFiles = function (req, res, next) {
    upload(req, res, function (error) {
        if (error) return next(error)
        if (req.files) {
            if (req.files.recipe) {
                if (!CheckFile(req.files.recipe)) {
                    next({
                        message: 'You are uploading an invalid Recipe image.',
                        status: CommonConfig.STATUS_CODE.BAD_REQUEST
                    }, false)
                }
            }
        }
        return next()
    })
}

const UploadProfileCover = function (req, res, next) {
    upload(req, res, function (error) {
        if (error) return next(error)
        if (req.files) {
            if (req.files.profileCover) {
                if (!CheckFile(req.files.profileCover)) {
                    next({
                        message: 'You are uploading an invalid profile cover image.',
                        status: CommonConfig.STATUS_CODE.BAD_REQUEST
                    }, false)
                }
            }
        }
        return next()
    })
}

const UploadProfileImage = function (req, res, next) {
    upload(req, res, function (error) {
        if (error) return next(error)
        if (req.files) {
            if (req.files.profile) {
                if (!CheckFile(req.files.profile)) {
                    next({
                        message: 'You are uploading an invalid profile image.',
                        status: CommonConfig.STATUS_CODE.BAD_REQUEST
                    }, false)
                }
            }
        }
        return next()
    })
}

const UploadCertificate = function (req, res, next) {
    upload(req, res, function (error) {
        if (error) return next(error)
        if (req.files) {
            if (req.files.profile) {
                if (!CheckFile(req.files.certificate)) {
                    next({
                        message: 'You are uploading an invalid profile image.',
                        status: CommonConfig.STATUS_CODE.BAD_REQUEST
                    }, false)
                }
            }
        }
        return next()
    })
}

/**
 * @return {boolean}
 */
function CheckFile (file) {
    try {
        let magic = fs.readFileSync(file[0].path).toString('hex', 0, 4)
        if (!CheckMagicNumbers(magic)) {
            fs.unlinkSync(file[0].path)
            return false
        }
        return true
    } catch (error) {
        return false
    }
}

/**
 * @return {boolean}
 */
function CheckMagicNumbers (magic) {
    if (magic === CommonConfig.MAGIC_NUMBERS.JPG ||
        magic === CommonConfig.MAGIC_NUMBERS.JPG1 ||
        magic === CommonConfig.MAGIC_NUMBERS.JPG2 ||
        magic === CommonConfig.MAGIC_NUMBERS.JPG3 ||
        magic === CommonConfig.MAGIC_NUMBERS.PNG) {
        return true
    }
}

let FileUploader = {
    uploadFile: uploadFile,
    uploadDataFiles: uploadDataFiles,
    UploadProfileCover: UploadProfileCover,
    UploadProfileImage: UploadProfileImage,
    UploadCertificate: UploadCertificate
}

module.exports = FileUploader
