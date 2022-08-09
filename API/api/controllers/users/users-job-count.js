
/* global _, validateModel, JobPostings, Categories, Cities, EmployerProfiles, SkillTags, sails */

var squel = require("squel");
const job_type_values = _.values(_.get(sails, 'config.custom.job_types', {}));
module.exports = async function list(request, response) {
    var _response_object = {};
    const request_query = request.allParams();
    const filtered_query_data = _.pick(request_query, ['page','status','id', 'sort','visa_sponsered', 'limit','company','view']);
    const filtered_query_keys = Object.keys(filtered_query_data);
    var input_attributes = [
        { name: 'page', number: true, min: 1 },
        { name: 'limit', number: true, min: 1 }
       
    ];

    //Find the JobPostings based on general criteria.
    const getJobPostings = async( callback) => {
			var visa_sponsorshipData =``;
			if(filtered_query_data.view =='users'){
				if(filtered_query_data.visa_sponsered == 'true' ){
					//visa_sponsorshipData =`AND (job_posting.visa_sponsorship = true )`;
				}if(filtered_query_data.visa_sponsered == 'false'){
					//visa_sponsorshipData =`AND (job_posting.visa_sponsorship = false )`;
				}
			}
			
		if (filtered_query_keys.includes('company')) {
			//To get the job count details
			var Count_Users = `SELECT job_posting.id,job_posting.title,COUNT(distinct user_profile.id) FROM user_employments "job_posting"
	LEFT JOIN scorings "scoring" ON (scoring.job_id = job_posting.id) 
	LEFT JOIN user_profiles "user_profile" ON (user_profile.id=scoring.user_id)
	lEFT JOIN users "users" ON (users.user_profile =user_profile.id )
	WHERE (job_posting.status = 1 OR  job_posting.status=98 )  
	AND ((user_profile.privacy_protection->>'available_for_opportunity')::text = 'true')
	AND (job_posting.company = ${parseInt(filtered_query_data.company)})
	AND (users.status = 1)
	group by job_posting.id ORDER BY job_posting.id`
			if(filtered_query_data.view =='applicants'){
				//To get the applicant count details
				Count_Users = `SELECT COUNT(DISTINCT job_application.id),job_posting.id FROM  job_applications "job_application" 
LEFT JOIN user_employments "job_posting" ON (job_posting.id=job_application.job_posting) 
LEFT JOIN job_location "locations" ON (locations.id= job_application.job_location) 
LEFT JOIN user_profiles "user_profile" ON (user_profile.id=job_application.user)
lEFT JOIN users "users" ON (users.user_profile =user_profile.id )
 WHERE (job_posting.status = 1 OR  job_posting.status=0 OR  job_posting.status=98 ) AND
(job_application.status=1) AND (job_application.short_listed IS NULL or job_application.short_listed != true) AND (job_application.employer=${parseInt(filtered_query_data.company)}) AND (users.status =1) Group BY job_posting.id ORDER BY job_posting.id`
			}
			if(filtered_query_data.view =='shortlisted'){
				//To get the shortlisted users details query
				Count_Users = `SELECT COUNT(DISTINCT job_application.id),job_posting.id FROM  job_applications "job_application" 
LEFT JOIN user_employments "job_posting" ON (job_posting.id=job_application.job_posting) 
LEFT JOIN job_location "locations" ON (locations.id= job_application.job_location) 
LEFT JOIN user_profiles "user_profile" ON (user_profile.id=job_application.user)
lEFT JOIN users "users" ON (users.user_profile =user_profile.id )
 WHERE  (job_posting.status = 1 OR  job_posting.status=98 OR  job_posting.status=0 ) AND
job_application.short_listed = true AND (job_application.employer=${parseInt(filtered_query_data.company)}) AND (users.status =1) Group BY job_posting.id ORDER BY job_posting.id`
			}
			if(filtered_query_data.view =='users'){
				//To get the job details Count
				Count_Users = `SELECT COUNT(distinct job_posting.id) FROM user_employments "job_posting"
LEFT JOIN employer_profiles "employer" ON (job_posting.company = employer.id) 
CROSS JOIN user_profiles "user_profile" 
LEFT JOIN scorings "scoring" ON (scoring.user_id = user_profile.id) 
LEFT JOIN job_location "locations" ON (locations.jobid= job_posting.id) 
LEFT JOIN users "user_account" ON (user_account.id=user_profile.account) 
WHERE (( job_posting.status = 1 OR job_posting.id = (SELECT job_application.job_posting FROM job_applications "job_application" WHERE (job_application.job_posting = job_posting.id) AND (job_application.user = ${parseInt(filtered_query_data.company)} )))) AND (job_posting.status != 0)  
 AND job_posting.status != 3 AND scoring.user_id = user_profile.id AND scoring.job_id = job_posting.id AND user_profile.job_type && ARRAY[job_posting.type]::TEXT[] AND (user_profile.id = ${parseInt(filtered_query_data.company)} ) AND
(user_account.status=1) AND (( user_profile.country like locations.country OR  user_profile.other_countries && ARRAY[locations.country]::TEXT[] ) AND (( user_profile.city like locations.city OR  user_profile.other_cities && ARRAY[locations.city]::TEXT[] )OR user_profile.willing_to_relocate =true )  OR ( job_posting.visa_sponsorship = true AND user_profile.work_authorization = 1 ) ) AND (user_profile.privacy_protection->>'available_for_opportunity')::text = 'true' AND ( user_profile.hands_on_skills && job_posting.hands_on_skills OR (user_profile.entry = true OR job_posting.entry =true ))
AND (COALESCE(user_profile.experience) >= job_posting.experience) ${visa_sponsorshipData}
group by job_posting.id`
			}
			if(filtered_query_data.view =='users_matches'){
				//To get the job details Count
				Count_Users = `SELECT job_posting.id,job_posting.title,job_posting.company FROM user_employments "job_posting"
CROSS JOIN user_profiles "user_profile" 
LEFT JOIN scorings "scoring" ON (scoring.user_id = user_profile.id) 
WHERE (job_posting.status = 1) AND scoring.user_id = ${filtered_query_data.id} AND scoring.job_id = job_posting.id AND 
(job_posting.company = ${filtered_query_data.company} ) AND (user_profile.id = ${filtered_query_data.id} ) `
			}
			if(filtered_query_data.view =='users_matches_details'){
				//To get the job details Count
				Count_Users = `SELECT job_posting.*,scoring.score,scoring.mail,job_app.status as jobstatus,job_app.others as otherss FROM user_employments "job_posting"
CROSS JOIN user_profiles "user_profile" 
LEFT JOIN scorings "scoring" ON (scoring.user_id = user_profile.id)
LEFT JOIN job_applications "job_app" ON (job_app.job_posting = job_posting.id AND scoring.user_id = job_app.user)
WHERE (job_posting.status = 1) AND scoring.user_id = ${filtered_query_data.id} AND scoring.job_id = job_posting.id AND 
(job_posting.company = ${filtered_query_data.company} ) AND (user_profile.id = ${filtered_query_data.id} ) group by job_posting.id,scoring.id,job_app.id order by scoring.score desc`
			}
			if(filtered_query_data.view =='screening_process'){
				//To get the job details Count
				Count_Users = `SELECT job_posting.screening_process,job_posting.id,job_posting.title FROM user_employments "job_posting"
WHERE job_posting.screening_process is not null and (job_posting.company = ${filtered_query_data.company} ) ORDER BY job_posting.id DESC limit ${filtered_query_data.limit}`
			}
			if(filtered_query_data.view =='update_status'){
				//To get the job details Count
				Count_Users = `update job_applications set view = ${filtered_query_data.status} where id = ${filtered_query_data.id}`
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
