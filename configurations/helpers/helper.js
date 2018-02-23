const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')
const jwt = require('jsonwebtoken')
const CommonConfig = require('./common-config')
const config = require('../main/development')
const lookup = require('country-data').lookup

module.exports = {
    Country: {
        GetCourrencyDetailsByCountryName: async (countryName) => {
            try {
                const countryDetails = await lookup.countries({name: countryName})[0]
                return await lookup.currencies({code: countryDetails.currencies})[0]
            } catch (error) {
                return null
            }
        }
    },
    ResponseHelpers: {
        SetSuccessResponse: function (data, res, statusCode) {
            let response = {
                success: true,
                data: data,
                error: null,
                status: statusCode
            }
            this.SetResponse(statusCode, response, res)
        },
        SetSuccessErrorResponse: function (data, res, statusCode) {
            let response = {
                success: false,
                data: data,
                error: null,
                status: statusCode
            }
            this.SetResponse(statusCode, response, res)
        },
        SetErrorResponse (errors, res) {
            const response = {
                success: false,
                data: [],
                error: errors
            }
            this.SetResponse(500, response, res)
        },
        SetNotFoundResponse (errors, res) {
            const response = {
                success: false,
                data: [],
                error: errors
            }
            this.SetResponse(404, response, res)
        },
        SetBadRequestResponse (errors, res) {
            const response = {
                success: false,
                data: [],
                error: errors
            }
            this.SetResponse(401, response, res)
        },
        SetForbiddenResponse (errors, res) {
            const response = {
                success: false,
                data: [],
                error: errors
            }
            this.SetResponse(403, response, res)
        },
        SetResponse: function (status, response, res) {
            console.info('======================================================================')
            console.info(response)
            console.info('======================================================================')
            res.status(status).json(response)
            res.end()
        }
    },
    AuthenticationHelpers: {
        GenerateToken: (user, uniqueKey, hasProfile) => {
            user.isGuest = false
            user.hasProfile = hasProfile
            user.uniqueKey = uniqueKey
            return 'JWT ' + jwt.sign(
                user,
                config.keys.secret,
                {expiresIn: '50y'}
            )
        },
        GenerateTokenForResetPassword: (user, uniqueKey, hasProfile) => {
            user.isGuest = false
            user.hasProfile = hasProfile
            user.uniqueKey = uniqueKey
            return 'JWT ' + jwt.sign(
                user,
                config.keys.secret,
                {expiresIn: '1h'}
            )
        },
        GenerateTokenForGuest: (user) => {
            return 'JWT ' + jwt.sign(
                user,
                config.keys.secret,
                {expiresIn: '1h'}
            )
        }
    },
    MailingHelpers: {
        ToResetPassword: async (data) => {
            let transporter = nodemailer.createTransport(config.CONFIG.EMAIL_OPTIONS)
            transporter.use('compile', hbs(config.CONFIG.EMAIL_ENGINE_OPTIONS))
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
            }

            return await transporter.sendMail(mailOptions)
        }
    }
}
