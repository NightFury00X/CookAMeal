'use strict';
let CommonConfig = module.exports;

let Roles = CommonConfig.Roles = {
    Cook: 1,        //  0001
    Customer: 2,    //  0010
    Admin: 4,       //  0100
    All: 8          //  1000
};

CommonConfig.AccessLevels = {
    All: Roles.Cook | Roles.Customer | Roles.Admin,  // 0111
    Cook: Roles.Cook | Roles.Admin,                  // 0101    
    Customer: Roles.Customer | Roles.Admin,          // 0110  
    Admin: Roles.Admin                               // 0100
};

CommonConfig.UserType = {
    Normal_User: 1,
    Facebook_User: 2
};

CommonConfig.StatusCode = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};

CommonConfig.ObjectType = {
    Profile: 1,
    IdentificationCard: 2,
    Certificate: 3,
    Category: 3
};