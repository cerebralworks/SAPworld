
/* global _, validateModel, getEmployeeListData, Categories, Cities, EmployerProfiles, SkillTags, sails */

var squel = require("squel");
const job_type_values = _.values(_.get(sails, 'config.custom.job_types', {}));
module.exports = async function EmployeeList(request, response) {
    var _response_object = {};
    const request_query = request.allParams();
    const filtered_query_data = _.pick(request_query, ['page','status','id','column', 'sort', 'limit','company','view']);
    const filtered_query_keys = Object.keys(filtered_query_data);
    var input_attributes = [
        { name: 'page', number: true, min: 0 },
        { name: 'limit', number: true, min: 1 }
       
    ];

    //Find the getEmployeeListData based on general criteria.
    const getEmployeeListData = async( callback) => {
			userCounts = `SELECT employer_profiles.id,company_profile.contact as phone,employer_profiles.first_name,employer_profiles.last_name,employer_profiles.email
				,(select count(*) from user_employments where user_employments.company = employer_profiles.id ) as jobposting,
				(select max(user_employments.created_at) from user_employments where user_employments.company = employer_profiles.id limit 1) as last_post,employer_profiles.company,users.verified 
				FROM employer_profiles 
				LEFT JOIN company_profile "company_profile" ON (employer_profiles.user=company_profile.user_id)
				LEFT JOIN users "users" ON (employer_profiles.id=users.employer_profile)
				ORDER BY ${filtered_query_data.column} ${filtered_query_data.sort}
			 LIMIT ${filtered_query_data.limit} OFFSET ${filtered_query_data.page}`
			 
			userCountsTotal = `SELECT count(*) FROM employer_profiles `
				 
			EmployerCounts =`SELECT job_location.country,count(distinct job_location.jobid) FROM job_location group by job_location.country`	
			sails.sendNativeQuery(userCounts, async function(err, Count_Users_value) {
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
					
					//return callback(_.get(Count_Users_value, 'rows'));
					sails.sendNativeQuery(EmployerCounts, async function(errs, Employer_Users_value) {
						if (errs) {
							var error = {
								'field': 'items',
								'rules': [{
									'rule': 'invalid',
									'message': errs.message
								}]
							};
							_response_object.errors = [error];
							_response_object.count = _response_object.errors.count;
							return response.status(400).json(_response_object);
						} else {
							
							//return callback(_.get(Count_Users_value, 'rows'),_.get(Employer_Users_value, 'rows'));
							
							sails.sendNativeQuery(userCountsTotal, async function(errs, Employer_Users_value_total) {
								if (errs) {
									var error = {
										'field': 'items',
										'rules': [{
											'rule': 'invalid',
											'message': errs.message
										}]
									};
									_response_object.errors = [error];
									_response_object.count = _response_object.errors.count;
									return response.status(400).json(_response_object);
								} else {
									
									return callback(_.get(Count_Users_value, 'rows'),_.get(Employer_Users_value, 'rows'),_.get(Employer_Users_value_total, 'rows'));
								}
							});
					
						}
					});
				}
			});
		
    };


    //Build and sending response
    const sendResponse = (users,employee,total) => {
        _response_object.message = 'Employee Details successfully.';
        var meta = {};
        _response_object['employee'] = users;
        _response_object['Count'] = total;
        _response_object['country'] = employee;
        meta['page'] = filtered_query_data.page ? filtered_query_data.page : 1;
        meta['limit'] = filtered_query_data.limit;
       
        return response.ok(_response_object);
    };

    //Validating the request and pass on the appriopriate response
    validateModel.validate(null, input_attributes, filtered_query_data, async function(valid, errors) {
        if (valid) {
            
            //Preparing data
            await getEmployeeListData( function(users,employee,total) {
                sendResponse(users,employee,total);
            });
        } else {
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });

};
