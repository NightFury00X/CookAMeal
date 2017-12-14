const nodemailer = require("nodemailer"),
    hbs = require('nodemailer-express-handlebars'),
    jwt = require("jsonwebtoken"),
    CommonConfig = require("./common-config"),
    config = require("../Main/development");


module.exports = {
    ResponseHelpers: {
        SetSuccessResponse: function (data, res, statusCode) {
            let response = {
                "success": true,
                data: data,
                "error": null
            };
            this.SetResponse(statusCode, response, res);
        },
        SetResponse: function (status, response, res) {
            res.status(status).json(response);
            res.end();
        }
    },
    AuthenticationHelpers: {
        GenerateToken: (user, uniqueKey, type) => {
            user.is_normal = type;
            user.unique_key = uniqueKey;
            return 'JWT ' + jwt.sign(
                user,
                config.keys.secret,
                {expiresIn: '50y'}
            )
        },
        GenerateTokenForResetPassword: (user, uniqueKey, type) => {
            user.is_normal = type;
            user.unique_key = uniqueKey;
            return 'JWT ' + jwt.sign(
                user,
                config.keys.secret,
                {expiresIn: '1h'}
            )
        }
    },
    MailingHelpers: {
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
            
            return await transporter.sendMail(mailOptions);
        }
    }
};