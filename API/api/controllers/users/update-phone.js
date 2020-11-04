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

module.exports = function updatePhone(request, response) {
    const post_request_data = request.body;
    const logged_in_user = request.user;
    var _response_object = {};
    var filtered_post_data = _.pick(post_request_data,['phone']);
    const filtered_post_keys = Object.keys(filtered_post_data);
    var input_attributes = [
        {name: 'phone', required: true, phone: true, message:"Have to be a valid US number (eg: 202-272-0167)."}
    ];
    validateModel.validate(null, input_attributes, filtered_post_data, async function(valid, errors){
        if(valid){
                await phoneEncryptor.encrypt(filtered_post_data.phone.toString(), function(encrypted_text){
                    filtered_post_data.encrypted_phone = encrypted_text;
                });
                UserProfiles.update({id: logged_in_user.user_profile.id}, {phone: filtered_post_data.encrypted_phone}, async function(err, user){
                    if(err){
                        await errorBuilder.build(err, function (error_obj) {
                            _response_object.errors = error_obj;
                            _response_object.count = error_obj.length;
                            return response.status(500).json(_response_object);
                        });
                    }else if(logged_in_user.username === logged_in_user.user_profile.phone){
                        Users.update({id: logged_in_user.id}, {username: filtered_post_data.encrypted_phone}, async function(err, user){
                            if(err){
                                await errorBuilder.build(err, function (error_obj) {
                                    _response_object.errors = error_obj;
                                    _response_object.count = error_obj.length;
                                    return response.status(500).json(_response_object);
                                });
                            }else{
                                _response_object.message = 'Phone number has been updated successfully.';
                                return response.status(200).json(_response_object);
                            }
                        });
                    }else{
                        _response_object.message = 'Phone number has been updated successfully.';
                        return response.status(200).json(_response_object);
                    }
                });

        }else{
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });
};
