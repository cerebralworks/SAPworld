/**
 *
 * @author Saravanan Karthikeyan <saravanan@studioq.co.in>
 *
 */

/* global _, JobPostings, JobApplications, sails */
module.exports = async function apply(request, response) {
    const request_query = request.allParams();
    var _response_object = {};
    pick_input = [
        'accept_invitation', 'user_approach_id'
    ];
    var filtered_query_data = _.pick(request_query, pick_input);
    var input_attributes = [
        {name: 'accept_invitation', enum: true, values: _.values(_.pick(sails.config.custom.user_job_interest,['not_interested', 'interested'] )), required: true},
        {name: 'user_approach_id', required: true}
    ];
   
    const htmlTemplate = (bodyContent) => {
        response.type('text/html');
        return `
        <!DOCTYPE html>
        <html>
        
        <head>
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <title>Shejobs | Job Approach Invitation</title>
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;1,100;1,200;1,300;1,400&display=swap" rel="stylesheet">
            <style>
            body {
                font-family: 'Montserrat', sans-serif;
                margin: 0;
                padding: 0;
            }
        
            .email-template-container {
                margin: 0 auto;
                width: 600px;
                text-align: center;
                border: 1px solid #fbfbfb;
                display: table;
            }
        
            .main-logo {
                width: 100%;
                float: left;
                text-align: center;
                margin: 25px 0;
                margin-top: 50px;
            }
            .main-logo img {
                width: 100px;
            }
            .email-body-content{
                width: 100%;
                float: left;
                padding: 60px;
                padding-top: 0;
                box-sizing: border-box;
            }
            .email-page-title{
                width: 100%;
                float: left;
                font-size: 20px;
                color: #f71cb4;
                font-weight: 700;
                margin-bottom: 15px;
            }
            .email-page-text{
                width: 100%;
                float: left;
                font-size: 13px;
                color: #000;
                line-height: 20px
            }
            .email-btn-group{
                width: 100%;
                float: left;
                margin-top: 30px;
            }
            .btn-yes{
                background: #34eb54;
                font-size: 15px;
                color: #fff;
                font-weight: 500;
                border: 1px solid #34eb54;
                border-radius: 6px;
                padding: 8px 30px;
                outline: none;
            }
            .btn-no{
                background: #f52e2e;
                font-size: 15px;
                color: #fff;
                font-weight: 500;
                border: 1px solid #f52e2e;
                border-radius: 6px;
                padding: 8px 30px;
                outline: none;
            }
            .footer-content{
                width: 100%;
                float: left;
                background: #fbfbfb;
                font-size: 13px;
                color: #000;
                padding: 30px 15px;
                margin-top: 30px;
                box-sizing: border-box;
            }
            .cursor-pointer{
                cursor: pointer;
            }
            .fw-bold {
                font-weight: bold;
            }
            .fs-italic {
              font-style: italic;
            }
            .yes-btn-color-text{
              color: #34eb54;
            }
            .no-btn-color-text{
              color: #f52e2e;
            }
            .rm-anchor-line{
                text-decoration: none;
            }
            </style>
        </head>
        
        <body>
            <div class="body-container" style="width: 100%;float: left;">
                <div class="email-template-container">
                    <div class="main-logo">
                        <img src= "${UtilsService.S3Images('Common', 'sj-logo.png', 'small')}" alt="Logo">
                    </div>
                    <div class="email-body-content">
                      <div class="email-page-title">Welcome to Shejobs</div>
                        ${bodyContent}
                      </div>
                      <div class="email-page-text fw-bold" style="margin-top:30px">
                      <a target="blank" class="yes-btn-color-text" href="${sails.config.conf.webapp}">${sails.config.conf.webapp}</a>
                      </div>
                    <div class="footer-content">
                            2019 She Jobs All Rights Reserved.
                    </div>
                </div>
            </div>
        </body>
        
        </html>
        `;
    }

    // this function will update jobseeker interest in job application
    const updateUserInterestInJobApplication = (id, data, successCallBack) => {
        JobApplications.update(id, data,
            function(err, job_application){
                if(!_.isEmpty(err)){
                    return response.send(htmlTemplate('Something went wrong while processing your request. Please try again later sometime.'));
                }
                else
                {
                    return successCallBack(job_application[0]);
                }
            }); 
    }

    // this function checks whether the user job application already exist
    const isUserApplicationExist=(user_approach_id, successCallBack)=>{
        const job_application_model = JobApplications.find({where:{
            user_approach_id,
            status : { '!=' : _.get(sails.config.custom.status_codes, 'deleted') } 
            }});
            job_application_model.populate('user');
            job_application_model.populate('job_posting');
            job_application_model.exec(
            function(err, job_application){
                if(_.isEmpty(job_application)){
                    return response.send(htmlTemplate('<span class="fw-bold">user_approach_id</span> is invalid for the Job approach invitation'));
                }else{ 
                    return successCallBack(_.cloneDeep(job_application[0]));
                }
            }); 
    }

    //Build and sending email
    const sendEmailForJobAppliedByUser = async (job, user, application, callback) => {
        //Sending email
        const mail_data = {
            template: 'jobpostings/apply',
            data: {job, user, application},
            to: job.email,
            subject: 'New application received for a job via Shejobs.'
        };
        await mailService.sendMail(mail_data);
        callback(true);
    };
    //Build and sending email
    const sendEmailForJobRejectedByUser = async (job, employer, user, application, callback) => {
        //Sending email

        const mail_data = {
            template: 'jobpostings/reject-employer-invitation',
            data: {job, employer, user, application},
            to: job.email,
            subject: 'A Jobseeker rejected your job approach invitation.'
        };
        await mailService.sendMail(mail_data);
        callback(true);
    };
    validateModel.validate(null, input_attributes, filtered_query_data, async function(valid, errors){
          filtered_query_data.accept_invitation = _.toInteger(filtered_query_data.accept_invitation);
          if(valid){
            isUserApplicationExist(_.get(filtered_query_data, 'user_approach_id'), job_application=>{
                if(_.isEqual(job_application.status, _.get(sails, 'config.custom.status_codes.pending'))){
                    updateUserInterestInJobApplication(_.get(job_application, 'id'), {status: _.get(sails.config.custom.status_codes, 'active'), user_interest: filtered_query_data.accept_invitation}, updated_job_application=>{
                        if(_.isEqual(filtered_query_data.accept_invitation,  _.get(sails.config.custom.user_job_interest, 'interested'))){
                            // interested
                            sendEmailForJobAppliedByUser(_.get(job_application, 'job_posting'), _.get(job_application, 'user'), updated_job_application, ()=>{
                                return response.send(htmlTemplate(`Thanks for responding to the Job approach invitation. You successfully applied for the job ${_.get(job_application, 'job_posting.title')}. Please stay tuned for further updates form the employer.`));
                            });
                        } else {
                            // not interested
                            sendEmailForJobRejectedByUser(_.get(job_application, 'job_posting'), _.get(job_application, 'employer'), _.get(job_application, 'user'), updated_job_application, ()=>{
                                return response.send(htmlTemplate(`Thanks for responding to the Job approach invitation. It seems to be that you are not interested to apply for the job ${_.get(job_application, 'job_posting.title')}. But you can always find some other jobs that match your profile here <a target="blank" class="yes-btn-color-text" href="${sails.config.conf.webapp}/jobs/listing">${sails.config.conf.webapp}/jobs/listing</a>`));
                            });
                        }
                    });
                } else {
                    return response.send(htmlTemplate('You already responded for this Job approach invitation'));
                }
            });
          }else{
            return response.send(htmlTemplate('Something went wrong while processing your request. Please make sure that you came from a valid job approach link.'));
          }
    });
};
