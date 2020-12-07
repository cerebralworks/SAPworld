/**
 *
 * @author Saravanan Karthikeyan <saravanan@studioq.co.in>
 *
 */

/* global _, JobPostings, sails */

module.exports = function create(request, response) {
    const post_request_data = request.body;
    const request_query = request.allParams();
    const logged_in_user = request.user;
    const id = parseInt(request_query.id);
    var _response_object = {};
    pick_input = [
        'title',
        'type',
        'description',
        'salary_type',
        'salary_currency',
        'salary',
        'city',
        'state',
        'country',
        'zipcode',
        'availability',
        'remote',
        'experience',
        'sap_experience',
        'domain',
        'hands_on_experience',
        'skills',
        'programming_skills',
        'optinal_skills',
        'certification',
        'work_authorization',
        'travel_opportunity',
        'visa_sponsorship',
        'end_to_end_implementation',
        'company',
        'latlng',
        'must_match',
        'number_of_positions',
        'extra_criteria',
        'contract_duration'
    ];
    var filtered_post_data = _.pick(post_request_data, pick_input);
    const filtered_post_keys = Object.keys(filtered_post_data);
    var input_attributes = [
        { name: 'title', required: true },
        { name: 'type', enum: true, values: [0, 1, 2, 3, 4, 5, 6, 7] },
        { name: 'description', string: true, required: true },
        { name: 'salary_type', required: true, enum: true, values: [0, 1] },
        { name: 'salary_currency', required: true, enum: true, values: [0, 1, 2] },
        { name: 'salary', required: true, number: true, min: 1 },
        { name: 'city', required: true },
        { name: 'state', required: true },
        { name: 'country', required: true },
        { name: 'zipcode', required: true, number: true },
        { name: 'availability', required: true },
        { name: 'remote', required: true, boolean: true },
        { name: 'experience', required: true, number: true },
        { name: 'sap_experience', required: true, number: true },
        { name: 'latlng', required: true, string: true },
        { name: 'domain', required: true, array: true },
        { name: 'hands_on_experience', required: false, array: true },
        { name: 'skills', required: true, array: true },
        { name: 'programming_skills', array: true },
        { name: 'optinal_skills', array: true },
        { name: 'certification', array: true },
        { name: 'work_authorization', required: true, number: true },
        { name: 'visa_sponsorship', required: true, boolean: true },
        { name: 'end_to_end_implementation', required: true, number: true },
        { name: 'company', required: true, number: true, min: true },
        { name: 'must_match', required: true, json: true },
        { name: 'extra_criteria', required: false, array: true },
        { name: 'number_of_positions', required: true, number: true },
        { name: 'contract_duration', number: true },

    ];
    //Update the JobPostings record to db.
    const updateRecord = (post_data, callback) => {
        JobPostings.update(id, post_data, async function(err, job) {
            if (err) {
                await errorBuilder.build(err, function(error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            } else {
                return callback(job[0]);
            }
        });
    };
    //Find the JobPostings record to db.
    const findPosting = (callback) => {
        let query = { id: id, company: logged_in_user.employer_profile.id };
        JobPostings.findOne(query, async function(err, job) {
            if (job) {
                return callback(job);
            } else {
                _response_object.message = 'No posting details found with the given id.';
                return response.status(404).json(_response_object);
            }
        });
    };
    validateModel.validate(JobPostings, input_attributes, filtered_post_data, async function(valid, errors) {
        if (valid) {
            if (filtered_post_keys.includes('latlng')) {
                location = filtered_post_data.latlng.split(',')
                if (location.length == 2) {
                    filtered_post_data.latlng = 'SRID=4326;POINT(' + location[1] + ' ' + location[0] + ')';
                }
            }
            await findPosting(function(job) {
                updateRecord(filtered_post_data, function(updated_job) {
                    _response_object.message = 'Job has been update successfully.';
                    _response_object.details = job;
                    return response.status(200).json(_response_object);
                });
            });
        } else {
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });
};