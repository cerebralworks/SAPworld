
/* global _, validateModel, JobPostings, Categories, Cities, EmployerProfiles, SkillTags, sails */

var squel = require("squel");
const job_type_values = _.values(_.get(sails, 'config.custom.job_types', {}));
module.exports = async function list(request, response) {
    var _response_object = {};
    const request_query = request.allParams();
    const filtered_query_data = _.pick(request_query, ['page', 'sort', 'limit','company','view']);
    const filtered_query_keys = Object.keys(filtered_query_data);
    var input_attributes = [
        { name: 'page', number: true, min: 1 },
        { name: 'limit', number: true, min: 1 },
        { name: 'status', enum: true, values: _.values(_.pick(sails.config.custom.status_codes, ['inactive', 'active'])) }
       
    ];

    //Find the JobPostings based on general criteria.
    const getJobPostings = async( callback) => {
								
		if (filtered_query_keys.includes('company')) {
			//To get the job count details
			var Count_Users = `SELECT job_posting.id,job_posting.title,COUNT(distinct user_profile.id) FROM user_employments "job_posting"
	LEFT JOIN employer_profiles "employer" ON (job_posting.company = employer.id) 
	CROSS JOIN user_profiles "user_profile" 
	CROSS JOIN json_array_elements(to_json(job_posting.hands_on_experience)) skill_id(skillss) 
	CROSS JOIN json_array_elements(to_json(preferred_locations)) country(coun) 
	CROSS JOIN json_array_elements(to_json(preferred_locations)) city(citys) 
	LEFT JOIN users "user_account" ON (user_account.id=user_profile.account) 
	WHERE (job_posting.status = 1) AND (job_posting.company = ${parseInt(filtered_query_data.company)}) AND
	(user_account.status=1) AND (( user_profile.country like job_posting.country OR (coun->>'country') like job_posting.country ) AND ( user_profile.city like job_posting.city OR (citys->>'city') like job_posting.city) ) AND (user_profile.privacy_protection->>'available_for_opportunity')::text = 'true' AND (user_profile.skills && ARRAY[skillss->>'skill_id']::bigint[])
	AND (COALESCE(user_profile.experience) >= job_posting.experience)
			group by job_posting.id`
			if(filtered_query_data.view =='applicants'){
				//To get the applicant count details
				Count_Users = `SELECT COUNT(DISTINCT job_application.id),job_posting.id FROM  job_applications "job_application" 
LEFT JOIN user_employments "job_posting" ON (job_posting.id=job_application.job_posting) 
LEFT JOIN user_profiles "user_profile" ON (user_profile.id=job_application.user) WHERE
(job_application.status=1) AND job_application.short_listed IS NULL or job_application.short_listed != true AND (job_application.employer=${parseInt(filtered_query_data.company)}) Group BY job_posting.id`
			}
			if(filtered_query_data.view =='shortlisted'){
				//To get the shortlisted users details query
				Count_Users = `SELECT COUNT(DISTINCT job_application.id),job_posting.id FROM  job_applications "job_application" 
LEFT JOIN user_employments "job_posting" ON (job_posting.id=job_application.job_posting) 
LEFT JOIN user_profiles "user_profile" ON (user_profile.id=job_application.user) WHERE
job_application.short_listed = true AND (job_application.employer=${parseInt(filtered_query_data.company)}) Group BY job_posting.id`
			}
			sails.sendNativeQuery(Count_Users, async function(err, Count_Users_value) {
				if (err) {
					var error = {
						'field': 'items',
						'rules': [{
							'rule': 'invalid',
							'message': err.message
						}]
					};
					_response_object.errors = [error];
					_response_object.count = _response_object.errors.count;
					return response.status(400).json(_response_object);
				} else {
					//console.log(group_query_Value);
					return callback(_.get(Count_Users_value, 'rows'));
				}
			});
		}else{
		
			return callback({});
		}
    };


    //Build and sending response
    const sendResponse = (users) => {
        _response_object.message = 'Job items Count successfully.';
        var meta = {};
        meta['count'] = users.length;
        meta['page'] = filtered_query_data.page ? filtered_query_data.page : 1;
        meta['limit'] = filtered_query_data.limit;
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
		if (filtered_query_keys.includes('company')) {
			_response_object['count'] = _.cloneDeep(users);
		}
        return response.ok(_response_object);
    };

    //Validating the request and pass on the appriopriate response
    validateModel.validate(null, input_attributes, filtered_query_data, async function(valid, errors) {
        if (valid) {
            
            //Preparing data
            await getJobPostings( function(job_postings) {
                sendResponse(job_postings);
            });
        } else {
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });

};
