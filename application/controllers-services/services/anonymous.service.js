const Sequelize = require('sequelize')
const Op = Sequelize.Op
const db = require('../../modals')
const {AuthenticationHelpers, MailingHelpers, MailGun} = require('../../../configurations/helpers/helper')
const CommonConfig = require('../../../configurations/helpers/common-config')
const MapService = require('./map-service')
const CommonService = require('./common.service')

AnonymousService = function () {
}

AnonymousService.prototype.SignUp = async (registrationData, files) => {
    const trans = await db.sequelize.transaction()
    try {
        let userData = registrationData.user
        if (userData.allergies) {
            userData.allergies = JSON.stringify(userData.allergies)
        }
        const facebookId = !registrationData.facebook ? null : registrationData.facebook.facebookId ? registrationData.facebook.facebookId : null
        const facebookEmailId = !registrationData.facebook ? null : registrationData.facebook.facebookEmailId ? registrationData.facebook.facebookEmailId : null
        let userType = await db.UserType.create({
            emailId: userData.email,
            userRole: userData.userRole,
            hasProfile: true,
            hasLogin: true,
            facebookId: facebookId,
            facebookEmailId: facebookEmailId,
            profileSelected: true
        }, {transaction: trans})
        await db.User.create({
            createdBy: userType.id,
            email: userData.email,
            password: userData.password
        }, {transaction: trans})
        let tempData = userData
        delete tempData.password
        tempData.createdBy = userType.id
        tempData.userRole = userData.userRole
        tempData.isFacebookConnected = !!facebookId
        let userProfileData = await db.Profile.create(tempData, {transaction: trans})
        let profileImagePic = null
        registrationData.address.profileId = userProfileData.id
        const {address} = registrationData
        delete address.latitude
        delete address.longitude
        delete address.profileId
        const location = await MapService.Map.GetGeoCordinatesFromAddress(`${address.street}, ${address.city}, ${address.state}, ${address.country}`)
        registrationData.address.latitude = location[0].latitude
        registrationData.address.longitude = location[0].longitude
        registrationData.address.profileId = userProfileData.id
        const addressDetails = await db.Address.create(registrationData.address, {transaction: trans})
        let ProfileMediaObject
        let identificationCardData
        if (files) {
            if (files.profile) {
                let profileImage = files.profile[0]
                profileImage.profileId = userProfileData.id
                profileImage.objectType = CommonConfig.OBJECT_TYPE.PROFILE
                profileImage.imageUrl = CommonConfig.FILE_LOCATIONS.PROFILE + profileImage.filename
                profileImage.fileName = profileImage.filename
                profileImage.originalName = profileImage.originalname
                profileImage.mimeType = profileImage.mimetype
                delete profileImage.filename
                delete profileImage.originalname
                delete profileImage.mimetype
                ProfileMediaObject = await db.MediaObject.create(profileImage, {transaction: trans})
                profileImagePic = profileImage.imageUrl
                await db.Profile.update({
                    profileUrl: profileImage.imageUrl
                }, {
                    where: {
                        [Op.and]: {
                            id: `${ProfileMediaObject.profileId}`
                        }
                    },
                    transaction: trans
                })
            }
            if (files.identificationCard) {
                if (registrationData.identificationCard) {
                    let identificationCard = registrationData.identificationCard
                    identificationCard.profileId = userProfileData.id
                    identificationCardData = await db.IdentificationCard.create(identificationCard, {transaction: trans})
                    let identificationCardMedia = files.identificationCard[0]
                    identificationCardMedia.identificationCardId = identificationCardData.id
                    identificationCardMedia.objectType = CommonConfig.OBJECT_TYPE.IDENTIFICATIONCARD
                    identificationCardMedia.imageUrl = CommonConfig.FILE_LOCATIONS.IDENTIFICATIONCARD + identificationCardMedia.filename
                    identificationCardMedia.fileName = identificationCardMedia.filename
                    identificationCardMedia.originalName = identificationCardMedia.originalname
                    identificationCardMedia.mimeType = identificationCardMedia.mimetype
                    delete identificationCardMedia.filename
                    delete identificationCardMedia.originalname
                    delete identificationCardMedia.mimetype
                    await db.MediaObject.create(identificationCardMedia, {transaction: trans})
                }
            }
            if (files.certificate) {
                let certificateData = await db.Certificate.create({profileId: userProfileData.id}, {transaction: trans})
                let certificateMedia = files.certificate[0]
                certificateMedia.certificateId = certificateData.id
                certificateMedia.objectType = CommonConfig.OBJECT_TYPE.CERTIFICATE
                certificateMedia.imageUrl = CommonConfig.FILE_LOCATIONS.CERTIFICATE + certificateMedia.filename
                certificateMedia.fileName = certificateMedia.filename
                certificateMedia.originalName = certificateMedia.originalname
                certificateMedia.mimeType = certificateMedia.mimetype
                delete certificateMedia.filename
                delete certificateMedia.originalname
                delete certificateMedia.mimetype
                await db.MediaObject.create(certificateMedia, {transaction: trans})
            }
        }
        if (facebookId || (files.identificationCard && registrationData.identificationCard)) {
            await db.Profile.update({
                isEligibleForHire: true
            }, {
                where: {
                    id: {
                        [Op.eq]: userProfileData.id
                    }
                },
                transaction: trans
            })
        }
        await trans.commit()
        return {
            token: AuthenticationHelpers.GenerateToken(userType.userInfo, null, true),
            user: {
                id: userType.id,
                email: userProfileData.email,
                fullName: userProfileData.fullName,
                userRole: userType.userRole,
                profileUrl: profileImagePic,
                hasProfile: true,
                profileSelected: true,
                currencySymbol: addressDetails.currencySymbol
            }
        }
    } catch (error) {
        await trans.rollback()
        throw (error)
    }
}

AnonymousService.prototype.Authenticate = async (userDetails) => {
    try {
        let userTypeDetails
        if (userDetails.tokenStatus && userDetails.tokenId) {
            userTypeDetails = await db.UserType.findOne({
                where: {
                    [Op.and]: [{
                        id: userDetails.createdBy
                    }]
                },
                include: [{
                    model: db.Profile,
                    include: [{
                        model: db.Address
                    }, {
                        model: db.MediaObject
                    }]
                }, {
                    model: db.ResetPassword,
                    where: {
                        [Op.and]: [{
                            id: userDetails.tokenId,
                            isValid: true,
                            status: true
                        }]
                    }
                }]
            })
        } else {
            userTypeDetails = await db.UserType.findOne({
                where: {
                    id: {
                        [Op.eq]: `${userDetails.createdBy}`
                    }
                },
                include: [{
                    model: db.Profile,
                    include: [{
                        model: db.Address
                    }, {
                        model: db.MediaObject
                    }]
                }]
            })
        }
        if (!userTypeDetails) {
            return null
        }
        return {
            token: !userDetails.tokenStatus ? AuthenticationHelpers.GenerateToken(userTypeDetails.userInfo, false, true) : userTypeDetails.ResetPasswords[0].token,
            user: {
                id: userTypeDetails.id,
                email: userTypeDetails.Profile.email,
                fullName: userTypeDetails.Profile.fullName,
                userRole: userTypeDetails.userRole,
                profileUrl: userTypeDetails.Profile.profileUrl,
                hasProfile: true,
                profileSelected: false,
                currencySymbol: userTypeDetails.Profile.Address.currencySymbol
            }
        }
    } catch (error) {
        throw (error)
    }
}

AnonymousService.prototype.AddResetPasswordDetails = async (userDetails, email, tokenData) => {
    const trans = await db.sequelize.transaction()
    try {
        if (tokenData && !tokenData.tokenStatus) {
            let data = await db.ResetPassword.update({
                isValid: false,
                status: false
            }, {
                where: {
                    id: {
                        [Op.eq]: tokenData.tokenId
                    }
                },
                transaction: trans
            })
            if (!data) {
                await trans.rollback()
                return null
            }
        }

        console.log('userDetails.createdBy: ', userDetails.createdBy)
        let userInfo = await db.UserType.findOne({
            where: {
                id: {
                    [Op.eq]: `${userDetails.createdBy}`
                }
            },
            include: [{
                model: db.Profile,
                include: [{
                    model: db.Address
                }]
            }]
        })
        if (!userInfo) {
            await trans.rollback()
            return null
        }

        let fullname = userInfo.Profile.firstName + ' ' + userInfo.Profile.lastName
        let data = await db.ResetPassword.create(userDetails, {transaction: trans})
        if (!data) {
            await trans.rollback()
            return null
        }
        console.log('Sending mail ... Please wait......')
        let isSent = await MailingHelpers.ToResetPassword({
            fullname: fullname,
            email: email,
            key: userDetails.random_key
        })
        console.log('mail Info: ', isSent)
        if (!isSent) {
            await trans.rollback()
            return null
        }
        await trans.commit()
        return isSent
    } catch (error) {
        await trans.rollback()
        throw (error)
    }
}

AnonymousService.prototype.SendResetPasswordKeyToMail = async (email) => {
    try {
        let tokenData = await db.UserType.findOne({
            where: {
                emailId: {
                    [Op.eq]: email
                }
            },
            attributes: ['id'],
            include: [{
                attributes: ['firstName', 'lastName', 'profileUrl'],
                model: db.Profile
            }, {
                where: {
                    [Op.and]: [{
                        status: 1,
                        isValid: 1
                    }]
                },
                attributes: ['randomKey'],
                model: db.ResetPassword
            }]
        })

        if (!tokenData) {
            return null
        }

        console.log('Sending mail ... Please wait......')

        return await MailGun.ToResetPassword({
            fullname: tokenData.Profile.firstname + ' ' + tokenData.Profile.lastname,
            email: email,
            key: tokenData.ResetPasswords[0].random_key
        })
    } catch (error) {
        throw (error)
    }
}

AnonymousService.prototype.AddFacebookUser = async (facebookDetails) => {
    const trans = await db.sequelize.transaction()
    try {
        const user = await db.UserType.create({
            facebookEmailId: facebookDetails.email,
            facebookId: facebookDetails.facebookId,
            userRole: 2,
            hasProfile: false
        }, {transaction: trans})
        if (!user) {
            trans.rollback()
            return null
        }
        facebookDetails.createdBy = `${user.id}`
        facebookDetails.userRole = 2
        facebookDetails.profileUrl = facebookDetails.imageUrl
        const facebook = await db.Profile.create(facebookDetails, {transaction: trans})
        trans.commit()
        return facebook
    } catch (error) {
        trans.rollback()
        throw (error)
    }
}

AnonymousService.prototype.ShuffleArray = async (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1))
        let temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
    return array
}

module.exports = new AnonymousService()
