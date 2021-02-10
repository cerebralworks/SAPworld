/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/* global _, UserProfiles, UserInformation, Users, sails */

var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var crypto = require('crypto');

module.exports = function signup(request, response) {
    var details = {};
    const post_request_data = request.body;
    var _response_object = {};
    let yup = sails.yup;
    let schema = yup.object().shape({
        first_name: yup.string().required().lowercase().min(3),
        last_name: yup.string().required().lowercase(),
        email: yup.string().required().email().lowercase(),
        // phone: yup.string().matches(/^([0|\+[0-9]{1,5})?([0-9]{10})$/, 'Mobile number must be like +919999999999'),
        password: yup.string().required().matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/, 'Password must has LOwercase,UpperCase,Digit and special character'),
        // city: yup.string().lowercase(),
        // latlng: yup.object().shape({
        //     lat: yup.number().min(-90).max(90),
        //     lng: yup.number().min(-180).max(180),
        // }),

    });
    //Build and sending response
    const sendResponse = (details) => {
        //Sending email
        const mail_data = {
            template: 'users/signup',
            data: details,
            to: post_request_data.email,
            subject: 'Welcome to Shejobs.'
        };
        mailService.sendMail(mail_data);
        _response_object.message = 'User signed up successfully.';
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
            types: [0],
            last_active: new Date(),
            password: post_data.password
        };
        Users.create(user_input, async function(err, user) {
            if (err) {
                return await errorBuilder.build(err, function(error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            } else {
                post_data.account = user.id;
                // await phoneEncryptor.encrypt(post_data.phone, function(encrypted_text) {
                //     post_data.phone = encrypted_text;
                // });
                post_data.latlng = 'SRID=4326;POINT(0 0)';
                // post_data.latlng_text = latlng_o['lat'] + ',' + latlng_o['lng'];
                UserProfiles.create(post_data, async function(err, profile) {
                    if (err) {
                        await errorBuilder.build(err, function(error_obj) {
                            _response_object.errors = error_obj;
                            _response_object.count = error_obj.length;
                            return response.status(500).json(_response_object);
                        });
                    } else {
                        profile.token = user.tokens.verification;
                        sendResponse(profile);
                    }
                });
            }
        });
    };

    schema.validate(post_request_data, { abortEarly: false }).then(async function(value) {
        await loginService.findExistingConnection(0, value.email, value.phone, async function(err, user) {
            if (err) {
                await errorBuilder.build(err, function(error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            } else if (user && _.indexOf(user.types, 0) > -1) {
                var message = 'Email or phone already taken.';
                if (user.email && user.email === value.email && user.phone === value.encrypted_phone) {
                    message = 'Email and phone already taken.';
                } else if (user.email && user.email === value.email) {
                    message = 'Email already taken.';
                } else if (user.phone === value.encrypted_phone) {
                    message = 'Phone already taken.';
                }
                _response_object.errors = [{ field: 'account', rules: [{ rule: 'unique', message: message }] }];
                return response.status(400).json(_response_object);
            }
            createUser(value);

        });

    }).catch(err => {
        _response_object.errors = err.inner;
        _response_object.count = err.inner.length;
        return response.status(400).json(err.inner);
    });
};