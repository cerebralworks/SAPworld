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
        'short_listed', 'user', 'job_posting', 'status','invite_url', 'invite_send', 'application_status', 'view', 'invite_status'
    ];
    var filtered_post_data = _.pick(_.merge(post_request_data, request_query), pick_input);
    const filtered_post_keys = Object.keys(filtered_post_data);
    var input_attributes = [
        { name: 'user', required: true, number: true, min: 1 },
        { name: 'status', number: true, min: 1 },
        { name: 'job_posting', required: true, number: true, min: 1 },
        { name: 'short_listed', enum: true, values: [true, false], required: true },
        { name: 'view', enum: false, values: [true, false] },
        { name: 'invite_send', enum: false, values: [true, false] }
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

    // Build and send response.
    function sendResponse(details,job,profile,logged_in_user) {
		
		
		var postDetails = {};
		postDetails.name=job.title;
         if (_.get(details, 'short_listed')) {
			_response_object.message = 'Job application have been added to the short list successfully.';
			postDetails.message='Your profile is shortlisted for interview ( '+postDetails.name+' )';
			postDetails.title='Application Shortlisted';
			if(details['status'] !=1){
				var application_status = details.application_status.filter(function(a,b) { return parseInt(a.id) == parseInt(details.status )});
				if(application_status.length!=0){
					var statusCheck = application_status[0]['status'].toLowerCase();
					var commentsCheck = application_status[0]['comments'].toLowerCase().trim();
					if(commentsCheck.length !=0){
						postDetails.message='Your application for the '+job.title+' status is '+statusCheck + '  and got a new meesage';
					}else{
						postDetails.message='Your application for the '+job.title+' status is changed to '+statusCheck;
					}
					postDetails.title= statusCheck;
				}

			}
			
		} else if(_.get(details, 'short_listed')==false) {
            _response_object.message = 'Job application is Not fit for this job.';
			postDetails.message='Your application for the '+job.title+' was not successful ';
			postDetails.title='Application Not fit for this job';
		}
		if(logged_in_user.invite_send == true){
			var application_status = details.application_status.filter(function(a,b) { return parseInt(a.id) == parseInt(details.status )});
			if(application_status.length!=0){
				var statusCheck = application_status[0]['status'].toLowerCase();
				var commentsCheck = application_status[0]['comments'].toLowerCase().trim();
				postDetails.message='Your application for the '+job.title+' got a invite link for the  '+statusCheck +' status';
				postDetails.title='New Invite Link ';
			}
		}
        _response_object['details'] = details;
		
		postDetails.account=profile.account;
		postDetails.user_id=profile.id;
		postDetails.job_id=job.id;
		postDetails.employer=logged_in_user.employer_profile.id;		
		postDetails.view=0;		
		Notification.create(postDetails, function(err, job) {
			
		}); 
		
        return response.ok(_response_object);
    };
	//Validating the request and pass on the appriopriate response.
    validateModel.validate(JobApplications, input_attributes, filtered_post_data, async function(valid, errors) {
        if (valid) {			
			if (filtered_post_keys.includes('id')) {
				filtered_post_data.id = parseInt(filtered_post_data.id);
			}
			if (filtered_post_keys.includes('status')) {
				filtered_post_data.status = parseInt(filtered_post_data.status);
			}
			let id = _.get(filtered_post_data, 'id');
			var job_application = await JobApplications.findOne({
				where: {
					user: filtered_post_data.user,
					job_posting: filtered_post_data.job_posting,
					status: { '!=': _.get(sails.config.custom.status_codes_application, 'closed') },
					employer: _.get(logged_in_user, 'employer_profile.id')
				}
			});
			if (filtered_post_keys.includes('invite_send')) {
			logged_in_user['invite_send'] = filtered_post_data.invite_send;
			}else{
				logged_in_user['invite_send'] = false;
			}
			await JobPostings.findOne(filtered_post_data.job_posting, async function(err, job) {
				await UserProfiles.findOne(filtered_post_data.user, async function(err, profile) {
					filtered_post_data.employer = _.get(logged_in_user, 'employer_profile.id');
					if (job_application) {
						var checkLastItem = filtered_post_data.application_status[filtered_post_data.application_status.length-1];
						var checkLastItemServer = job_application.application_status;
						if(job_application.application_status){
							checkLastItemServer = job_application.application_status[job_application.application_status.length-1].id;
						}
						
						
						if(checkLastItem.id === checkLastItemServer || !job_application.application_status || job_application.application_status.length ==0 ){

						}else{
							var sliceCheck =job_application.application_status;
							if(sliceCheck){
								var filteredData =sliceCheck.map((val) => {
								  return { 
									id: val.id,
									status: val.status,
									date: val.date,
									comments: val.comments,
									invited: val.invited,
									canceled: val.canceled,
									rescheduled: val.rescheduled,
									created: val.created,
									invite_url: ''
								  }
								});
								filteredData.push(checkLastItem);
								filtered_post_data.application_status = filteredData;
							}
						}
						
						updateJobApplication(filtered_post_data, async function(job_application) {
							sendResponse(job_application,job,profile,logged_in_user);
						});
					} else {
						CreateJobApplication(filtered_post_data, async function(job_application) {
							sendResponse(job_application,job,profile,logged_in_user);
						});
					}
				});
			});
        } else {
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });
};