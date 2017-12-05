let db = require('../../Modals'),
    CommonConfig = require('../../../Configurations/Helpers/common-config');

AdminService = function () {
};

AdminService.prototype.Category = {
    Add: async (userid, category, files) => {
        const trans = await db.sequelize.transaction();
        try {
            let categoryData = await db.Category.create(category, {transaction: trans});
            let CategoryDataMedia;
            if (files && files.category) {
                let CategoryImage = files.category[0];
                CategoryImage.category_id = categoryData.id;
                CategoryImage.imageurl = CommonConfig.FILE_LOCATIONS.CATEGORY + CategoryImage.filename;
                CategoryImage.object_type = CommonConfig.OBJECT_TYPE.CATEGORY;
                CategoryDataMedia = await db.MediaObject.create(CategoryImage, {transaction: trans});
            }
            await trans.commit();
            return {Category: categoryData, MediaObject: CategoryDataMedia};
        } catch (error) {
            await trans.rollback();
            throw (error);
        }
    }
};

AdminService.prototype.SubCategory = {
    Add: async (data) => {
        try {
            return db.SubCategory.create(data);
        } catch (error) {
            throw (error);
        }
    }
};

AdminService.prototype.Allergy = {
    Add: async (data) => {
        try {
            return db.Allergy.create(data);
        } catch (error) {
            throw (error);
        }
    }
};

module.exports = new AdminService();