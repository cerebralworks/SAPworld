/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/* global _, UserProfiles, UserInformation, Users, sails */

module.exports = function create(request, response) {
    const post_request_data = request.body;
    const logged_in_user = request.user;
    var _response_object = {};
    pick_input = [
        'grade', 'max_grade', 'comments',
        'institution', 'degree', 'field',
        'start_year', 'end_year'
    ];
    var filtered_post_data = _.pick(post_request_data, pick_input);
    const filtered_post_keys = Object.keys(filtered_post_data);
    var current_date = new Date();
    var input_attributes = [
        {name: 'start_year', required: true, number: true, min: 1970, max: current_date.getFullYear()},
        {name: 'end_year', required: true, number: true},
        {name: 'institution', required: true, number: true, min: 1},
        {name: 'degree', required: true, number: true, min: 1},
        {name: 'field', required: true, number: true, min: 1}
    ];
    validateModel.validate(UserEducations, input_attributes, filtered_post_data, async function(valid, errors){
        if(valid){
            filtered_post_data.user = logged_in_user.user_profile.id;
            if(filtered_post_keys.includes('start_year')){
                filtered_post_data.start_year = parseInt(filtered_post_data.start_year);
            }
            if(filtered_post_keys.includes('end_year')){
                filtered_post_data.end_year = parseInt(filtered_post_data.end_year);
            }
            if(filtered_post_keys.includes('institution')){
                filtered_post_data.institution = parseInt(filtered_post_data.institution);
            }
            if(filtered_post_keys.includes('degree')){
                filtered_post_data.degree = parseInt(filtered_post_data.degree);
            }
            if(filtered_post_keys.includes('field')){
                filtered_post_data.field = parseInt(filtered_post_data.field);
            }
            //Creating record
            UserEducations.create(filtered_post_data, async function(err, education){
                if(err){
                    await errorBuilder.build(err, function (error_obj) {
                        _response_object.errors = error_obj;
                        _response_object.count = error_obj.length;
                        return response.status(500).json(_response_object);
                    });
                }else{
                    _response_object.message = 'Education details has been added to profile.';
                    _response_object.details = education;
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
