
/* global Users, _ */

/**
 * isAdmin
 *
 * @description :: Policy to check whether the user is admin
*/


module.exports = function (req, res, next) {
    var user = req.user;
    //if(_.indexOf(user.types,0) > -1 || _.indexOf(user.types,1) > -1){
    if(user.types.indexOf(0) > -1 || user.types.indexOf(1) > -1){
        return next();
    }else{
        res.status(403).json({'message':'You don\'t have permission to perform this action.'});
    }
};
