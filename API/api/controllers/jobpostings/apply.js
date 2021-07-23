/**
 *
 * @author Saravanan Karthikeyan <saravanan@studioq.co.in>
 *
 */

/* global _, Categories, sails */

module.exports = async function apply(request, response) {
    const post_request_data = request.body;
    var _response_object = {};
    const logged_in_user = request.user;
    pick_input = [
        'comments', 'job_posting', 'user_resume', 'status'
    ];
    var filtered_post_data = _.pick(post_request_data, pick_input);
    const filtered_post_keys = Object.keys(filtered_post_data);
    var input_attributes = [
        { name: 'job_posting', number: true, required: true, min: 1 },
    ];
    //Add the JobApplication record to db.
    const addRecord = (post_data, callback) => {
        JobApplications.create(post_data, async function(err, application) {
            if (err) {
                await errorBuilder.build(err, function(error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            } else {
                return callback(application);
            }
        });
    };
    //Find the Employer Data .
    const SearchEmployee = (id, callback) => {
        EmployerProfiles.findOne({id:id}, async function(err, application) {
            if (err) {
                await errorBuilder.build(err, function(error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            } else {
                return callback(application);
            }
        });
    };

    // this function will update jobseeker interest in job application
    const updateUserInterestInJobApplication = (id, data, successCallBack) => {
            JobApplications.update(id, data,
                function(err, job_application) {
                    UtilsService.throwIfErrorElseCallback(err, response, 500, () => {
                        return successCallBack(job_application[0]);
                    });
                });
        }
        //Check a record already exist.
    const checkApplied = (post_data, callback) => {
        let query = { job_posting: post_data.job_posting, user: post_data.user, status: { '!=': _.get(sails.config.custom.status_codes_application, 'closed') } };
        console.log(query);

        JobApplications.findOne(query, async function(err, application) {
            console.log(application, err);
            // the below line of code will asure that the user is not interested with these job when the emplyer approached him/her for the job
            const not_interested = _.isEqual(_.get(_.cloneDeep(application), 'user_interest', null), _.get(sails, 'config.custom.user_job_interest.not_interested', null));


            console.log(`${_.get(application,'user_interest', null)} === ${_.get(sails, 'config.custom.user_job_interest.not_interested', null)}`);

            if (_.isEmpty(application) || not_interested) {
                return callback(application, not_interested);
            } else {
				if(post_data.status==8){
					let query = { job_posting: post_data.job_posting, user: post_data.user, status: 8 ,user_interest : 1 };
					JobApplications.update({ user: post_data.user, job_posting: post_data.job_posting }, query, async function(err, job_application) {
						if (err) {
							await errorBuilder.build(err, function(error_obj) {
								_response_object.errors = error_obj;
								_response_object.count = error_obj.length;
								return response.status(500).json(_response_object);
							});
						} else {
							return callback(application, not_interested);
						}
					});
				}else{
					_response_object.message = 'Already applied for the job.';
					return response.status(400).json(_response_object);
				}
            }
        });
    };
    //Build and sending email
    const sendEmail = async(job, user, application,employee, callback) => {
        //Sending email
        let details = {};
		var exprience_map = job.hands_on_experience.map(function(value) {
            return value.skill_name.split('-')[0];
        });
        job.hands_on_experience = exprience_map;
        await SkillTags.find({ id: job.skills }).then(skill => {
            job.skills = skill.map(function(value) {
                return value.tag.split('-')[0];
            });
        });
		for(let i=0;i<job.hands_on_experience.length;i++){
			var hands_on_experience_data = job.hands_on_experience[i].toLocaleUpperCase();
			var CheckData = job.skills.filter(function(a,b){ return a.toLocaleUpperCase() == hands_on_experience_data.toLocaleUpperCase()});
			if(CheckData.length !=0){
				job.skills = job.skills.filter(function(a,b){ return a.toLocaleUpperCase() != hands_on_experience_data.toLocaleUpperCase()});
			}
		}
        await Industries.find({ id: job.domain }).then(domain => {
            job.domain = domain.map(function(value) {
                return value.name;
            });
        });
		if(job.availability=="0"){
			job.availability = "Immediately"
		}else{
			job.availability = job.availability+' Days'
		}
		
        const mail_data = {
            template: 'jobpostings/apply',
            data: { job: job, user: user, application: application, employee: employee },
            to: employee.email,
            subject: 'New application received for a job via SAP.'
        };
        await mailService.sendMail(mail_data);
        callback(true);
    };
    //Build and sending response
    const sendResponse = (details) => {
        _response_object.message = 'Applied for the job successfully.';
        _response_object['details'] = details;
        return response.ok(_response_object);
    };
    validateModel.validate(JobApplications, input_attributes, filtered_post_data, async function(valid, errors) {
        if (valid) {
            JobPostings.findOne(filtered_post_data.job_posting, async function(err, job) {
                if (!job) {
                    _response_object.message = 'No job posting details found with the given id.';
                    return response.status(404).json(_response_object);
                } else {
                    filtered_post_data.user = logged_in_user.user_profile.id;
                    filtered_post_data.employer = job.company;
                    //Check whether the user already applied for the job
                    await checkApplied(filtered_post_data, async function(applied_details, not_interested) {
                        // need to update the record instead of creating. if the application is exist with the not_interested status for user_interest
                        if (not_interested) {
                            updateUserInterestInJobApplication(_.get(applied_details, 'id'), { user_interest: _.get(sails, 'config.custom.user_job_interest.interested') }, async(updated_application) => {
                                //Send email
                                await sendEmail(job, logged_in_user.user_profile, updated_application, async function() {
                                    sendResponse(updated_application);
                                });
                            });
                        } else {
							if(filtered_post_data.status ==8){
								
								await SearchEmployee(job.company, async function(employee) {
									await sendEmail(job, logged_in_user.user_profile,filtered_post_data, employee, async function(email) {
										sendResponse(filtered_post_data);
									});
								});
								
							}else{
								await SearchEmployee(job.company, async function(employee) {
								await addRecord(filtered_post_data, async function(application) {
									//Send email
									await sendEmail(job, logged_in_user.user_profile, application,employee, async function(email) {
										sendResponse(application);
									});
								});
								});
							}
                        }
                    });
                }
            });
        } else {
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });
};