
/* global _, validateModel, UserProfiles */

var squel = require("squel");

module.exports = async function checkUserHandle(request,response) {
    const logged_in_user = request.user;
    var _response_object = {};
    const request_query = request.allParams();
    const filtered_query_data = _.pick(request_query, ['user_handle']);
    var input_attributes = [{name: 'user_handle', required: true, min: 3, alphanumeric_underscore: true}];
    validateModel.validate(null, input_attributes, filtered_query_data,function(valid, errors){
        if(valid){
            var query = squel.select({tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"'}).from(UserProfiles.tableName);
            query.where(UserProfiles.schema.user_handle.columnName + "='" + filtered_query_data.user_handle + "'");
            query = 'SELECT EXISTS (' + query.toString() + ')';
            //Executing query
            var user_model = sails.sendNativeQuery(query);
            user_model.exec(async function(err, user){
                if(!user){
                    _response_object.message = 'Something went wrong.';
                    return response.status(500).json(_response_object);
                }else{
                    if(user.rows[0].exists){
                        _response_object.message = 'User handle is already taken.';
                    }else{
                        _response_object.message = 'User handle is available.';
                    }
                    _response_object.details = Object.assign({}, user.rows[0]);
                    return response.status(200).json(_response_object);
                }
            });
        }
        else{
            _response_object.errors=errors;
            _response_object.count=errors.length;
            return response.status(400).json(_response_object);
        }
    });

};
