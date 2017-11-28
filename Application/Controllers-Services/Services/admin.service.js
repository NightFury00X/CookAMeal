let db = require('../../Modals'),
    CommonConfig = require('../../../Configurations/Helpers/common-config');

AdminService = function () {
};

AdminService.prototype.Add = async (userid, category, files) => {
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

        // commit transaction
        await trans.commit();

        return {Category: categoryData, MediaObject: CategoryDataMedia};
    } catch (error) {
        // rollback transaction
        await trans.rollback();
        throw (error);
    }
};

AdminService.prototype.Delete = async (catId) => {

};

AdminService.prototype.Update = async (category) => {

};

module.exports = new AdminService();