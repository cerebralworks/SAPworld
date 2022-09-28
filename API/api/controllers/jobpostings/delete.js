
/* global _, JobPostings, JobApplications, validateModel, sails */

var async = require('async');

module.exports = async function deleteRecords(request, response) {
    const post_request_data = request.body;
    var _response_object = {};
    const logged_in_user = request.user;
    pick_input = [
        'ids'
    ];
	var log_user={};
    var filtered_post_data = _.pick(post_request_data, pick_input);
    var input_attributes = [
        { name: 'ids', required: true, array: true, individual_rule: { number: true, min: 1 }, min: 1 }
    ];
	filtered_post_data.logged_in_user=logged_in_user;
	
	/** To validate admin to delete the job 
	    @params emp_id
	**/
	if(post_request_data.emp_id !=undefined){
		await Users.find({employer_profile:post_request_data.emp_id}).then(data=>{
			 log_user.company = post_request_data.emp_id;
			 log_user.account = data[0].id;
			})
		}else{
		log_user.company = logged_in_user.employer_profile.id;
		log_user.account = logged_in_user.id;
		}
		
    // Delete the Job Posting records from db.
    function deleteJobPosting(ids, data, callback) {
        JobPostings.update({ id: { in: ids } }, data, async function(err, job_postings) {
            if (err) {
                await errorBuilder.build(err, function(error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            } else {
                deleteJobApplication(job_postings, data, callback);
            }
        });
    };

    // Delete all Job Application related to the specific job posting.
    function deleteJobApplication(job_postings, data, callback) {
        async.forEachOf(job_postings, (value, key, callback) => {
            JobApplications.update({ job_posting: _.get(value, 'id'), status: { '!=': _.get(sails.config.custom.status_codes, 'deleted') } }, data, function(err, job_application) {
                if (!_.isEmpty(job_application)) {
                    value.deleted_job_application = job_application;
                }
                callback();
            });
        }, () => {
            return callback(job_postings);
        });

    };

    // Check whether the job posting ids is exits in db.
    function isJobPostingExist(ids, successCallBack) {
        JobPostings.find({
                where: {
                    id: { in: ids },
                    status: { '!=': _.get(sails.config.custom.status_codes, 'deleted') },
                    company: log_user.company
                }
            },
            function(err, job_postings) {
                if (_.isEmpty(job_postings)) {
                    _response_object.message = 'No job found with the given ids.';
                    return response.status(404).json(_response_object);
                } else {
                    successCallBack(job_postings);
                }
            });
    }

    // Build and send response.
    function sendResponse(details,filtered_post_data) {
        _response_object.message = 'Job has been deleted successfully.';
        _response_object['details'] = details;
		
		var postDetailss = {};
		postDetailss.name=details[0].title;
		postDetailss.message=postDetailss.name+' is Removed ';
		postDetailss.account=log_user.account;
		postDetailss.job_id=details[0].id;
		postDetailss.employer=log_user.company;		
		postDetailss.view=0;	
		
		Notification.create(postDetailss, function(err, job) {
			
		}); 
		
        return response.ok(_response_object);
    };
	//Validating the request and pass on the appriopriate response.
    validateModel.validate(JobPostings, input_attributes, filtered_post_data, async function(valid, errors) {
        if (valid) {
            let ids = [];
            await filtered_post_data.ids.forEach(function(id) {
                ids.push(parseInt(id));
            });
            var filtered_post_datas = { status: _.get(sails.config.custom.status_codes, 'deleted') };
            isJobPostingExist(ids, async function(job_postings) {
                // storing extracted job posting ids
                ids = await _.map(job_postings, 'id');
                deleteJobPosting(ids, filtered_post_datas,async function(job_postings) {
                    sendResponse(job_postings,filtered_post_data);
                });
            });
        } else {
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });
};