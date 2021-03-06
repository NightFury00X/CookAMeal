const db = require('../../modals')
const CommonConfig = require('../../../configurations/helpers/common-config')

AdminService = function () {
}

AdminService.prototype.Category = {
    Add: async (userId, category, files) => {
        const trans = await db.sequelize.transaction()
        try {
            let categoryData = await db.Category.create(category, {transaction: trans})
            if (!categoryData) {
                return null
            }
            let CategoryDataMedia
            if (files && files.category) {
                let CategoryImage = files.category[0]
                CategoryImage.categoryId = categoryData.id
                CategoryImage.imageUrl = CommonConfig.FILE_LOCATIONS.CATEGORY + CategoryImage.filename
                CategoryImage.objectType = CommonConfig.OBJECT_TYPE.CATEGORY
                CategoryImage.fileName = CategoryImage.filename
                CategoryImage.originalName = CategoryImage.originalname
                CategoryImage.mimeType = CategoryImage.mimetype
                delete CategoryImage.filename
                delete CategoryImage.originalname
                delete CategoryImage.mimetype
                CategoryDataMedia = await db.MediaObject.create(CategoryImage, {transaction: trans})
                if (!CategoryDataMedia) {
                    return null
                }
            }
            await trans.commit()
            return {Category: categoryData, MediaObject: CategoryDataMedia}
        } catch (error) {
            await trans.rollback()
            throw (error)
        }
    }
}

AdminService.prototype.SubCategory = {
    Add: async (data) => {
        try {
            return db.SubCategory.create(data)
        } catch (error) {
            throw (error)
        }
    }
}

AdminService.prototype.Allergy = {
    Add: async (data) => {
        try {
            return db.Allergy.create(data)
        } catch (error) {
            throw (error)
        }
    }
}

AdminService.prototype.Units = {
    Add: async (data) => {
        try {
            return db.Unit.create(data)
        } catch (error) {
            throw (error)
        }
    }
}

AdminService.prototype.Tax = {
    Add: async (data) => {
        try {
            return db.Tax.create(data)
        } catch (error) {
            throw (error)
        }
    }
}

AdminService.prototype.PaymentMethod = {
    Add: async (data) => {
        try {
            return db.PaymentMethod.create(data)
        } catch (error) {
            throw (error)
        }
    }
}

module.exports = new AdminService()
