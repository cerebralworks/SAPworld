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
        'short_listed','meeting', 'events', 'user', 'job_posting', 'status','invite_url', 'invite_send', 'application_status', 'view', 'invite_status','apps','meeting_send'
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
    function sendResponse(details,job,profile,logged_in_user,filtered_post_data) {
		
		
		var postDetails = {};
		postDetails.name=job.title;
         if (_.get(details, 'short_listed')) {
			 if(!post_request_data.apps && details['status'] ==1){
			_response_object.message = 'Job application have been added to the short list successfully.';
			 }
			postDetails.message='Your profile is shortlisted for the position - /'+postDetails.name;
			postDetails.title='Application Shortlisted';
			if(details['status'] !=1){
				var application_status = details.application_status.filter(function(a,b) { return parseInt(a.id) == parseInt(details.status )});
				
				if(application_status.length!=0){
					if(details['status'] === 3){
						postDetails.message='Your interview is scheduled for the /'+job.title+'/ position';
						var commentsCheck1 = application_status[0]['comments'];
						var statusCheck = application_status[0]['status'].toLowerCase();
					if(commentsCheck1.length !=0 && commentsCheck1 !=' '){
						
						_response_object.message = 'Message sent successfully.';
					}else{
						
						_response_object.message = 'Job application status changed successfully.';
					}
					}else{
					var statusCheck = application_status[0]['status'].toLowerCase();
					//var commentsCheck = application_status[0]['comments'].toLowerCase().trim();
					var commentsCheck = application_status[0]['comments'];
					if(commentsCheck.length !=0 && commentsCheck !=' '){
						postDetails.message='Your application for the /'+job.title+'/ status is '+statusCheck + '  and got a new message';
						_response_object.message = 'Message sent successfully.';
					}else{
						postDetails.message='Your application for the /'+job.title+'/ status is changed to '+statusCheck;
						_response_object.message = 'Job application status changed successfully.';
					}
					}
					postDetails.title= "New schedule status";
					
					/*if(logged_in_user.meeting){
						postDetails.message='Your application for the /'+job.title+'/ got a meeting link for the  '+statusCheck +' status';
						postDetails.title='New Meeting Link';	
						_response_object.message = 'successfully send the meeting link to user ';
						//To send mail
						job['applicationId'] = details.id;
						job['username'] = profile.first_name+' '+profile.last_name;
						job['job_status'] = statusCheck;
						job['meeting_link'] = post_request_data.meeting_link;
						const mail_data = {
							template: 'jobpostings/invite',
							data:job ,
							to: profile.email,
							subject: 'An employer send an meeting link for the '+statusCheck
						};
						mailService.sendMail(mail_data);
					}*/
					if(post_request_data.meeting_send){
						
						postDetails.message='Your application for the /'+job.title+'/ got a meeting link for the  '+statusCheck +' status';
						postDetails.title='New Meeting Link';	
						_response_object.message = 'successfully send the meeting link to user ';
						 var idate = new Date(application_status[0]['interviewdate']).toDateString();
						var a = idate+' '+application_status[0]['interviewtime'];
						var itime1 = new Date(a).toLocaleTimeString([], {timeStyle: 'short'});
						var b = idate+' '+application_status[0]['interviewendtime'];
						var itime2 = new Date(b).toLocaleTimeString([], {timeStyle: 'short'});
						var zone=application_status[0]['zone'];
						//To send mail
						job['applicationId'] = details.id;
						job['username'] = profile.first_name+' '+profile.last_name;
						job['job_status'] = statusCheck;
						job['meeting_link'] = application_status[0]['link'];
						job['interview_date'] = idate;
						job['interview_time'] = itime1;
						job['interviewendtime'] = itime2;
						job['zone'] = zone;
						const mail_data = {
							template: 'jobpostings/invite',
							data:job ,
							to: profile.email,
							subject: 'An employer send an meeting link for the '+statusCheck
						};
						mailService.sendMail(mail_data);
					}
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
				postDetails.message='Your application for the /'+job.title+'/ got a invite link for the  '+statusCheck +' status';
				postDetails.title='New Invite Link';
				var meetTitle = 'An employer send an invite link to schedule interview';
				_response_object.message = 'Successfully send the invite link to user ';
				if(logged_in_user.meeting){
					postDetails.message='Your application for the /'+job.title+'/ got a meeting link for the  '+statusCheck +' status';
					postDetails.title='New Meeting Link';	
					meetTitle = 'An employer send an meeting link for the ' +statusCheck;
				_response_object.message = 'Successfully send the meeting link to user ';
				}
				//To send mail
                job['applicationId'] = details.id;
				job['username'] = profile.first_name+' '+profile.last_name;
				job['meeting_link'] = null;
				job['job_status'] = statusCheck;
				const mail_data = {
					template: 'jobpostings/invite',
					data:job ,
					to: profile.email,
					subject: meetTitle
				};
				mailService.sendMail(mail_data);
				
			}
			
		}
        _response_object['details'] = details;
		var check = {};
		check.account=profile.account;
		check.user_id=profile.id;
		check.job_id=job.id;
		check.employer=logged_in_user.employer_profile.id;
		check.message = postDetails.message;
		
		postDetails.account=profile.account;
		postDetails.user_id=profile.id;
		postDetails.job_id=job.id;
		postDetails.employer=logged_in_user.employer_profile.id;		
		postDetails.view=0;	
		 Notification.find(check).then(async(results) => {
			if(results[0]){
				data= {
					created_at:new Date(),
					status:1,
					view:0
				}
				await Notification.update({where:{id:results[0].id}},data).then();
			}else{
				await Notification.create(postDetails, function(err, job) {
					}); 
			}
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
			if(filtered_post_keys.includes('events')){
				filtered_post_data.events = filtered_post_data.events;
			}
			if(filtered_post_keys.includes('meeting')){
				logged_in_user['meeting'] = true;
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
									if(!val.views){
										val.views = false;
									}
								  return { 
									id: val.id,
									status: val.status,
									date: val.date,
									views: val.views,
									comments: val.comments,
									invited: val.invited,
									canceled: val.canceled,
									rescheduled: val.rescheduled,
									created: val.created,
									invite_url: '',
									name: val.name,
									link: val.link,
									interviewdate :val.interviewdate,
									interviewtime : val.interviewtime,
									interviewendtime : val.interviewendtime,
									zone :val.zone
								  }
								});
								filteredData.push(checkLastItem);
								filtered_post_data.application_status = filteredData;
							}
						}
						
						updateJobApplication(filtered_post_data, async function(job_application) {
							sendResponse(job_application,job,profile,logged_in_user,filtered_post_data);
						});
					} else {
						CreateJobApplication(filtered_post_data, async function(job_application) {
							sendResponse(job_application,job,profile,logged_in_user,filtered_post_data);
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