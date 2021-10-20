/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/* global _, UserProfiles, Users, sails */

var squel = require("squel");

module.exports = async function update(request, response) {
    const post_request_data = request.body;
    const logged_in_user = request.user;
    const request_query = request.allParams();
    const id = parseInt(request_query.id);
    var _response_object = {};
    pick_input = [
        'title', 'company', 'description', 'roles', 'location', 'view',
        'start_month', 'start_year', 'end_month', 'end_year', 'currently_working'
    ];
    var filtered_post_data = _.pick(post_request_data, pick_input);
    const filtered_post_keys = Object.keys(filtered_post_data);
    var current_date = new Date();
    var input_attributes = [
        {name: 'title', required: true},
        {name: 'company', required: true},
        {name: 'location', required: true},
        {name: 'start_month', required: true, enum: true, values: [1,2,3,4,5,6,7,8,9,10,11,12]},
        {name: 'start_year', required: true, number: true, min: 1970, max: current_date.getFullYear()},
        {name: 'currently_working', required: true, boolean: true},
        {name: 'view',  boolean: false},
    ];
    if(filtered_post_keys.includes('currently_working') && !filtered_post_data.currently_working){
        input_attributes.push({name: 'end_month', required: true, enum: true, values: [1,2,3,4,5,6,7,8,9,10,11,12]});
        input_attributes.push({name: 'end_year', required: true, number: true, min: 1970});
    }
    //Update the education record to db.
    const updateRecord = (post_data, callback) => {
        UserEducations.update(id, post_data, async function(err, education){
            if(err){
                await errorBuilder.build(err, function (error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            }else{
                return callback(education[0]);
            }
        });
    };
	//Validating the request and pass on the appriopriate response.
    validateModel.validate(UserEducations, input_attributes, filtered_post_data, async function(valid, errors){
          if(valid){
              let query = {id: id, user: logged_in_user.user_profile.id};
              UserEducations.findOne(query, async function(err, education){
                  if(!education){
                      _response_object.message = 'No education details found with the given id.';
                      return response.status(404).json(_response_object);
                  }else{
                      filtered_not_post_keys = _.difference(pick_input, filtered_post_keys);
                      filtered_not_post_keys.map(function(value){
                          filtered_post_data[value] = null;
                      });
                      if(filtered_post_keys.includes('start_month')){
                          filtered_post_data.start_month = parseInt(filtered_post_data.start_month);
                      }
                      if(filtered_post_keys.includes('start_year')){
                          filtered_post_data.start_year = parseInt(filtered_post_data.start_year);
                      }
                      if(filtered_post_keys.includes('end_month')){
                          filtered_post_data.end_month = parseInt(filtered_post_data.end_month);
                      }
                      if(filtered_post_keys.includes('end_year')){
                          filtered_post_data.end_year = parseInt(filtered_post_data.end_year);
                      }
                      await updateRecord(filtered_post_data, function (details) {
                          _response_object.message = 'Education details has been updated successfully.';
                          _response_object.details = details;
                          return response.status(200).json(_response_object);
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
