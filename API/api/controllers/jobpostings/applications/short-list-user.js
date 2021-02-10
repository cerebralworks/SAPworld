/**
 *
 * @author Saravanan Karthikeyan <saravanan@studioq.co.in>
 *
 */

/* global _, JobApplications, validateModel, sails */

module.exports = async function update(request, response) {
    const post_request_data = request.body;
    const request_query = request.allParams();
    let id;
    var _response_object = {};
    const logged_in_user = request.user;
    pick_input = [
        'short_listed', 'user', 'job_posting'
    ];
    var filtered_post_data = _.pick(_.merge(post_request_data, request_query), pick_input);
    const filtered_post_keys = Object.keys(filtered_post_data);
    var input_attributes = [
        { name: 'user', required: true, number: true, min: 1 },
        { name: 'job_posting', required: true, number: true, min: 1 },
        { name: 'short_listed', enum: true, values: [true, false], required: true }
    ];
    // Update the Job Application record to db.
    function CreateJobApplication(data, callback) {
        JobApplications.create(data, async function(err, job_application) {
            if (err) {
                await errorBuilder.build(err, function(error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            } else {
                return callback(job_application[0]);
            }
        });
    };


    // Update the Job Application record to db.
    function updateJobApplication(data, callback) {
        JobApplications.update({ user: data.user, job_posting: data.job_posting }, data, async function(err, job_application) {
            if (err) {
                await errorBuilder.build(err, function(error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            } else {
                return callback(job_application[0]);
            }
        });
    };

    // // Check whether the job application id is exits in db.
    // function isJobApplicationExist(data, successCallBack) {
    //     var job_application JobApplications.findOne({
    //             where: {
    //                 user_id: data.user_id,
    //                 job_id: data.job_id,
    //                 status: { '!=': _.get(sails.config.custom.status_codes, 'deleted') },
    //                 employer: _.get(logged_in_user, 'employer_profile.id')
    //             }
    //         },
    //         function(err, job_application) {
    //             if (!job_application) {
    //                 _response_object.message = 'No job found with the given id.';
    //                 return response.status(404).json(_response_object);
    //             } else {
    //                 successCallBack(job_application);
    //             }
    //         });
    // }

    // Build and send response.
    function sendResponse(details) {
        // if (_.get(details, 'short_listed')) {
        _response_object.message = 'Job application have been added to the short list successfully.';
        // } else {
        //     _response_object.message = 'Job application have been removed from the short list successfully.';
        // }
        _response_object['details'] = details;
        return response.ok(_response_object);
    };

    validateModel.validate(JobApplications, input_attributes, filtered_post_data, async function(valid, errors) {
        if (valid) {
            if (filtered_post_keys.includes('id')) {
                filtered_post_data.id = parseInt(filtered_post_data.id);
            }
            let id = _.get(filtered_post_data, 'id');
            var job_application = await JobApplications.findOne({
                where: {
                    user: filtered_post_data.user,
                    job_posting: filtered_post_data.job_posting,
                    status: { '!=': _.get(sails.config.custom.status_codes, 'deleted') },
                    employer: _.get(logged_in_user, 'employer_profile.id')
                }
            });
            filtered_post_data.employer = _.get(logged_in_user, 'employer_profile.id');
            if (job_application) {
                updateJobApplication(filtered_post_data, function(job_application) {
                    sendResponse(job_application);
                });
            } else {
                CreateJobApplication(filtered_post_data, function(job_application) {
                    sendResponse(job_application);
                });
            }
        } else {
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });
};