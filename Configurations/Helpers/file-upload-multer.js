let multer = require('multer'),
    path = require('path');
let storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'Uploads/');
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        
    }
});
let upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        let ext = path.extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
            return callback(new Error('Only valid image formats [".jpg", ".jpeg", ".png"] are allowed'))
        }
        callback(null, true)
    },
    // limits: {
    //     fileSize: 5000000
    // }
}).fields([{name: 'profile', maxCount: 1}, {name: 'certificate', maxCount: 1}, {name: 'identificationcard', maxCount: 1}, {name: 'category', maxCount: 1}]);

let uploadFile = function (req, res) {
    return new Promise((resolve, reject) => {
        upload(req, res, function (error) {
            if (error) return reject(error);
            return resolve(req.files);
        });
    });
};

module.exports = uploadFile;