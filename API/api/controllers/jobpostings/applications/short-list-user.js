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
        'id', 'short_listed'
    ];
    var filtered_post_data = _.pick(_.merge(post_request_data, request_query), pick_input);
    const filtered_post_keys = Object.keys(filtered_post_data);
    var input_attributes = [
        {name: 'id', required:true, number: true, min:1},
        {name: 'short_listed', enum: true, values: [true, false], required: true}
    ];

    // Update the Job Application record to db.
    function updateJobApplication(id, data, callback){
        JobApplications.update(id, data, async function(err, job_application){
            if(err){
                await errorBuilder.build(err, function (error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            }else{
                return callback(job_application[0]);
            }
        });
    };

    // Check whether the job application id is exits in db.
    function isJobApplicationExist(id, successCallBack){
        JobApplications.findOne({where:{
            id: id,
            status : { '!=' : _.get(sails.config.custom.status_codes, 'deleted') } ,
            employer: _.get(logged_in_user, 'employer_profile.id')
            }},
            function(err, job_application){
                if(!job_application){
                    _response_object.message = 'No job found with the given id.';
                    return response.status(404).json(_response_object);
                }else{
                    successCallBack(job_application);
                }
            });
    }

    // Build and send response.
    function sendResponse(details){
        if(_.get(details, 'short_listed')){
            _response_object.message = 'Job application have been added to the short list successfully.';
        }else{
            _response_object.message = 'Job application have been removed from the short list successfully.';
        }
        _response_object['details'] = details;
        return response.ok(_response_object);
    };

    validateModel.validate(JobApplications, input_attributes, filtered_post_data, async function(valid, errors){
        if(valid){
            if(filtered_post_keys.includes('id')){
                filtered_post_data.id = parseInt(filtered_post_data.id);
            }
            let id = _.get(filtered_post_data, 'id');
            isJobApplicationExist(id, function(){
                updateJobApplication(id, _.omit(filtered_post_data, ['id']), function (job_application) {
                    sendResponse(job_application);
                });
            });
        }else{
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });
};
