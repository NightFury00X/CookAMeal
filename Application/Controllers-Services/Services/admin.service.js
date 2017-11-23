let db = require('../../Modals'),
    config = require('../../../Configurations/Main'),
    CommonConfig = require('../../../Configurations/Helpers/common-config');

AdminService = function () {
};

AdminService.prototype.Add = async (userid, category, files) => {
    const trans = await db.sequelize.transaction();
    try {
        let categoryData = await db.Category.create(category, {transaction: trans});
    
        //upload profile image
        // let mediaObject;
        if (files && files.category) {
            let CategoryImage = files.category[0];
            CategoryImage.category_id = categoryData.id;
            CategoryImage.imageurl = config.UPLOAD_LOCATION + CategoryImage.filename;
            CategoryImage.user_type_id = userid;
            await db.MediaObject.create(CategoryImage, {transaction: trans});
        }
        // commit transaction
        return await trans.commit();
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