/**
 *
 * @author Saravanan Karthikeyan <saravanan@studioq.co.in>
 *
 */

/* global _, JobPostings, JobApplications, SkillTags,  validateModel, sails */

module.exports = async function view(request, response) {

    const request_query = request.allParams();
    const filtered_query_data = _.pick(request_query, ['id','location_id','is_users_view','user_id', 'expand', 'additional_fields', 'is_job_applied']);
    var _response_object = {};
    var input_attributes = [
        { name: 'id', required: true, number: true, min: 1 },
        { name: 'location_id', number: true, min: 1 }
    ];
    var expand = [];
    if (filtered_query_data.expand) {
        expand = filtered_query_data.expand.split(',');
    }
    var additional_fields = [];
    if (filtered_query_data.additional_fields) {
        additional_fields = filtered_query_data.additional_fields.split(',');
    }

    // Check whether the job posting id is exits in db.
    function isJobPostingExist(id, successCallBack) {
		let job_model = JobPostings.findOne({
				where: {
					id: id,
					'status': { '!=': _.get(sails.config.custom.status_codes, 'deleted') }
				}
			}).populate('company');
			
		if(filtered_query_data.is_users_view){
			job_model = '';
			job_model = JobPostings.findOne({
				where: {
					id: id
				}
			}).populate('company');
		}
        

        if (expand.includes('category')) {
            job_model.populate('category');
        }
        if (expand.includes('company')) {
            job_model.populate('company');
        }

        job_model.exec(async function(err, job_posting) {
            if (!job_posting) {
                _response_object.message = 'No job found with the given id.';
                return response.status(404).json(_response_object);
            } else {
                if (expand.includes('skill_tags')) {
                    if (!_.isEmpty(_.get(job_posting, 'skill_tags'))) {
                        let skill_tags = await _.map(_.get(job_posting, 'skill_tags'), value => parseInt(value));
                        skill_tags = await SkillTags.find({ id: { in: skill_tags }, status: { '!=': _.get(sails.config.custom.status_codes, 'deleted') } });
                        job_posting.skill_tags = skill_tags;
                    }
                }
                if (expand.includes('type')) {
                    const job_types = _.get(sails, 'config.custom.job_types');
                    const index = _.indexOf(_.values(job_types), _.get(job_posting, 'type'));
                    if (index > -1) {
                        job_posting.type = _.startCase(_.keys(job_types)[index]);
                    } else {
                        job_posting.type = 'unknown';
                    }
                }
                if (additional_fields.includes('no_of_applicants')) {
                    job_posting.no_of_applicants = await JobApplications.count({ job_posting: _.get(job_posting, 'id'), status: { '!=': _.get(sails.config.custom.status_codes, 'deleted') } });
                }
                if (additional_fields.includes('no_of_shortlisted_applicants')) {
                    job_posting.no_of_shortlisted_applicants = await JobApplications.count({ job_posting: _.get(job_posting, 'id'), status: { '!=': _.get(sails.config.custom.status_codes, 'deleted') }, short_listed: true });
                }
                if (filtered_query_data.is_job_applied && filtered_query_data.user_id) {
                    job_posting.is_job_applied = await JobApplications.count({ job_posting: _.get(job_posting, 'id'), user: filtered_query_data.user_id , location_id: filtered_query_data.location_id });
                    job_posting.job_applied = await JobApplications.findOne({ job_posting: _.get(job_posting, 'id'), user: filtered_query_data.user_id, location_id: filtered_query_data.location_id });
                }
				if (expand.includes('score')&& filtered_query_data.user_id) {
					job_posting.score = await Scoring.findOne({ job_id: _.get(job_posting, 'id'), user_id: filtered_query_data.user_id , location_id: filtered_query_data.location_id });
				}
				if (filtered_query_data.location_id) {
					job_posting.job_location = await JobLocation.findOne({ id: filtered_query_data.location_id });
				}
                successCallBack(job_posting);
            }
        });
    }

    // Build and send response.
    function sendResponse(details) {
        _response_object.message = 'Job item retrieved successfully.';
        var meta = {};
        meta['photo'] = {
            path: 'https://s3.' + sails.config.conf.aws.region + '.amazonaws.com/' + sails.config.conf.aws.bucket_name,
            folder: 'public/images/Companies',
            sizes: {
                small: 256,
                medium: 512
            }
        };
        meta['photo'].example = meta['photo'].path + '/' + meta['photo'].folder + '/' + meta['photo'].sizes.medium + '/[filename].[filetype]';
        _response_object['meta'] = meta;
        _response_object['details'] = details;
        return response.ok(_response_object);
    };
	//Validating the request and pass on the appriopriate response.
    validateModel.validate(JobPostings, input_attributes, filtered_query_data, async function(valid, errors) {
        if (valid) {
            isJobPostingExist(parseInt(_.get(filtered_query_data, 'id')), function(job_posting) {
                sendResponse(job_posting);
            });
        } else {
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });
};