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
        {name: 'location_id', number: true, min:1},
        {name: 'status', enum: true, values: _.values(_.pick(sails.config.custom.status_codes,['inactive', 'active', 'paused'] )), required: true},
        {name: 'status_glossary', required: true}
    ];
    pick_input = [
        'id','location_id', 'status', 'status_glossary','emp_id'
    ];
	var log_user={};
    /*if(!(_.indexOf(_.get(logged_in_user, 'types'), _.get(sails, 'config.custom.access_role.employer')) > -1)){
        input_attributes.push({name: 'employer', required: true, number: true, min: 1});
        pick_input.push('employer');
    }*/
	
   var filtered_post_data = _.pick(_.merge(post_request_data, request_query), pick_input);
    const filtered_post_keys = Object.keys(filtered_post_data);
	filtered_post_data.logged_in_user=logged_in_user;
	if(post_request_data.emp_id !=undefined){
			await Users.find({employer_profile:post_request_data.emp_id}).then(data=>{
				 log_user.company = post_request_data.emp_id;
		         log_user.account = data[0].id;
				})
			}else{
			log_user.company = logged_in_user.employer_profile.id;
			log_user.account = logged_in_user.id;
			}
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
				/* var tempDetails = {
					'id':job_posting[0]['jobid']
				};
				var details = await JobPostings.find(tempDetails);
				details =details[0];
				details['status']=job_posting[0]['status']; */
                return callback(job_posting[0]);
            }
        });
    };

    // Check whether the job posting id is exits in db.
    function isJobPostingExist(id, attributes={}, successCallBack){
        JobPostings.findOne(_.merge({
            id: id,
            status : { '!=' : _.get(sails.config.custom.status_codes, 'deleted') } 
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
    function sendResponse(details,filtered_post_data){
		var postDetailss = {};
		postDetailss.name=details.title;
        if(parseInt(details.status) === 1){
            _response_object.message = 'Job has been activated successfully.';
			postDetailss.message=postDetailss.name+' is Open ';
			postDetailss.title=postDetailss.name+' is Open ';
        }else if(parseInt(details.status) === 98){
            _response_object.message = 'Job has been paused successfully.';
			postDetailss.message=postDetailss.name+' is Paused ';
			postDetailss.title=postDetailss.name+' is Paused ';
        }else{
            _response_object.message = 'Job has been deactivated successfully.';
			postDetailss.message=postDetailss.name+' is closed ';
			postDetailss.title=postDetailss.name+' is closed ';
        }
        _response_object['details'] = {id: details.id, status: details.status};
		
		postDetailss.account=log_user.account;
		postDetailss.job_id=details.id;
		postDetailss.employer=log_user.company;		
		postDetailss.view=0;	
		
		Notification.create(postDetailss, function(err, job) {
			
		}); 
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
            let location_id = _.get(filtered_post_data, 'location_id');
            isJobPostingExist(id,_.pick(filtered_post_data, ['employer']),async function(){
                updateJobPosting(id, _.omit(filtered_post_data, ['id', 'employer']),async function (job_posting) {
                    sendResponse(job_posting,filtered_post_data);
                });
            });
        }else{
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });
};
