/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/* global _, UserProfiles, Users, sails */

var squel = require("squel");
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var crypto = require('crypto');

module.exports = function updatePassword(request, response) {
    const post_request_data = request.body;
    const logged_in_user = request.user;
    var _response_object = {};
    var filtered_post_data = _.pick(post_request_data,['id', 'token', 'password']);
    var input_attributes = [
        {name: 'id', required: true},
        {name: 'token', required: true},
        {name: 'password', required: true, min:8},
    ];
    validateModel.validate(Users, input_attributes, filtered_post_data, async function(valid, errors){
        if(valid){
            await Users.findOne(parseInt(filtered_post_data.id), async function(err, user){
                if(err){
                    await errorBuilder.build(err, function (error_obj) {
                        _response_object.errors = error_obj;
                        _response_object.count = error_obj.length;
                        return response.status(500).json(_response_object);
                    });
                }else if(user && user.tokens.reset === filtered_post_data.token){
                    var tokens = {};
                    if(user.tokens){
                        tokens = user.tokens;
                    }
                    tokens.reset = UtilsService.uid(20);
                    hashed_password = await bcrypt.hash(filtered_post_data.password, SALT_WORK_FACTOR);
                    Users.update(filtered_post_data.id, {password: hashed_password, tokens: tokens}, async function(err, user){
                        if(err){
                            await errorBuilder.build(err, function (error_obj) {
                                _response_object.errors = error_obj;
                                _response_object.count = error_obj.length;
                                return response.status(500).json(_response_object);
                            });
                        }else{
                            _response_object.message = 'Password has been resetted successfully.';
                            return response.status(200).json(_response_object);
                        }
                    });
                }else{
                    _response_object.errors = [{field: 'token', rules: [{rule:'invalid', message: 'Invalid password reset token.'}]}];
                    return response.status(400).json(_response_object);
                }
            });
        }else{
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });
};
