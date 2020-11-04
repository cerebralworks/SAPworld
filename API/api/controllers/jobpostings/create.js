/**
 *
 * @author Saravanan Karthikeyan <saravanan@studioq.co.in>
 *
 */

/* global _, JobPostings, sails */

module.exports = function create(request, response) {
    const post_request_data = request.body;
    const logged_in_user = request.user;
    var _response_object = {};
    pick_input = [
        'title', 'type', 'min_salary', 'max_salary', 'min_experience', 'max_experience',
        'company', 'email', 'phone_numbers', 'company_bio', 'company_website',
        'location', 'location_text', 'zip_code', 'city',
        'responsibilities', 'company_established', 'company_employees', 'company_branches',
        'skill_requirements', 'skill_tags', 'category', 'company_social_profiles'
    ];
    var filtered_post_data = _.pick(post_request_data, pick_input);
    const filtered_post_keys = Object.keys(filtered_post_data);
    var input_attributes = [
        {name: 'title', required: true},
        {name: 'type', enum: true, values: [0, 1, 2, 3, 4, 5, 6, 7]},
        {name: 'min_salary', required: true, number: true, min: 1},
        {name: 'max_salary', required: true, number: true, min: 1},
        {name: 'min_experience', required: true, number: true, min: 1},
        {name: 'max_experience', required: true, number: true, min: 1},
        {name: 'company', required: true},
        {name: 'email', email: true},
        {name: 'phone_numbers', array: true, individual_rule: {phone: true}},
        {name: 'location', required: true, geopoint: true},
        {name: 'location_text', required: true},
        {name: 'zip_code', required: false, number: true},
        {name: 'responsibilities', required: true},
        {name: 'company_established', number: true},
        {name: 'company_employees', number: true},
        {name: 'company_branches', number: true},
        {name: 'skill_requirements', required: true, array: true},
        {name: 'skill_tags', required: true, array: true, individual_rule: {number: true, min:1}},
        {name: 'city', required: true, number: true, min: true},
        {name: 'category', required: true, number: true, min: true}
    ];
    validateModel.validate(JobPostings, input_attributes, filtered_post_data, async function(valid, errors){
        if(valid){
            filtered_post_data.employer = logged_in_user.employer_profile.id;
            if(filtered_post_keys.includes('location')){
                location = filtered_post_data.location.split(',')
                filtered_post_data.location = '(' + location[0] + ',' + location[1] + ')';
            }
            //Creating record
            JobPostings.create(filtered_post_data, async function(err, job){
                if(err){
                    await errorBuilder.build(err, function (error_obj) {
                        _response_object.errors = error_obj;
                        _response_object.count = error_obj.length;
                        return response.status(500).json(_response_object);
                    });
                }else{
                    _response_object.message = 'Job has been created successfully.';
                    _response_object.details = job;
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
