let chalk = require('chalk'),
    log = console.log,
    jwt = require('jsonwebtoken'),
    config = require('../../../Configurations/Main/config'),
    // BaseService = require('./base-service'),
    responseHelper = require('../../../Configurations/Helpers/ResponseHandler'),
    nodemailer = require('nodemailer'),
    hbs = require('nodemailer-express-handlebars'),
    db = require('../../Modals'),
    generateToken = require('../../../Configurations/Helpers/authentication');


AuthService = function () {
};

// AuthService = new BaseService();

AuthService.prototype.signup = function (user, res) {
    return db.UserModel.create(user)
        .then(function (data) {
            return db.AddressModel.create({
                street: '123',
                city: 'Dehradun',
                state: 'Uttarakhand',
                zipcode: '248001',
                country: 'India',
                user_id: data.id
            }).then(function () {
                db.UserModel.findOne({where: {id: data.id}}).then(function (sets) {
                    res.status(201).json({message: sets});
                });
            }).catch(function (error) {
                res.status(403).json({message: error.errors});
            });
            //
            // let transporter = nodemailer.createTransport({
            //     service: 'gmail',
            //     auth: {
            //         user: 'curacall2015@gmail.com',
            //         pass: 'Curacall_2015'
            //     }
            // });
            //
            // transporter.use('compile', hbs({
            //     viewPath: 'views',
            //     extName: '.hbs'
            // }));
            //
            // let mailOptions = {
            //     from: 'surendra136721@gmail.com',
            //     to: 'surendra.chauhan@cynoteck.com',
            //     subject: 'Sending Email using Node.js',
            //     text: 'That was easy!',
            //     template: 'registration',
            //     context: {username: 'Surendra Chauhan'}
            // };

            // transporter.sendMail(mailOptions, function (error, info) {
            //     if (error) {
            //         console.log(error);
            //     } else {
            //         console.log('Email sent: ' + info.response);
            //     }
            // });        

        })
        .catch(function (error) {
            responseHelper.setErrorResponse({
                error
            }, res, 403);
        });
};

AuthService.prototype.authenticate = function (loginDetails, res) {
    db.UserModel.findOne(loginDetails.potentialUser)
        .then(function (user) {
            if (!user) {
                log(chalk.gray.bgRed.bold('Authentication failed!'));
                res.status(404).json({message: 'Authentication failed!'});
            } else {
                user.comparePasswords(loginDetails.password, function (error, isMatch) {

                    console.log('user: ', user.id);
                    if (isMatch && !error) {
                        let userInfo = {
                            id: user.id,
                            username: user.username,
                            role: user.role
                        };
                        let token = generateToken(userInfo);
                        // let token = jwt.sign(
                        //     {username: user.username},
                        //     config.keys.secret,
                        //     {expiresIn: '30m'}
                        // );
                        log(chalk.gray.bgGreen.bold('Login Successfull!'));
                        responseHelper.setSuccessResponse({
                            token: 'JWT ' + token,
                            role: user.role
                        }, res, 200);
                    } else {
                        log(chalk.gray.bgRed.bold('Login Failed!'));
                        responseHelper.setErrorResponse({message: 'Login failed!'}, res, 403);
                    }
                });
            }
        })
        .catch(function () {
            log(chalk.gray.bgRed.bold('Login Failed!'));
            responseHelper.setErrorResponse({message: 'There was an error!'}, res, 403);
        });
};

AuthService.prototype.getUserData = function (user, res) {

    db.UserModel.findAll({
        include: [{model: db.AddressModel, paranoid: false, required: true}]
    })
        .then(function (data) {
            responseHelper.setSuccessResponse({
                data
            }, res, 200);
        })
        .catch(function (error) {
            responseHelper.setErrorResponse({
                error
            }, res, 403);
        });
};

module.exports = new AuthService();