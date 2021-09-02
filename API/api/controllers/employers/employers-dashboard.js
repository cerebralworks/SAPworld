
/* global _, validateModel, JobPostings, Categories, Cities, EmployerProfiles, SkillTags, sails */

var squel = require("squel");
const job_type_values = _.values(_.get(sails, 'config.custom.job_types', {}));
module.exports = async function EmployersDashboard(request, response) {
    var _response_object = {};
    const request_query = request.allParams();
    const filtered_query_data = _.pick(request_query, ['id', 'view', 'country']);
    const filtered_query_keys = Object.keys(filtered_query_data);
    var input_attributes = [
        { name: 'id', number: true }
       
    ];

    //Find the Dashboard Details based on general criteria.
    const getUserDashboardDetails = async( callback) => {
		if(filtered_query_data.view && filtered_query_data.id){
			countryQuery =``;
			if(filtered_query_data.country){
				countryQuery = `AND job_posting.country = ANY('{ ${filtered_query_data.country} }')`;
			}
			if(filtered_query_data.view =='location'){
				//To get the Matched country based Details
				Query = `SELECT  job_posting.country,count(distinct(job_posting.id)) FROM user_employments "job_posting"
						WHERE (job_posting.status = 1 OR  job_posting.status=98 ) AND job_posting.company = ${parseInt(filtered_query_data.id)} GROUP BY job_posting.country `
			}
			if(filtered_query_data.view =='type'){
				//To get the Matched Type based Details
				Query = ` SELECT  job_posting.type,count(distinct(job_posting.id)) FROM user_employments "job_posting"
						WHERE (job_posting.status = 1 OR  job_posting.status=98 ) AND job_posting.type != '0' AND job_posting.company = ${parseInt(filtered_query_data.id)}  ${countryQuery} GROUP BY job_posting.type `
			}
			if(filtered_query_data.view =='matches'){
				//To get the Matched  based Details
				Query = `SELECT job_posting.id,job_posting.title,COUNT(distinct user_profile.id) FROM user_employments "job_posting"
	LEFT JOIN employer_profiles "employer" ON (job_posting.company = employer.id) 
	CROSS JOIN user_profiles "user_profile" 
	LEFT JOIN scorings "scoring" ON (scoring.user_id = user_profile.id) 
	LEFT JOIN users "user_account" ON (user_account.id=user_profile.account) 
	WHERE (job_posting.status = 1 OR  job_posting.status=98 ) AND scoring.user_id = user_profile.id AND scoring.job_id = job_posting.id AND user_profile.job_type && ARRAY[job_posting.type]::TEXT[] AND (job_posting.company = ${parseInt(filtered_query_data.id)}) AND
	(user_account.status=1) AND (( user_profile.country like job_posting.country OR  user_profile.other_countries && ARRAY[job_posting.country]::TEXT[] ) AND ( user_profile.city like job_posting.city OR  user_profile.other_cities && ARRAY[job_posting.city]::TEXT[] ) OR ( job_posting.visa_sponsorship = true AND user_profile.work_authorization = 1 )) AND (user_profile.privacy_protection->>'available_for_opportunity')::text = 'true' AND user_profile.hands_on_skills && job_posting.hands_on_skills 
	AND (COALESCE(user_profile.experience) >= job_posting.experience)
			group by job_posting.id `
			}
			if(filtered_query_data.view =='applicant'){
				//To get the Matched applicant based Details
				Query =`SELECT COUNT(DISTINCT job_application.id),job_posting.id,job_posting.title,job_posting.id FROM  job_applications "job_application" 
LEFT JOIN user_employments "job_posting" ON (job_posting.id=job_application.job_posting) 
LEFT JOIN user_profiles "user_profile" ON (user_profile.id=job_application.user) WHERE (job_posting.status = 1 OR  job_posting.status=0 OR  job_posting.status=98 ) AND
(job_application.status=1) AND (job_application.short_listed IS NULL or job_application.short_listed != true) AND (job_application.employer=${parseInt(filtered_query_data.id)}) Group BY job_posting.id`
			}
			if(filtered_query_data.view =='shortlisted'){
				//To get the Matched shortlisted based Details
				Query = `SELECT COUNT(DISTINCT job_application.id),job_posting.id,job_posting.title,job_posting.id FROM  job_applications "job_application" 
LEFT JOIN user_employments "job_posting" ON (job_posting.id=job_application.job_posting) 
LEFT JOIN user_profiles "user_profile" ON (user_profile.id=job_application.user) WHERE  (job_posting.status = 1 OR  job_posting.status=98 OR  job_posting.status=0 ) AND
job_application.short_listed = true AND (job_application.employer=${parseInt(filtered_query_data.id)}) Group BY job_posting.id`
			}
			if(filtered_query_data.view =='hired'){
				//To get the Matched type based Details
				Query = `SELECT COUNT(DISTINCT job_application.id),job_posting.id,job_posting.title,job_posting.id FROM  job_applications "job_application" 
LEFT JOIN user_employments "job_posting" ON (job_posting.id=job_application.job_posting) 
LEFT JOIN user_profiles "user_profile" ON (user_profile.id=job_application.user) WHERE  (job_posting.status = 1 OR  job_posting.status=98 OR  job_posting.status=0 ) AND
job_application.short_listed = true AND job_application.status =  2 AND (job_application.employer=${parseInt(filtered_query_data.id)}) Group BY job_posting.id`
			}
			
			sails.sendNativeQuery(Query, async function(err, details) {
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
					return callback(_.get(details, 'rows'));
				}
			});
		}else{
		
			return callback({});
		}
    };


    //Build and sending response
    const sendResponse = (users) => {
        _response_object.data = users;
        _response_object.count = users.length;
        return response.ok(_response_object);
    };

    //Validating the request and pass on the appriopriate response
    validateModel.validate(null, input_attributes, filtered_query_data, async function(valid, errors) {
        if (valid) {
            
            //Preparing data
            await getUserDashboardDetails( function(dashboard_details) {
                sendResponse(dashboard_details);
            });
        } else {
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });

};
