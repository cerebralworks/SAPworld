/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/* global _, UserProfiles, UserInformation, Users, sails */

module.exports = function update(request, response) {
    const post_request_data = request.body;
    const logged_in_user = request.user;
    var _response_object = {};
    var input_attributes = [
        {name: 'first_name', required: true},
        {name: 'bio', profanity: true},
        {name: 'about_info', profanity: true},
        {name: 'city', number: true},
        {name: 'work_experience', number: true},
        {name: 'expected_salary', number: true},
        {name: 'zip_code', number: true, min: 00501, max: 99950},
        {name: 'location', geopoint: true},
        {name: 'skill_tags', array: true},
        {name: 'location_miles', number: true, min: 1 , message: "Location miles should be greater than 0."},
        {name: 'preferred_job_type', enum: true, values: [0, 1, 2, 3, 4, 5, 6, 7]},
        {name: 'country_code', array:true}
    ];
    pick_input = [
        'first_name', 'last_name', 'bio', 'date_of_birth', 'about_info',
        'city', 'zip_code', 'location', 'location_text', 'skill_tags', 'location_miles',
        'preferred_job_type', 'certification', 'work_status', 'social_profiles', 'work_experience', 'expected_salary', 'country_code'
    ];
    //Check only admin not user
    if(_.indexOf(_.get(logged_in_user, 'types', []),2) > -1 && _.indexOf(_.get(logged_in_user, 'types', []),0) < 0){
        input_attributes.push({name: 'id', required: true, number: true, min: 1});
        pick_input.push('id');
    }
    else if(_.indexOf(_.get(logged_in_user, 'types', []),2) > -1){
        input_attributes.push({name: 'id', number: true, min: 1});
        pick_input.push('id');
    }
    
    var filtered_post_data = _.pick(post_request_data, pick_input);
    const filtered_post_keys = Object.keys(filtered_post_data);
    validateModel.validate(UserProfiles, input_attributes, filtered_post_data, async function(valid, errors){
        if(valid){
            filtered_not_post_keys = _.difference(pick_input, filtered_post_keys);
            filtered_not_post_keys.map(function(value){
                filtered_post_data[value] = null;
            });
            if(filtered_post_keys.includes('id')){
                filtered_post_data.id = parseInt(filtered_post_data.id);
            }
            if(filtered_post_keys.includes('location')){
                location = filtered_post_data.location.split(',')
                filtered_post_data.location = '(' + location[0] + ',' + location[1] + ')';
            }
            if(filtered_post_keys.includes('zip_code')){
                filtered_post_data.zip_code = parseInt(filtered_post_data.zip_code);
            }
            if(filtered_post_keys.includes('city')){
                filtered_post_data.city = parseInt(filtered_post_data.city);
            }
            if(filtered_post_keys.includes('location_miles')){
                filtered_post_data.location_miles = parseInt(filtered_post_data.location_miles);
            }
            if(filtered_post_keys.includes('preferred_job_type')){
                filtered_post_data.preferred_job_type = parseInt(filtered_post_data.preferred_job_type);
            }
            if(filtered_post_keys.includes('work_experience')){
                filtered_post_data.work_experience = parseInt(filtered_post_data.work_experience);
            }
            if(filtered_post_keys.includes('expected_salary')){
                filtered_post_data.expected_salary = parseInt(filtered_post_data.expected_salary);
            }
            var id = filtered_post_keys.includes('id') ? filtered_post_data.id : logged_in_user.user_profile.id;
            UserProfiles.update(id, filtered_post_data, async function(err, profile){
                if(err){
                    await errorBuilder.build(err, function (error_obj) {
                        _response_object.errors = error_obj;
                        _response_object.count = error_obj.length;
                        return response.status(500).json(_response_object);
                    });
                }else{
                    if(profile[0].email){
                        delete profile[0].email;
                    }
                    if(profile[0].phone){
                        delete profile[0].phone;
                    }
                    _response_object.message = 'Profile has been updated successfully.';
                    _response_object.details = profile;
                    return response.status(200).json(_response_object);
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
