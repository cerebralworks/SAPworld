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
        'title', 'company', 'description', 'roles', 'location',
        'start_month', 'start_year', 'end_month', 'end_year', 'currently_working', 'industry', 'type'
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
        {name: 'industry', required: true, number: true,  min:1},
        {name: 'type', required: true, enum: true, values: [0, 1, 2, 3, 4, 5, 6, 7]}
    ];
    if(filtered_post_keys.includes('currently_working') && !filtered_post_data.currently_working){
        input_attributes.push({name: 'end_month', required: true, enum: true, values: [1,2,3,4,5,6,7,8,9,10,11,12]});
        input_attributes.push({name: 'end_year', required: true, number: true, min: 1970});
    }
    validateModel.validate(UserEmployments, input_attributes, filtered_post_data, async function(valid, errors){
        if(valid){
            filtered_post_data.user = logged_in_user.user_profile.id;
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
            if(filtered_post_keys.includes('industry')){
                filtered_post_data.industry = parseInt(filtered_post_data.industry);
            }
            if(filtered_post_keys.includes('type')){
                filtered_post_data.type = parseInt(filtered_post_data.type);
            }
            //Creating record
            UserEmployments.create(filtered_post_data, async function(err, employment){
                if(err){
                    await errorBuilder.build(err, function (error_obj) {
                        _response_object.errors = error_obj;
                        _response_object.count = error_obj.length;
                        return response.status(500).json(_response_object);
                    });
                }else{
                    _response_object.message = 'Employment details has been added to profile.';
                    _response_object.details = employment;
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
