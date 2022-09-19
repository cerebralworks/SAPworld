/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/* global _, EmployerProfiles, UserInformation, Users, sails */

var bcrypt = require('bcryptjs');
var SALT_WORK_FACTOR = 10;
var crypto = require('crypto');

module.exports = function signup(request, response) {
    const post_request_data = request.body;
    var _response_object = {};
    var filtered_post_data = _.pick(post_request_data, ['first_name', 'last_name', 'email', 'phone', 'password', 'location', 'location_text', 'company', 'job_title', 'city']);
    const filtered_post_keys = Object.keys(filtered_post_data);
    var input_attributes = [
        { name: 'first_name', required: true },
        { name: 'last_name', required: true },
        { name: 'email', email: true, required: true },
        { name: 'company', required: true },
        { name: 'password', min: 8, required: true },
        { name: 'phone' },
        { name: 'location', geopoint: true },
        { name: 'job_title' },
        { name: 'city', number: true }
    ];
    //Build and sending response
    const sendResponse = (details) => {
        //Sending email
        const mail_data = {
            template: 'employers/signup',
            data: details,
            to: filtered_post_data.email,
            subject: 'Welcome to SAP WORLD.'
        };
        mailService.sendMail(mail_data);
        _response_object.message = 'Employer signed up successfully.';
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
    const createUser = async(post_data, callback) => {
        var user_input = {
            username: post_data.email,
            last_checkin_via: 'web',
            types: [1],
            last_active: new Date(),
            password: post_data.password
        };
        if (!filtered_post_keys.includes('password')) {
            user_input.password = Math.floor(10000000 + Math.random() * 90000000);
        }
        Users.create(user_input, async function(err, user) {
            if (err) {
                await errorBuilder.build(err, function(error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            } else {
                profile_input = {
                    first_name: filtered_post_data.first_name,
                    account: user.id
                }
                if (post_data.email) {
                    profile_input.email = post_data.email;
                }
                if (post_data.phone) {
                    profile_input.phone = post_data.encrypted_phone;
                }
				
                if (filtered_post_keys.includes('last_name')) {
                    profile_input.last_name = post_data.last_name;
                }
                if (filtered_post_keys.includes('location')) {
                    location = post_data.location.split(',')
                    profile_input.location = '(' + location[0] + ',' + location[1] + ')';
                }
                if (filtered_post_keys.includes('company')) {
                    profile_input.company = post_data.company;
                }
                if (filtered_post_keys.includes('job_title')) {
                    profile_input.job_title = post_data.job_title;
                }
                if (filtered_post_keys.includes('city')) {
                    profile_input.city = parseInt(post_data.city);
                }
                EmployerProfiles.create(profile_input, async function(err, profile) {
                    if (err) {
                        await errorBuilder.build(err, function(error_obj) {
                            _response_object.errors = error_obj;
                            _response_object.count = error_obj.length;
                            return response.status(500).json(_response_object);
                        });
                    } else {
                        profile.token = user.tokens.verification;
						profile.name = post_data.first_name;
                        sendResponse(profile);
                    }
                });
            }
        });
    };
    //Add to the existing profile.
    const updateUser = async(user_data, post_data, callback) => {
        user_data.types.push(1);
        var user_input = {
            types: user_data.types,
            last_active: new Date(),
            last_checkin_via: 'web'
        };
        user_input.tokens = { reset: UtilsService.uid(20), verification: UtilsService.uid(20) };
        if (filtered_post_keys.includes('password')) {
            user_input.password = await bcrypt.hash(filtered_post_data.password, SALT_WORK_FACTOR);
        }
		
        Users.update(parseInt(user_data.id), user_input, async function(err, user) {
            if (err) {
                await errorBuilder.build(err, function(error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            } else {
                profile_input = {
                    first_name: post_data.first_name,
                    account: parseInt(user_data.id)
                }
                if (filtered_post_keys.includes('email')) {
                    profile_input.email = (post_data.email).toLowerCase();
                }
                if (filtered_post_keys.includes('phone')) {
                    profile_input.phone = post_data.encrypted_phone;
                }
                if (filtered_post_keys.includes('last_name')) {
                    profile_input.last_name = post_data.last_name;
                }
                if (filtered_post_keys.includes('location')) {
                    location = post_data.location.split(',')
                    profile_input.location = '(' + location[0] + ',' + location[1] + ')';
                }
                if (filtered_post_keys.includes('company')) {
                    profile_input.company = post_data.company;
                }
                if (filtered_post_keys.includes('job_title')) {
                    profile_input.job_title = post_data.job_title;
                }
                if (filtered_post_keys.includes('city')) {
                    profile_input.city = parseInt(post_data.city);
                }
                EmployerProfiles.create(profile_input, async function(err, profile) {
                    if (err) {
                        await errorBuilder.build(err, function(error_obj) {
                            _response_object.errors = error_obj;
                            _response_object.count = error_obj.length;
                            return response.status(500).json(_response_object);
                        });
                    } else {
                        profile.token = user[0].tokens.verification;
                        sendResponse(profile);
                    }
                });
            }
        });
    };
	//Validating the request and pass on the appriopriate response.
    validateModel.validate(EmployerProfiles, input_attributes, filtered_post_data, async function(valid, errors) {
        if (valid) {
            if (filtered_post_keys.includes('email')) {
                filtered_post_data.email = (filtered_post_data.email).toLowerCase();
            } else {
                filtered_post_data.email = null;
            }
            if (filtered_post_keys.includes('phone')) {
                filtered_post_data.encrypted_phone = filtered_post_data.phone;
                await phoneEncryptor.encrypt(filtered_post_data.phone, function(encrypted_text) {
                    filtered_post_data.encrypted_phone = encrypted_text;
                });
            } else {
                filtered_post_data.phone = null;
            }
            await loginService.findExistingConnection(1, filtered_post_data.email, filtered_post_data.phone, async function(err, user) {
                if (err) {
                    await errorBuilder.build(err, function(error_obj) {
                        _response_object.errors = error_obj;
                        _response_object.count = error_obj.length;
                        return response.status(500).json(_response_object);
                    });
                } else if (user && _.indexOf(user.types, 1) > -1) {
                    var message = 'Email or phone already taken.';
                    if (user.email && user.email === filtered_post_data.email && user.phone === filtered_post_data.encrypted_phone) {
                        message = 'Email and phone already taken.';
                    } else if (user.email && user.email === filtered_post_data.email) {
                        message = 'Email already taken.';
                    } else if (user.phone === filtered_post_data.encrypted_phone) {
                        message = 'Phone already taken.';
                    }
                    _response_object.errors = [{ field: 'account', rules: [{ rule: 'unique', message: message }] }];
                    return response.status(400).json(_response_object);
                } else if (user) {
                    //updateUser(user, filtered_post_data);
					message = 'Email already taken.';
					_response_object.errors = [{ field: 'account', rules: [{ rule: 'unique', message: message }] }];
                    return response.status(400).json(_response_object);
                } else {
                    createUser(filtered_post_data);
                }
            });
        } else {
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });
};