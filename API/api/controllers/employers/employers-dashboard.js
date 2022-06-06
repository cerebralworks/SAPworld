
/* global _, validateModel, JobPostings, Categories, Cities, EmployerProfiles, SkillTags, sails */

var squel = require("squel");
const job_type_values = _.values(_.get(sails, 'config.custom.job_types', {}));
module.exports = async function EmployersDashboard(request, response) {
    var _response_object = {};
    const request_query = request.allParams();
    const filtered_query_data = _.pick(request_query, ['id', 'view', 'city' , 'isActive', 'isClosed', 'isDeleted', 'isPaused', 'startDate', 'endDate']);
    const filtered_query_keys = Object.keys(filtered_query_data);
    var input_attributes = [
        { name: 'id', number: true }
       
    ];

    //Find the Dashboard Details based on general criteria.
    const getUserDashboardDetails = async( callback) => {
		if(filtered_query_data.view && filtered_query_data.id){
			countryQuery =``;
			if(filtered_query_data.city){
				countryQuery = `AND locations.country = ANY('{ ${filtered_query_data.city} }')`;
			}
			
			
			filterDate = ``;
			filterDates = ``;
			if(filtered_query_data.startDate && filtered_query_data.endDate){
				filterDate =`AND (job_posting.updated_at between  '${filtered_query_data.startDate.toString()}' AND '${filtered_query_data.endDate.toString()}' )`;
				filterDates =`AND (job_postings.updated_at between  '${filtered_query_data.startDate.toString()}' AND '${filtered_query_data.endDate.toString()}' )`;
			}
			filterUpdatedDate = ``;
			if(filtered_query_data.startDate && filtered_query_data.endDate){
				filterUpdatedDate =`AND (job_posting.updated_at between  '${filtered_query_data.startDate.toString()}' AND '${filtered_query_data.endDate.toString()}' )`;
			}
			statusFilter =[];
			
			if(filtered_query_data.isActive ==true ||filtered_query_data.isActive =='true' ){
				statusFilter.push(1);
			}
			if(filtered_query_data.isClosed ==true ||filtered_query_data.isClosed =='true' ){
				statusFilter.push(0);
			}
			if(filtered_query_data.isDeleted ==true ||filtered_query_data.isDeleted =='true' ){
				statusFilter.push(3);
			}
			if(filtered_query_data.isPaused ==true ||filtered_query_data.isPaused =='true' ){
				statusFilter.push(98);
			}
			
			filterStatus = ``;
			if(statusFilter.length !=0){
				filterStatus = `(job_posting.status = ANY('{${statusFilter}}') ) `
			}else{
				filterStatus = `(job_posting.status = ANY('{1,98}') ) `
			}
			
			filterStatuss = ``;
			if(statusFilter.length !=0){
				filterStatuss = `(job_postings.status = ANY('{${statusFilter}}') ) `
			}else{
				filterStatuss = `(job_postings.status = ANY('{1,98}') ) `
			}
			
			
			if(filtered_query_data.view =='location'){
				//To get the Matched city based Details
				Query = `SELECT  locations.country as city,count(distinct(job_posting.id)) FROM user_employments "job_posting"
						LEFT JOIN job_location "locations" ON (locations.jobid= job_posting.id) 
						WHERE   ${filterStatus}  ${filterDate} AND job_posting.company = ${parseInt(filtered_query_data.id)} GROUP BY locations.country `
			}
			if(filtered_query_data.view =='type'){
				//To get the Matched Type based Details
				Query = ` SELECT  job_posting.type,count(distinct(job_posting.id)) FROM user_employments "job_posting"
						LEFT JOIN job_location "locations" ON (locations.jobid= job_posting.id) 
						WHERE   ${filterStatus}  ${filterDate} AND job_posting.type != '0' AND job_posting.company = ${parseInt(filtered_query_data.id)}  ${countryQuery} GROUP BY job_posting.type `
			}
			if(filtered_query_data.view =='matches'){
				//To get the Matched  based Details
				Query = `SELECT job_posting.id,job_posting.title,locations.countryshort,COUNT(distinct user_profile.id) FROM user_employments "job_posting"
	LEFT JOIN scorings "scoring" ON (scoring.job_id = job_posting.id) 
	LEFT JOIN user_profiles "user_profile" ON (user_profile.id=scoring.user_id)
	LEFT JOIN job_location "locations" ON (locations.jobid= job_posting.id)
	WHERE   ${filterStatus}  ${filterDate}  
	AND (job_posting.company = ${parseInt(filtered_query_data.id)}) 
	AND ((user_profile.privacy_protection->>'available_for_opportunity')::text = 'true')
	group by job_posting.id ,locations.countryshort`
			}
			if(filtered_query_data.view =='applicant'){
				//To get the Matched applicant based Details
				Query =`SELECT COUNT(DISTINCT job_application.id),job_posting.id,job_posting.title,job_posting.id FROM  job_applications "job_application" 
LEFT JOIN user_employments "job_posting" ON (job_posting.id=job_application.job_posting) 
LEFT JOIN job_location "locations" ON (locations.jobid= job_posting.id) 
LEFT JOIN user_profiles "user_profile" ON (user_profile.id=job_application.user)
 WHERE   ${filterStatus}  ${filterDate} AND
(job_application.status=1)  AND job_application.job_location = locations.id	 AND (job_application.short_listed IS NULL or job_application.short_listed != true) AND (job_application.employer=${parseInt(filtered_query_data.id)}) Group BY job_posting.id`
			}
			if(filtered_query_data.view =='shortlisted'){
				//To get the Matched shortlisted based Details
				Query = `SELECT COUNT(DISTINCT job_application.id),job_posting.id,job_posting.title,job_posting.id FROM  job_applications "job_application" 
LEFT JOIN user_employments "job_posting" ON (job_posting.id=job_application.job_posting) 
LEFT JOIN job_location "locations" ON (locations.jobid= job_posting.id) 
LEFT JOIN user_profiles "user_profile" ON (user_profile.id=job_application.user)
 WHERE    ${filterStatus}  ${filterDate} AND
job_application.short_listed = true  AND job_application.job_location = locations.id	 AND (job_application.employer=${parseInt(filtered_query_data.id)}) Group BY job_posting.id`
			}
			if(filtered_query_data.view =='hired'){
				//To get the Matched type based Details
				Query = `SELECT COUNT(DISTINCT job_application.id),job_posting.id,job_posting.title,job_posting.id FROM  job_applications "job_application" 
LEFT JOIN user_employments "job_posting" ON (job_posting.id=job_application.job_posting) 
LEFT JOIN job_location "locations" ON (locations.jobid= job_posting.id) 
LEFT JOIN user_profiles "user_profile" ON (user_profile.id=job_application.user) WHERE    ${filterStatus}  ${filterDate} AND
job_application.short_listed = true  AND job_application.job_location = locations.id	 AND job_application.status =  2 AND (job_application.employer=${parseInt(filtered_query_data.id)}) Group BY job_posting.id`
			}
			
			if(filtered_query_data.view =='hiringtrend'){
				Query =`SELECT 
				(SELECT COUNT(DISTINCT job_applications.id) FROM  job_applications "job_applications" 
LEFT JOIN user_employments "job_posting" ON (job_posting.id=job_applications.job_posting)
lEFT JOIN users "users" ON (users.user_profile =job_applications.user ) 
WHERE job_posting.id = job_postings.id   ${filterDate}  AND (job_applications.status=1) AND (job_applications.short_listed IS NULL or job_applications.short_listed != true) AND (job_applications.employer=${parseInt(filtered_query_data.id)} ) AND (users.status =1) ) as applicant,

(SELECT COUNT(DISTINCT job_applicationss.id) FROM  job_applications "job_applicationss" 
LEFT JOIN user_employments "job_posting" ON (job_posting.id=job_applicationss.job_posting)
lEFT JOIN users "userss" ON (userss.user_profile =job_applicationss.user ) 
WHERE  job_posting.id = job_postings.id ${filterUpdatedDate}   AND (job_applicationss.short_listed = true AND (job_applicationss.status !=  2 AND job_applicationss.status !=  4)) AND (job_applicationss.employer=${parseInt(filtered_query_data.id)} ) AND (userss.status =1)) as shortlist,

(SELECT COUNT(DISTINCT job_applicationsss.id) FROM  job_applications "job_applicationsss" 
LEFT JOIN user_employments "job_posting" ON (job_posting.id=job_applicationsss.job_posting) 
 WHERE job_posting.id = job_postings.id  ${filterUpdatedDate}  AND (job_applicationsss.short_listed = true AND job_applicationsss.status =  2 )   AND (job_applicationsss.employer=${parseInt(filtered_query_data.id)} ) ) as hired,
 
 (SELECT COUNT(DISTINCT job_applicationsss.id) FROM  job_applications "job_applicationsss" 
LEFT JOIN user_employments "job_posting" ON (job_posting.id=job_applicationsss.job_posting) 
 WHERE job_posting.id = job_postings.id  ${filterUpdatedDate}  AND (job_applicationsss.short_listed = true AND job_applicationsss.status =  4 )   AND (job_applicationsss.employer=${parseInt(filtered_query_data.id)} ) ) as rejected,
 
 (SELECT COUNT(DISTINCT job_applicationsss.id) FROM  job_applications "job_applicationsss" 
LEFT JOIN user_employments "job_posting" ON (job_posting.id=job_applicationsss.job_posting) 
 WHERE job_posting.id = job_postings.id  ${filterUpdatedDate}  AND (job_applicationsss.short_listed = true AND job_applicationsss.status =  5 )   AND (job_applicationsss.employer=${parseInt(filtered_query_data.id)} ) ) as holdon,

job_postings.id,job_postings.title FROM  user_employments "job_postings" 
where ${filterStatuss}  ${filterDates} AND job_postings.company = ${parseInt(filtered_query_data.id)}  `
				
			}
			if(filtered_query_data.view =='chartDetails'){
				const yyr = new Date(). getFullYear();
				Query =`SELECT 
				(SELECT COUNT(DISTINCT job_applications.id) FROM  job_applications "job_applications" 
LEFT JOIN user_employments "job_posting" ON (job_posting.id=job_applications.job_posting)  
WHERE job_posting.id = job_postings.id AND (job_applications.created_at BETWEEN '${yyr}-01-01 00:00:00'::timestamp AND '${yyr}-01-31 23:59:59'::timestamp)  AND (job_applications.employer=${parseInt(filtered_query_data.id)} ) ) as JAN,
(SELECT COUNT(DISTINCT job_applications.id) FROM  job_applications "job_applications" 
LEFT JOIN user_employments "job_posting" ON (job_posting.id=job_applications.job_posting)  
WHERE job_posting.id = job_postings.id AND (job_applications.created_at BETWEEN '${yyr}-01-02 00:00:00'::timestamp AND '${yyr}-02-28 23:59:59'::timestamp)  AND (job_applications.employer=${parseInt(filtered_query_data.id)} ) ) as FEB,
(SELECT COUNT(DISTINCT job_applications.id) FROM  job_applications "job_applications" 
LEFT JOIN user_employments "job_posting" ON (job_posting.id=job_applications.job_posting) 
WHERE job_posting.id = job_postings.id AND (job_applications.created_at BETWEEN '${yyr}-03-01 00:00:00'::timestamp AND '${yyr}-03-31 23:59:59'::timestamp)  AND (job_applications.employer=${parseInt(filtered_query_data.id)} ) ) as MAR,
(SELECT COUNT(DISTINCT job_applications.id) FROM  job_applications "job_applications" 
LEFT JOIN user_employments "job_posting" ON (job_posting.id=job_applications.job_posting)  
WHERE job_posting.id = job_postings.id AND (job_applications.created_at BETWEEN '${yyr}-04-01 00:00:00'::timestamp AND '${yyr}-04-30 23:59:59'::timestamp)  AND (job_applications.employer=${parseInt(filtered_query_data.id)} ) ) as APR,
(SELECT COUNT(DISTINCT job_applications.id) FROM  job_applications "job_applications" 
LEFT JOIN user_employments "job_posting" ON (job_posting.id=job_applications.job_posting)  
WHERE job_posting.id = job_postings.id AND (job_applications.created_at BETWEEN '${yyr}-05-01 00:00:00'::timestamp AND '${yyr}-05-31 23:59:59'::timestamp)  AND (job_applications.employer=${parseInt(filtered_query_data.id)} ) ) as MAY,
(SELECT COUNT(DISTINCT job_applications.id) FROM  job_applications "job_applications" 
LEFT JOIN user_employments "job_posting" ON (job_posting.id=job_applications.job_posting)  
WHERE job_posting.id = job_postings.id AND (job_applications.created_at BETWEEN '${yyr}-06-01 00:00:00'::timestamp AND '${yyr}-06-30 23:59:59'::timestamp)  AND (job_applications.employer=${parseInt(filtered_query_data.id)} ) ) as JUN,
(SELECT COUNT(DISTINCT job_applications.id) FROM  job_applications "job_applications" 
LEFT JOIN user_employments "job_posting" ON (job_posting.id=job_applications.job_posting)  
WHERE job_posting.id = job_postings.id AND (job_applications.created_at BETWEEN '${yyr}-07-01 00:00:00'::timestamp AND '${yyr}-07-31 23:59:59'::timestamp)  AND (job_applications.employer=${parseInt(filtered_query_data.id)} ) ) as JUL,
(SELECT COUNT(DISTINCT job_applications.id) FROM  job_applications "job_applications" 
LEFT JOIN user_employments "job_posting" ON (job_posting.id=job_applications.job_posting)  
WHERE job_posting.id = job_postings.id AND (job_applications.created_at BETWEEN '${yyr}-08-01 00:00:00'::timestamp AND '${yyr}-08-31 23:59:59'::timestamp)  AND (job_applications.employer=${parseInt(filtered_query_data.id)} ) ) as AUG,
(SELECT COUNT(DISTINCT job_applications.id) FROM  job_applications "job_applications" 
LEFT JOIN user_employments "job_posting" ON (job_posting.id=job_applications.job_posting)  
WHERE job_posting.id = job_postings.id AND (job_applications.created_at BETWEEN '${yyr}-09-01 00:00:00'::timestamp AND '${yyr}-09-30 23:59:59'::timestamp)  AND (job_applications.employer=${parseInt(filtered_query_data.id)} ) ) as SEP,
(SELECT COUNT(DISTINCT job_applications.id) FROM  job_applications "job_applications" 
LEFT JOIN user_employments "job_posting" ON (job_posting.id=job_applications.job_posting)  
WHERE job_posting.id = job_postings.id AND (job_applications.created_at BETWEEN '${yyr}-10-01 00:00:00'::timestamp AND '${yyr}-10-31 23:59:59'::timestamp)  AND (job_applications.employer=${parseInt(filtered_query_data.id)} ) ) as OCT,
(SELECT COUNT(DISTINCT job_applications.id) FROM  job_applications "job_applications" 
LEFT JOIN user_employments "job_posting" ON (job_posting.id=job_applications.job_posting)  
WHERE job_posting.id = job_postings.id AND (job_applications.created_at BETWEEN '${yyr}-11-01 00:00:00'::timestamp AND '${yyr}-11-30 23:59:59'::timestamp)  AND (job_applications.employer=${parseInt(filtered_query_data.id)} ) ) as NOV,
(SELECT COUNT(DISTINCT job_applications.id) FROM  job_applications "job_applications" 
LEFT JOIN user_employments "job_posting" ON (job_posting.id=job_applications.job_posting)  
WHERE job_posting.id = job_postings.id AND (job_applications.created_at BETWEEN '${yyr}-12-01 00:00:00'::timestamp AND '${yyr}-12-31 23:59:59'::timestamp)  AND (job_applications.employer=${parseInt(filtered_query_data.id)} ) ) as DEC,
job_postings.id ,job_postings.title FROM  user_employments "job_postings" 
where ${filterStatuss}  ${filterDates} AND job_postings.company = ${parseInt(filtered_query_data.id)}  `
				
				
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
