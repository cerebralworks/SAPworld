
/* global _, UserProfiles, Users, sails */

var squel = require("squel");
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var crypto = require('crypto');

module.exports = function verify(request, response) {
    const post_request_data = request.body;
    const logged_in_user = request.user;
    var _response_object = {};
    var filtered_post_data = _.pick(post_request_data,['id', 'token']);
    var input_attributes = [
        {name: 'id', required: true},
        {name: 'token', required: true}
    ];
	
	/**	
	**	To validate the request send for verify user
	**/	
    validateModel.validate(Users, input_attributes, filtered_post_data, async function(valid, errors){
        if(valid){
			
			//find the user based on id
            await Users.findOne(parseInt(filtered_post_data.id), async function(err, user){
                if(err){
                    await errorBuilder.build(err, function (error_obj) {
                        _response_object.errors = error_obj;
                        _response_object.count = error_obj.length;
                        return response.status(500).json(_response_object);
                    });
                }else if(user && user.tokens.verification == filtered_post_data.token){
                    var tokens = {};
                    if(user.tokens){
                        tokens = user.tokens;
                    }
                    tokens.verification = UtilsService.uid(20);
					
					//Update the user is verified
                    Users.update(filtered_post_data.id, {verified: true, tokens: tokens}, async function(err, user){
                        if(err){
                            await errorBuilder.build(err, function (error_obj) {
                                _response_object.errors = error_obj;
                                _response_object.count = error_obj.length;
                                return response.status(500).json(_response_object);
                            });
                        }else{
                            _response_object.message = 'Verifying, Please hold.';
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
