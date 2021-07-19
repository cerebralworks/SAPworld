/**
 *
 * @author Saravanan Karthikeyan <saravanan@studioq.co.in>
 *
 */

/* global _, JobPostings, validateModel, sails */

module.exports = async function update(request, response) {
    const post_request_data = request.body;
    const request_query = request.allParams();
    let id;
    var _response_object = {};
    const logged_in_user = request.user;
    var input_attributes = [
        {name: 'id', required:true, number: true, min:1},
        {name: 'status', enum: true, values: _.values(_.pick(sails.config.custom.status_codes,['inactive', 'active'] )), required: true},
        {name: 'status_glossary', required: true}
    ];
    pick_input = [
        'id', 'status', 'status_glossary'
    ];
    if(!(_.indexOf(_.get(logged_in_user, 'types'), _.get(sails, 'config.custom.access_role.employer')) > -1)){
        input_attributes.push({name: 'employer', required: true, number: true, min: 1});
        pick_input.push('employer');
    }
    var filtered_post_data = _.pick(_.merge(post_request_data, request_query), pick_input);
    const filtered_post_keys = Object.keys(filtered_post_data);

    // Update the Job Posting record to db.
    function updateJobPosting(id, data, callback){
        JobPostings.update(id, data, async function(err, job_posting){
            if(err){
                await errorBuilder.build(err, function (error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            }else{
                return callback(job_posting[0]);
            }
        });
    };

    // Check whether the job posting id is exits in db.
    function isJobPostingExist(id, attributes={}, successCallBack){
        JobPostings.findOne(_.merge({
            id: id,
            status : { '!=' : _.get(sails.config.custom.status_codes, 'deleted') } ,
            company: _.get(logged_in_user, 'employer_profile.id')
            }, attributes),
            function(err, job_posting){
                if(!job_posting){
                    _response_object.message = 'No job found with the given id.';
                    return response.status(404).json(_response_object);
                }else{
                    successCallBack(job_posting);
                }
            });
    }

    // Build and send response.
    function sendResponse(details){
        if(parseInt(details.status) === 1){
            _response_object.message = 'Job has been activated successfully.';
        }else{
            _response_object.message = 'Job has been deactivated successfully.';
        }
        _response_object['details'] = {id: details.id, status: details.status};
        return response.ok(_response_object);
    };
	//Validating the request and pass on the appriopriate response.
    validateModel.validate(JobPostings, input_attributes, filtered_post_data, async function(valid, errors){
        if(valid){
            if(filtered_post_keys.includes('id')){
                filtered_post_data.id = parseInt(filtered_post_data.id);
            }
            if(filtered_post_keys.includes('status')){
                filtered_post_data.status = parseInt(filtered_post_data.status);
            }
            let id = _.get(filtered_post_data, 'id');
            isJobPostingExist(id,_.pick(filtered_post_data, ['employer']), function(){
                updateJobPosting(id, _.omit(filtered_post_data, ['id', 'employer']), function (job_posting) {
                    sendResponse(job_posting);
                });
            });
        }else{
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });
};
