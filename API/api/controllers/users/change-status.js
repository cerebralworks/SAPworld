/**
 *
 * @author Saravanan Karthikeyan <saravanan@studioq.co.in>
 *
 */

/* global _, UserProfiles, validateModel, sails */

module.exports = async function changeStatus(request, response) {
    const post_request_data = request.body;
    const request_query = request.allParams();
    const id = parseInt(request_query.id);
    var _response_object = {};
    const logged_in_user = request.user;
    pick_input = [
        'status', 'status_glossary'
    ];
    var filtered_post_data = _.pick(post_request_data, pick_input);
    const filtered_post_keys = Object.keys(filtered_post_data);
    var input_attributes = [
        {name: 'status', enum: true, values: _.values(_.pick(sails.config.custom.status_codes,['inactive', 'active'] )), required: true},
        {name: 'status_glossary', required: true}
    ];

    // Update the User record to db.
    function updateUser(user_id, data, callback){
        Users.update(user_id, data, async function(err, user){
            if(err){
                await errorBuilder.build(err, function (error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            }else{
                return callback(user[0]);
            }
        });
    };

    // Check whether the user posting id is exits in db.
    function isUserExist(id, callback){
        UserProfiles.findOne(id,function(err, user){
            if(!user){
                _response_object.message = 'No user found with the given id.';
                return response.status(404).json(_response_object);
            }else{
                callback(user);
            }
      });
    }

    // Build and send response.
    function sendResponse(details){
        if(parseInt(filtered_post_data.status) === 1){
            _response_object.message = 'User has been activated successfully.';
        }else{
            _response_object.message = 'User has been deactivated successfully.';
        }
        _response_object['details'] = {id: details.id, status: filtered_post_data.status};
        return response.ok(_response_object);
    };

    validateModel.validate(UserProfiles, input_attributes, filtered_post_data, async function(valid, errors){
        if(valid){
            if(filtered_post_keys.includes('status')){
                filtered_post_data.status = parseInt(filtered_post_data.status);
            }
            isUserExist(id, function(user){
                updateUser(user.account, filtered_post_data, function (user) {
                    sendResponse(user);
                });
            });
        }else{
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });
};
