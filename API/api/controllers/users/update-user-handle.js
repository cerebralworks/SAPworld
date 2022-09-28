

/* global _, UserProfiles, Users, sails */

var squel = require("squel");

module.exports = function updateUserHandle(request, response) {
    const post_request_data = request.body;
    const logged_in_user = request.user;
    var _response_object = {};
    var filtered_post_data = _.pick(post_request_data,['user_handle']);
    var input_attributes = [
        {name: 'user_handle', required: true, min: 3, alphanumeric_underscore: true}
    ];
	//Validating the request and pass on the appriopriate response.
    validateModel.validate(UserProfiles, input_attributes, filtered_post_data, async function(valid, errors){
        if(valid){
            var query = squel.select({tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"'}).from(UserProfiles.tableName);
            query.where(UserProfiles.schema.user_handle.columnName + "='" + filtered_post_data.user_handle + "'");
            query.where(UserProfiles.schema.id.columnName + "<>'" + logged_in_user.user_profile.id + "'");
            query = 'SELECT EXISTS (' + query.toString() + ')';
            //Executing query
            var user_model = sails.sendNativeQuery(query);
            user_model.exec(async function(err, user){
                if (!user) {
                    _response_object.errors = [{field: 'user_handle', rules: [{rule:'unexpected', message: 'Something went wrong.'}]}];
                    _response_object.count = 1;
                    return response.status(500).json(_response_object);
                } else {
                    if(user.rows[0].exists){
                        _response_object.errors = [{field: 'user_handle', rules: [{rule:'unique', message: 'User handle is already taken.'}]}];
                        _response_object.count = 1;
                        return response.status(400).json(_response_object);
                    }else{
                        UserProfiles.update({id: logged_in_user.user_profile.id}, {user_handle: filtered_post_data.user_handle}, async function(err, profile){
                            if(err){
                                await errorBuilder.build(err, function (error_obj) {
                                    _response_object.errors = error_obj;
                                    _response_object.count = error_obj.length;
                                    return response.status(500).json(_response_object);
                                });
                            }else{
                                _response_object.message = 'User handle has been updated successfully.';
                                return response.status(200).json(_response_object);
                            }
                        });
                    }
                }
            });
        }
        else{
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });
};
