
/* global _, JobPostings, JobApplications, sails */
const moment = require("moment");
module.exports = async function apply(request, response) {
    const post_request_data = request.body;
    var _response_object = {};
    const logged_in_user = request.user;
    pick_input = [
        'job_posting', 'user'
    ];
    var filtered_post_data = _.pick(post_request_data, pick_input);
    var input_attributes = [
        {name: 'job_posting', number: true, required: true, min: 1},
        {name: 'user', number: true, required: true, min: 1}
    ];
    
    // this function checks whether the specific job is posted by the current logged in employer
    const isJobPostedByEmployer = (employer, job_posting, successCallBack) => {
        const job_model = JobPostings.findOne({where:{
            id: job_posting,
            employer,
            'status' : { '!=' : _.get(sails.config.custom.status_codes, 'deleted') } 
        }}); 
        job_model.populate('employer');
        job_model.exec(
            function(err, job_posting){
                UtilsService.throwIfErrorElseCallback(err, response, 500, ()=>{
                if(_.isEmpty(job_posting)){
                    _response_object.message = 'There is no job posted by the employer for the given `job_posting` id';
                    return response.status(404).json(_response_object);
                }else{ 
                    return successCallBack(job_posting);
                }
            });
        });

    }

    // this function checks whether the user job application already exist for the job
    const isUserApplicationExist=(user, job_posting, successCallBack)=>{
        JobApplications.find({where:{
            job_posting,
            user,
            'status' : { '!=' : _.get(sails.config.custom.status_codes, 'deleted') } 
            }}, 
            function(err, job_application){
                UtilsService.throwIfErrorElseCallback(err, response, 500, ()=>{
                if(!_.isEmpty(job_application)){
                    _response_object.message = 'User job application already exist for the job';
                    return response.status(404).json(_response_object);
                }else{ 
                    return successCallBack();
                }
            });
        }); 
    }

    // this function checks whether the user profile exits
    const isUserProfileExist = (user, successCallBack) => {
        const user_profile_model = UserProfiles.findOne({where:{
            id: user
        }}); 
        user_profile_model.populate('account');
        user_profile_model.exec(
            function(err, user_profile){
                UtilsService.throwIfErrorElseCallback(err, response, 500, ()=>{
                    if(_.isEmpty(user_profile) || _.isEqual(_.get(_.cloneDeep(user_profile), 'account.status'), _.get(sails.config.custom.status_codes, 'deleted'))){
                        _response_object.message = 'There is no user found for the given `user` id';
                        return response.status(404).json(_response_object);
                    }else{ 
                        return successCallBack(user_profile);
                    }
                });
        });

    }

    // create a job application for the user
    const createJobApplication = (data, successCallBack) => {
        JobApplications.create(data, async function(err, application){
            UtilsService.throwIfErrorElseCallback(err, response, 500, ()=>{
                return successCallBack(application);
            });
        });
    };

    const removeRecordFromApplication = (id, successCallBack) => {
        JobApplications.destroyOne({id}, async function(err, application){
            UtilsService.throwIfErrorElseCallback(err, response, 500, ()=>{
                return successCallBack(application);
            });
        });
    };
    // This function will send email notification to the jobSeeker regrading employer approach him for the specific job
    const sendEmail = (job, employer, user, application, callback) => {
        //Sending email
        
        const mail_data = {
            template: 'employers/approach-jobseeker',
            data: {job, employer, user, application, baseUrl: UtilsService.baseUrl(request)},
            to: _.get(user, 'account.username'),
            subject: 'A Employer approched you for a job via Shejobs.'
        };
        mailService.sendMail(mail_data, err=>{
            if(err){
                // if job approach invitation email fail to send then the job application suppose to be removed
                removeRecordFromApplication(_.get(application, 'id'), ()=>{
                    errorBuilder.build(err, function (error_obj) {
                        _response_object.errors = error_obj;
                        _response_object.count = error_obj.length;
                        return response.status(500).json(_response_object);
                    });
                });
            } else {
                callback();
            }
        });
    };

    // Build and send response.
    const sendResponse = () =>{
        _response_object.message = 'Job approach invitation have been sent to jobseeker.';
        return response.ok(_response_object);
    };
	//Validating the request and pass on the appriopriate response.
    validateModel.validate(null, input_attributes, filtered_post_data, async function(valid, errors){
          if(valid){
                filtered_post_data.job_posting = parseInt(filtered_post_data.job_posting);
                filtered_post_data.user = parseInt(filtered_post_data.user);
                const employer_id = _.get(logged_in_user, 'employer_profile.id');
                isJobPostedByEmployer(employer_id, filtered_post_data.job_posting,(job_posting)=>{
                    isUserApplicationExist(filtered_post_data.user, filtered_post_data.job_posting, ()=>{
                        isUserProfileExist( filtered_post_data.user, (user_profile)=> {
                            const applicationData = {
                                user: filtered_post_data.user,
                                job_posting: filtered_post_data.job_posting,
                                employer: parseInt(_.get(job_posting, 'employer.id')),
                                user_approach_id: `${UtilsService.uid(25)}${moment().unix()}`,
                                status: _.get(sails.config.custom.status_codes, 'pending')
                            };
                            createJobApplication(applicationData, (job_application)=>{
                                sendEmail(job_posting, _.get(job_posting, 'employer'), user_profile, job_application, ()=>{
                                    sendResponse();
                                });
                            });
                        })                        
                    })
                });
          }else{
              _response_object.errors = errors;
              _response_object.count = errors.length;
              return response.status(400).json(_response_object);
          }
    });
};
