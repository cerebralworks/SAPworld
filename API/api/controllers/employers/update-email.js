

/* global _, EmployerProfiles, Users, sails */

var squel = require("squel");
var bcrypt = require('bcryptjs');
var SALT_WORK_FACTOR = 10;
var crypto = require('crypto');

module.exports = function updateEmail(request, response) {
    const post_request_data = request.body;
    const logged_in_user = request.user;
    var _response_object = {};
    var filtered_post_data = _.pick(post_request_data,['current_password', 'email']);
    const filtered_post_keys = Object.keys(filtered_post_data);
    var input_attributes = [
        {name: 'current_password', required: true, min: 6},
        {name: 'email', email: true, required: true}
    ];
	//Validating the request and pass on the appriopriate response.
    validateModel.validate(Users, input_attributes, filtered_post_data, async function(valid, errors){
        if(valid){
          await loginService.findEmployerByEmail((post_request_data.email).toLowerCase(), async function(err, user){
              if(err){
                  await errorBuilder.build(err, function (error_obj) {
                      _response_object.errors = error_obj;
                      _response_object.count = error_obj.length;
                      return response.status(500).json(_response_object);
                  });
              }else if(user){
                  _response_object.errors = [{field: 'email', rules: [{rule:'unique', message: 'Email already taken.'}]}];
                  return response.status(400).json(_response_object);
              }else{
                  var query = squel.select({tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"'}).from(Users.tableName, Users.tableAlias);
                  query.where(Users.tableAlias + "." + Users.schema.id.columnName + "=" + logged_in_user.id);
                  query.field(Users.tableAlias + "." + Users.schema.id.columnName,'id');
                  query.field(Users.tableAlias + "." + Users.schema.password.columnName,'password');
                  //Executing query
                  var user_model = sails.sendNativeQuery(query.toString());
                  user_model.exec(async function(err, current_user){
                      if(err){
                          await errorBuilder.build(err, function (error_obj) {
                              _response_object.errors = error_obj;
                              _response_object.count = error_obj.length;
                              return response.status(500).json(_response_object);
                          });
                      }else{
                          bcrypt.compare(filtered_post_data.current_password, current_user.rows[0].password).then(function(password_check) {
                              if(!password_check){
                                  _response_object.errors = [{field: 'current_password', rules: [{rule:'invalid', message: 'Invalid current password.'}]}];
                                  _response_object.count = 1;
                                  return response.status(400).json(_response_object);
                              }else{
                                  EmployerProfiles.update({id: logged_in_user.employer_profile.id}, {email: (post_request_data.email).toLowerCase()}, async function(err, user){
                                      if(err){
                                          await errorBuilder.build(err, function (error_obj) {
                                              _response_object.errors = error_obj;
                                              _response_object.count = error_obj.length;
                                              return response.status(500).json(_response_object);
                                          });
                                      }else{
                                          Users.update({id: logged_in_user.id}, {username: (post_request_data.email).toLowerCase()}, async function(err, user){
                                              if(err){
                                                  await errorBuilder.build(err, function (error_obj) {
                                                      _response_object.errors = error_obj;
                                                      _response_object.count = error_obj.length;
                                                      return response.status(500).json(_response_object);
                                                  });
                                              }else{
                                                  _response_object.message = 'Email has been updated successfully.';
                                                  return response.status(200).json(_response_object);
                                              }
                                          });
                                      }
                                  });
                              }
                          });
                      }
                  });
              }
            });
        }else{
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });
};
