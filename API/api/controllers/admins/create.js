
/* global _, AdminProfiles, UserInformation, Users, sails */

var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var crypto = require('crypto');

module.exports = function create(request, response) {
    const post_request_data = request.body;
    var _response_object = {};
    var filtered_post_data = _.pick(post_request_data,['first_name', 'last_name', 'email', 'phone', 'password', 'location', 'location_text']);
    const filtered_post_keys = Object.keys(filtered_post_data);
    var input_attributes = [
        {name: 'first_name', required: true},
        {name: 'phone', phone:true, required: false},
        {name: 'email', email:true, required: true},
        {name: 'password', min:8},
        {name: 'location', geopoint: true}
    ];
    //Build and sending response
    const sendResponse = (details) => {
        _response_object.message = 'Admin created successfully.';
        var meta = {};
        meta['photo'] = {
          path: 'https://s3.' + sails.config.conf.aws.region + '.amazonaws.com/' + sails.config.conf.aws.bucket_name,
          folder: 'media/Users',
          sizes: {
            small: 256,
            medium: 512,
            large: 1024,
          }
        };
        meta['photo'].example = meta['photo'].path + '/' + meta['photo'].folder + '/' + meta['photo'].sizes.medium + '/user-209.png';
        _response_object['meta'] = meta;
        _response_object['details'] = _.cloneDeep(details);
        return response.ok(_response_object);
    };
    //Create a new profile.
    const createUser = (post_data, callback) => {
        var user_input = {
            username: post_data.email,
            last_checkin_via: 'web',
            types: [2],
            last_active: new Date(),
            verified: true
        };
        if(filtered_post_keys.includes('password')){
            user_input.password = filtered_post_data.password;
        }else{
            user_input.password = Math.floor(10000000 + Math.random() * 90000000);
        }
		//create a new user
        Users.create(user_input, async function(err, user){
            if(err){
                await errorBuilder.build(err, function (error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            }else{
                profile_input = {
                    first_name: filtered_post_data.first_name,
                    account: user.id
                }
                if(post_data.email){
                    profile_input.email = post_data.email;
                }
                if(post_data.phone){
                    profile_input.email = post_data.encrypted_phone;
                }
                if(filtered_post_keys.includes('last_name')){
                    profile_input.last_name = filtered_post_data.last_name;
                }
                if(filtered_post_keys.includes('location')){
                    location = filtered_post_data.location.split(',')
                    profile_input.location = '(' + location[0] + ',' + location[1] + ')';
                }
                AdminProfiles.create(profile_input, async function(err, profile){
                    if(err){
                        await errorBuilder.build(err, function (error_obj) {
                            _response_object.errors = error_obj;
                            _response_object.count = error_obj.length;
                            return response.status(500).json(_response_object);
                        });
                    }else{
                          sendResponse(profile);
                    }
                });
            }
        });
    };
    //Add to the existing profile.
    const updateUser = async (user_data, post_data, callback) => {
        user_data.types.push(2);
        var user_input = {
            types: user_data.types,
            last_active: new Date(),
            last_checkin_via: 'web'
        };
        user_input.tokens = {reset: UtilsService.uid(20), verification: UtilsService.uid(20)};
        if(filtered_post_keys.includes('password')){
            user_input.password = await bcrypt.hash(filtered_post_data.password, SALT_WORK_FACTOR);
        }
		//update the user fields
        Users.update(parseInt(user_data.id), user_input, async function(err, user){
            if(err){
                await errorBuilder.build(err, function (error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            }else{
                profile_input = {
                    first_name: filtered_post_data.first_name,
                    account: parseInt(user_data.id)
                }
                if(filtered_post_keys.includes('email')){
                    profile_input.email = (filtered_post_data.email).toLowerCase();
                }
                if(filtered_post_keys.includes('phone')){
                    profile_input.phone = filtered_post_data.encrypted_phone;
                }
                if(filtered_post_keys.includes('last_name')){
                    profile_input.last_name = filtered_post_data.last_name;
                }
                if(filtered_post_keys.includes('location')){
                    location = filtered_post_data.location.split(',')
                    profile_input.location = '(' + location[0] + ',' + location[1] + ')';
                }
                AdminProfiles.create(profile_input, async function(err, profile){
                    if(err){
                        await errorBuilder.build(err, function (error_obj) {
                            _response_object.errors = error_obj;
                            _response_object.count = error_obj.length;
                            return response.status(500).json(_response_object);
                        });
                    }else{
                          sendResponse(profile);
                    }
                });
            }
        });
    };
	//validate the data's
    validateModel.validate(AdminProfiles, input_attributes, filtered_post_data, async function(valid, errors){
        if(valid){
            if(filtered_post_keys.includes('email')){
                filtered_post_data.email = (filtered_post_data.email).toLowerCase();
            }else{
                filtered_post_data.email = null;
            }
            if(filtered_post_keys.includes('phone')){
                filtered_post_data.encrypted_phone = filtered_post_data.phone;
                await phoneEncryptor.encrypt(filtered_post_data.phone, function(encrypted_text){
                    filtered_post_data.encrypted_phone = encrypted_text;
                });
            }else{
                filtered_post_data.phone = null;
            }
            await loginService.findExistingConnection(1, filtered_post_data.email, filtered_post_data.phone, async function(err, user){
                if(err){
                    await errorBuilder.build(err, function (error_obj) {
                        _response_object.errors = error_obj;
                        _response_object.count = error_obj.length;
                        return response.status(500).json(_response_object);
                    });
                }else if(user && _.indexOf(user.types,2) > -1){
                    var message = 'Email or phone already taken.';
                    if(user.email && user.email === filtered_post_data.email && user.phone === filtered_post_data.encrypted_phone){
                        message = 'Email and phone already taken.';
                    }else if(user.email && user.email === filtered_post_data.email){
                        message = 'Email already taken.';
                    }else if(user.phone === filtered_post_data.encrypted_phone){
                        message = 'Phone already taken.';
                    }
                    _response_object.errors = [{field: 'account', rules: [{rule:'unique', message: message}]}];
                    return response.status(400).json(_response_object);
                }else if(user){
                    updateUser(user, filtered_post_data);
                }else{
                    createUser(filtered_post_data);
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
