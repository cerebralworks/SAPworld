
/* global _, validateModel, JobPostings, Categories, Cities, EmployerProfiles, SkillTags, sails */

var squel = require("squel");
const job_type_values = _.values(_.get(sails, 'config.custom.job_types', {}));
module.exports = async function UserDashboard(request, response) {
    var _response_object = {};
    const request_query = request.allParams();
    const filtered_query_data = _.pick(request_query, ['id', 'view', 'city', 'isActive', 'isClosed', 'isDeleted', 'isPaused', 'startDate', 'endDate' ]);
    const filtered_query_keys = Object.keys(filtered_query_data);
    var input_attributes = [
        { name: 'id', number: true }
    ];

    //Find the Dashboard Details based on general criteria.
    const getUserDashboardDetails = async( callback) => {
		if(filtered_query_data.view && filtered_query_data.id){
			countryQuery =``;
			if(filtered_query_data.city){
				countryQuery = `AND job_posting.city = ANY('{ ${filtered_query_data.city} }')`;
			}
			filterDate = ``;
			if(filtered_query_data.startDate && filtered_query_data.endDate){
				filterDate =`AND (job_posting.created_at between  '${filtered_query_data.startDate.toString()}' AND '${filtered_query_data.endDate.toString()}' )`;
			}
			statusFilter =[];
			
			if(filtered_query_data.isActive ==true ||filtered_query_data.isActive =='true' ){
				statusFilter.push(1);
			}
			if(filtered_query_data.isClosed ==true ||filtered_query_data.isClosed =='true' ){
				statusFilter.push(3);
			}
			if(filtered_query_data.isDeleted ==true ||filtered_query_data.isDeleted =='true' ){
				statusFilter.push(99);
			}
			if(filtered_query_data.isPaused ==true ||filtered_query_data.isPaused =='true' ){
				statusFilter.push(98);
			}
			
			filterStatus = ``;
			if(statusFilter.length !=0){
				filterStatus = `(job_posting.status = ANY('{${statusFilter}}') ) `
			}else{
				filterStatus = `(job_posting.status = ANY('{1,98,99,3}') ) `
			}
			if(filtered_query_data.view =='matches'){
				//To get the Matched city based Details
				Query = `SELECT  job_posting.city,count(distinct(job_posting.id)) FROM user_employments "job_posting"
				CROSS JOIN user_profiles "user_profile" 
				LEFT JOIN users "user_account" ON (user_account.id=user_profile.account) 
				WHERE ${filterStatus} ${filterDate} AND
				(user_account.status=1)  AND user_profile.hands_on_skills && job_posting.hands_on_skills 
				AND (COALESCE(user_profile.experience) >= job_posting.experience) AND (user_profile.id=${parseInt(filtered_query_data.id)}) group by job_posting.city `
			}
			if(filtered_query_data.view =='availability'){
				//To get the Matched availability based Details
				Query = `SELECT  job_posting.availability,count(distinct(job_posting.id)) FROM user_employments "job_posting"
				CROSS JOIN user_profiles "user_profile" 
				LEFT JOIN users "user_account" ON (user_account.id=user_profile.account) 
				WHERE  ${filterStatus}  ${filterDate}   ${countryQuery} AND
				(user_account.status=1)  AND user_profile.hands_on_skills && job_posting.hands_on_skills 
				AND (COALESCE(user_profile.experience) >= job_posting.experience) AND (user_profile.id=${parseInt(filtered_query_data.id)}) group by job_posting.availability `
			}
			if(filtered_query_data.view =='type'){
				//To get the Matched type based Details
				Query = `SELECT  job_posting.type,count(distinct(job_posting.id)) FROM user_employments "job_posting"
				CROSS JOIN user_profiles "user_profile" 
				LEFT JOIN users "user_account" ON (user_account.id=user_profile.account) 
				WHERE  ${filterStatus}  ${filterDate}   ${countryQuery}  AND
				(user_account.status=1)  AND user_profile.hands_on_skills && job_posting.hands_on_skills 
				AND (COALESCE(user_profile.experience) >= job_posting.experience) AND (user_profile.id=${parseInt(filtered_query_data.id)}) group by job_posting.type `
			}
			if(filtered_query_data.view =='visa'){
				//To get the Matched type based Details
				Query = `SELECT  job_posting.city,count(distinct(job_posting.id)) FROM user_employments "job_posting"
				CROSS JOIN user_profiles "user_profile" 
				LEFT JOIN users "user_account" ON (user_account.id=user_profile.account) 
				WHERE  ${filterStatus}   ${filterDate} AND
				(user_account.status=1)  AND user_profile.hands_on_skills && job_posting.hands_on_skills AND job_posting.visa_sponsorship = true  
				AND (COALESCE(user_profile.experience) >= job_posting.experience) AND (user_profile.id=${parseInt(filtered_query_data.id)}) group by job_posting.city`
			}
			if(filtered_query_data.view =='applied'){
				//To get the Matched type based Details
				Query = `SELECT  job_posting.city ,count(distinct(job_posting.id)) FROM job_applications "job_application"
				LEFT JOIN user_employments "job_posting" ON (job_posting.id=job_application.job_posting) 	
				LEFT JOIN user_profiles "user_profile" ON (user_profile.id=job_application.user) 
				WHERE  ${filterStatus}  ${filterDate} AND (user_profile.id=${parseInt(filtered_query_data.id)} )   ${countryQuery} 
				 group by job_posting.city `
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
