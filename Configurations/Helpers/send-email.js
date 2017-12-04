'use strict';

let nodemailer = require('nodemailer'),
    hbs = require('nodemailer-express-handlebars'),
    config = require('../Main'),
    CommonConfig = require('./common-config');

// mail sending 
module.exports = {
    ToResetPassword: async (data) => {
        let transporter = nodemailer.createTransport(config.CONFIG.EMAIL_OPTIONS);
        transporter.use('compile', hbs(config.CONFIG.EMAIL_ENGINE_OPTIONS));
        let mailOptions = {
            from: CommonConfig.EMAIL_FROM,
            to: data.email,
            subject: 'Reset Your Password',
            template: CommonConfig.EMAIL_TEMPLATES.RESET_PASSWORD,
            context: {
                fullname: data.fullname,
                email: data.email,
                key: data.key
            }
        };
        
        let result = await transporter.sendMail(mailOptions);
        return result;
    }
};