/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/* global _, UserProfiles, UserInformation, Users, sails */

var squel = require("squel");

module.exports = function signup(request, response) {
    try{
        const post_request_data = request.body;
        var _response_object = {};
        var filtered_post_data = _.pick(post_request_data,['type', 'token']);
        const filtered_post_keys = Object.keys(filtered_post_data);
        const client = request.user;
        var input_attributes = [
            {name: 'type', enum: true, values: ['google', 'facebook', 'linkedin']},
            {name: 'token', required: true}
        ];
        const findExistingSocialUser = async function(type, id, callback) {
            var query = squel.select({tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"'}).from(Users.tableName, Users.tableAlias);
            query.left_join(UserProfiles.tableName, UserProfiles.tableAlias, UserProfiles.tableAlias + '.' + UserProfiles.schema.account.columnName + "=" + Users.tableAlias + '.' + Users.schema.id.columnName);
            query.where(UserProfiles.tableAlias + "." + UserProfiles.schema[type + "_id"].columnName + "='" + id + "'");
            query.field(Users.tableAlias + "." + Users.schema.id.columnName,'id');
            query.field(Users.tableAlias + "." + Users.schema.types.columnName,'types');
            query.field(Users.tableAlias + "." + Users.schema.username.columnName,'username');
            query.field(Users.tableAlias + "." + Users.schema.status.columnName,'status');
            query.field(Users.tableAlias + "." + Users.schema.status_glossary.columnName,'status_glossary');
            query.field(Users.tableAlias + "." + Users.schema.verified.columnName,'verified');
            query.field(Users.tableAlias + "." + Users.schema.last_active.columnName,'last_active');
            query.field(Users.tableAlias + "." + Users.schema.user_profile.columnName,'user_profile');
            query.field(Users.tableAlias + "." + Users.schema.employer_profile.columnName,'employer_profile');
            query.field(Users.tableAlias + "." + Users.schema.admin_profile.columnName,'admin_profile');
            query.field(Users.tableAlias + "." + Users.schema.created_at.columnName,'created_at');
            query.field(Users.tableAlias + "." + Users.schema.updated_at.columnName,'updated_at');
            query.field(UserProfiles.tableAlias + "." + UserProfiles.schema.phone.columnName,'phone');
            query.field(UserProfiles.tableAlias + "." + UserProfiles.schema.email.columnName,'email');
            //Executing query
            var user_model = sails.sendNativeQuery(query.toString());
            user_model.exec(async function(err, user){
                if(err){
                    var error_obj = new Error();
                    if(err.message){
                        error_obj.message = err.message;
                    }else{
                        error_obj.message = 'Something went wrong.';
                    }
                    return callback(error_obj);
                }else if(user && user.rowCount >0){
                    return callback(err, user['rows'][0]);
                }else{
                    return callback(err, null);
                }
            });
        };
        //Create a new profile.
        const createUser = (post_data, callback) => {
            const type = filtered_post_data.type;
            var user_input = {
                types: [0],
                last_active: new Date(),
                last_checkin_via: type
            };
            user_input.username = type + '_' + post_data.id;
            user_input.password = Math.floor(10000000 + Math.random() * 90000000);
            Users.create(user_input, async function(err, user){
                if(err){
                    await errorBuilder.build(err, function (error_obj) {
                        _response_object.errors = error_obj;
                        _response_object.count = error_obj.length;
                        return response.status(500).json(_response_object);
                    });
                }else{
                    profile_input = {
                        first_name: post_data.first_name,
                        account: parseInt(user.id)
                    }
                    profile_input[type + '_id'] = post_data.id;
                    profile_input[type + '_data'] = post_data;
                    if(post_data.email){
                        profile_input.email = post_data.email.toLowerCase();
                    }
                    if(post_data.phone){
                        profile_input.phone = post_data.encrypted_phone;
                    }
                    if(post_data.last_name){
                        profile_input.last_name = post_data.last_name;
                    }
                    UserProfiles.create(profile_input, async function(err, profile){
                        if(err){
                            await errorBuilder.build(err, function (error_obj) {
                                _response_object.errors = error_obj;
                                _response_object.count = error_obj.length;
                                return response.status(500).json(_response_object);
                            });
                        }else{
                            generateToken(user);
                        }
                    });
                }
            });
        };
        //Add to the existing profile.
        const assignUser = (user_data, post_data, callback) => {
            const type = filtered_post_data.type;
            user_data.types.push(0);
            var user_input = {
                types: user_data.types,
                last_active: new Date(),
                last_checkin_via: type
            };
            Users.update(parseInt(user_data.id), user_input, async function(err, user){
                if(err){
                    await errorBuilder.build(err, function (error_obj) {
                        _response_object.errors = error_obj;
                        _response_object.count = error_obj.length;
                        return response.status(500).json(_response_object);
                    });
                }else{
                    profile_input = {
                        first_name: post_data.first_name,
                        account: parseInt(user_data.id)
                    }
                    profile_input[type + '_id'] = post_data.id;
                    profile_input[type + '_data'] = post_data;
                    if(post_data.email){
                        profile_input.email = post_data.email.toLowerCase();
                    }
                    if(post_data.phone){
                        profile_input.phone = post_data.encrypted_phone;
                    }
                    if(post_data.last_name){
                        profile_input.last_name = post_data.last_name;
                    }
                    UserProfiles.create(profile_input, async function(err, profile){
                        if(err){
                            await errorBuilder.build(err, function (error_obj) {
                                _response_object.errors = error_obj;
                                _response_object.count = error_obj.length;
                                return response.status(500).json(_response_object);
                            });
                        }else{
                            generateToken(user[0]);
                        }
                    });
                }
            });
        };
        const updateUser = (user_data, post_data, callback) => {
            const type = filtered_post_data.type;
            var profile_input = {};
            profile_input[type + '_id'] = post_data.id;
            profile_input[type + '_data'] = post_data;
            UserProfiles.update({account: parseInt(user_data.id)}, profile_input, async function(err, user){
                if(err){
                    await errorBuilder.build(err, function (error_obj) {
                        _response_object.errors = error_obj;
                        _response_object.count = error_obj.length;
                        return response.status(500).json(_response_object);
                    });
                }else{
                    Users.update({id: parseInt(user_data.id)}, {last_active: new Date(), last_checkin_via: type}, function (err, updated_user) {
                        generateToken(user_data);
                    });
                }
            });
        };
        //Initialte signup procedure.
        const signup = async (post_data, callback) => {
            const type = filtered_post_data.type;
            await findExistingSocialUser(type, post_data.id, async function(err, user){
                if(err){
                    await errorBuilder.build(err, function (error_obj) {
                        _response_object.errors = error_obj;
                        _response_object.count = error_obj.length;
                        return response.status(500).json(_response_object);
                    });
                }else if(user){
                    updateUser(user, post_data);
                }else{
                    let email = post_data.email ? post_data.email : null;
                    let phone = null;
                    if(post_data.phone){
                        phone = post_data.phone;
                        await phoneEncryptor.encrypt(filtered_post_data.phone, function(encrypted_text){
                            post_data.encrypted_phone = encrypted_text;
                        });
                    }
                    if(_.isNull(email) && _.isNull(phone)){
                        createUser(post_data);
                    }else{
                        await loginService.findExistingConnection(0, email, phone, async function(err, user){
                            if(err){
                                await errorBuilder.build(err, function (error_obj) {
                                    _response_object.errors = error_obj;
                                    _response_object.count = error_obj.length;
                                    return response.status(500).json(_response_object);
                                });
                            }else if(user && _.indexOf(user.types,0) > -1){
                                updateUser(user, post_data);
                            }else if(user){
                                assignUser(user, post_data);
                            }else{
                                createUser(post_data);
                            }
                        });
                    }
                }
            });
        };
        //Initialte signup procedure.
        const generateToken = async (user, callback) => {
            RefreshTokens.create({user_id: user.id, client_id: client.client_id}, function (err, refresh_token) {
                if(err){
                    _response_object.message = 'Something wrong in generating refresh_token.';
                    return response.status(500).json(_response_object);
                }else{
                    AccessTokens.create({user_id: user.id, client_id: client.client_id}, function (err, access_token) {
                        if(err){
                            _response_object.message = 'Something wrong in generating access_token.';
                            return response.status(500).json(_response_object);
                        }else{
                            _response_object.access_token = access_token.token;
                            _response_object.refresh_token = refresh_token.token;
                            _response_object.expires_in = sails.config.oauth.tokenLife;
                            _response_object.types = user.types;
                            _response_object.token_type = "Bearer";
                            return response.status(200).json(_response_object);
                        }
                    });
                }
            });
        };
        validateModel.validate(UserProfiles, input_attributes, filtered_post_data, async function(valid, errors){
            if(valid){
                const type = filtered_post_data.type;
                const token = filtered_post_data.token;
                if(type === 'google'){
                    const { OAuth2Client } = require('google-auth-library');
                    var google_client = new OAuth2Client(sails.config.conf.google_client_id, '', '');
                    google_client.verifyIdToken({ idToken: token }, function (google_error, login) {
                        if(google_error){
                            _response_object.message = google_error.toString();
                            return response.status(401).json(_response_object);
                        }else{
                            var data = login.getPayload();
                            if(data.email_verified){
                                var content = {
                                    id: data.sub,
                                    first_name: data.given_name
                                };
                                if(data.family_name){
                                    content.last_name = data.family_name;
                                }
                                if(data.email){
                                    content.email = data.email;
                                }
                                if(data.picture){
                                    content.photo = data.picture;
                                }
                                signup(content);
                            }else{
                                _response_object.message = 'Email not verified with google.';
                                return response.status(400).json(_response_object);;
                            }
                        }
                    });
                }else if(type === 'facebook'){
                    var FB = require('fb');
                    FB.api('me', {fields: ['id', 'email', 'first_name', 'last_name', 'picture.width(800).height(800)'], access_token: token}, function (facebook_response) {
                        if (facebook_response.error) {
                            _response_object.message = facebook_response.error.message;
                            return res.status(401).json(_response_object);
                        }else{
                            let data = facebook_response;
                            var content = {
                                id: data.id,
                                first_name: data.first_name
                            };
                            if(data.last_name){
                                content.last_name = data.last_name;
                            }
                            if(data.email){
                                content.email = data.email;
                            }
                            if(data.picture && data.picture.data){
                                content.photo = data.picture.data.url;
                            }
                            signup(content);
                        }
                    });
                }else if(type === 'linkedin'){
                    const https = require('https')
                    const options = {
                      hostname: 'api.linkedin.com',
                      path: '/v2/me?oauth2_access_token=' + token + '&projection=(id,localizedFirstName,localizedLastName,emailAddress,profilePicture(displayImage~:playableStreams))',
                      method: 'GET'
                    }
                    var req = https.request(options, function (res){
                        var data = '';
                        res.on('data', function(chunk){
                            data += chunk;
                        });
                        res.on('end', async function(){
                            data = JSON.parse(data);
                            if(res.statusCode !== 200){
                                if(data.message){
                                  _response_object.message = data.message;
                                }else{
                                    _response_object.message = 'Something went wrong.';
                                }
                                return response.status(res.statusCode).json(_response_object);
                            }
                            var content = {
                                id: data.id,
                                first_name: data.localizedFirstName
                            };
                            if(data.localizedLastName){
                                content.last_name = data.localizedLastName;
                            }
                            if(data.emailAddress){
                                content.email = data.emailAddress;
                            }
                            let photo = _.last(data.profilePicture['displayImage~'].elements);
                            if(photo && photo.identifiers[0]){
                                content.photo = photo.identifiers[0].identifier;
                            }
                            signup(content);
                        });
                    });
                    req.on('error', function(error){
                        _response_object.message = 'Something went wrong.';
                        return response.status(500).json(_response_object);
                    });
                    req.end();
                }
            }
            else{
                _response_object.errors = errors;
                _response_object.count = errors.length;
                return response.status(400).json(_response_object);
            }
        });
    }catch(err){
        _response_object.message = 'Something went wrong.';
        return response.status(500).json(_response_object);
    }
};
