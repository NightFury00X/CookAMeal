let path = require('path');
let FileUploder = {};

let fileExtension = ['.jpg', '.jpeg', '.png', '.'];

//Upload profile image
FileUploder.UploadProfile = function (file) {
    try {
        return new Promise((resolve, reject) => {
            let filePath = path.join(__dirname, '../../Public/Profile/');
            console.log('profile File Path: ', filePath);
            let extension = path.extname(file.name);
            if (fileExtension.indexOf(extension) < 0) {
                return reject(new Error('Invalid file format [' + extension + '].'));
            }
            let fileName = (new Date).valueOf() + '-' + file.name;
            file.mv(filePath + fileName, function (error) {
                if (error) {
                    return reject(error);
                } else {
                    return resolve({
                        file: {
                            name: file.name,
                            encoding: file.encoding,
                            mimetype: file.mimetype,
                            imageurl: filePath + fileName
                        }
                    });
                }
            });
        });
    } catch (error) {
        return error;
    }
};

//Upload docs image
FileUploder.UploadDoc = function (file) {
    try {
        return new Promise((resolve, reject) => {
            let filePath = path.join(__dirname, '../../Public/Documents/');
            console.log('Doc File Path: ', filePath);
            let extension = path.extname(file.name);
            if (fileExtension.indexOf(extension) < 0) {
                return reject(new Error('Invalid file format [' + extension + '].'));
            }
            let fileName = (new Date).valueOf() + '-' + file.name;
            file.mv(filePath + fileName, function (error) {
                if (error) {
                    return reject(error);
                } else {
                    return resolve({
                        file: {
                            name: file.name,
                            encoding: file.encoding,
                            mimetype: file.mimetype,
                            imageurl: filePath + fileName
                        }
                    });
                }
            });
        });
    } catch (error) {
        return error;
    }
};

module.exports = FileUploder;