
/* global _, validateModel, getUserListData, Categories, Cities, EmployerProfiles, SkillTags, sails */

var squel = require("squel");
const job_type_values = _.values(_.get(sails, 'config.custom.job_types', {}));
module.exports = async function UserList(request, response) {
    var _response_object = {};
    const request_query = request.allParams();
    const filtered_query_data = _.pick(request_query, ['page','status','column','id', 'sort', 'limit','company','view']);
    const filtered_query_keys = Object.keys(filtered_query_data);
    var input_attributes = [
        { name: 'page', number: true, min: 0 },
        { name: 'limit', number: true, min: 1 }
       
    ];

    //Find the getUserListData based on general criteria.
    const getUserListData = async( callback) => {
			userCounts = `SELECT user_profiles.first_name,user_profiles.last_name,user_profiles.job_role,user_profiles.city,
			user_profiles.state,user_profiles.country,user_profiles.created_at FROM user_profiles  ORDER BY ${filtered_query_data.column} ${filtered_query_data.sort}
			 LIMIT ${filtered_query_data.limit} OFFSET ${filtered_query_data.page}`
				
				userCountsTotal = `SELECT count(*) FROM user_profiles `
				 
			EmployerCounts =`SELECT user_profiles.country,count(user_profiles.country) FROM user_profiles where user_profiles.country is not null group by country`	
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
    const sendResponse = (users,country,total) => {
        _response_object.message = 'User Details successfully.';
        var meta = {};
        _response_object['user'] = users;
        _response_object['country'] = country;
        _response_object['Count'] = total;
        meta['page'] = filtered_query_data.page ? filtered_query_data.page : 1;
        meta['limit'] = filtered_query_data.limit;
       
        return response.ok(_response_object);
    };

    //Validating the request and pass on the appriopriate response
    validateModel.validate(null, input_attributes, filtered_query_data, async function(valid, errors) {
        if (valid) {
            
            //Preparing data
            await getUserListData( function(users,country,total) {
                sendResponse(users,country,total);
            });
        } else {
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });

};
