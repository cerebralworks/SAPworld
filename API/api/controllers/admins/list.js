
/* global _, validateModel, getListData, Categories, Cities, EmployerProfiles, SkillTags, sails */

var squel = require("squel");
const job_type_values = _.values(_.get(sails, 'config.custom.job_types', {}));
module.exports = async function list(request, response) {
    var _response_object = {};
    const request_query = request.allParams();
    const filtered_query_data = _.pick(request_query, ['page','status','id', 'sort', 'limit','company','view']);
    const filtered_query_keys = Object.keys(filtered_query_data);
    var input_attributes = [
        { name: 'page', number: true, min: 1 },
        { name: 'limit', number: true, min: 1 }
       
    ];

    //Find the getListData based on general criteria.
    const getListData = async( callback) => {
			userCounts = `SELECT COUNT(user_profile.id) as total,
				(SELECT COUNT(*) FROM user_profiles where 
				 (user_profiles.privacy_protection->>'available_for_opportunity')::text = 'true' ) as available ,
				(SELECT COUNT(*) FROM user_profiles where 
				 (user_profiles.privacy_protection->>'available_for_opportunity')::text = 'false' ) as notavailable 
				 FROM  user_profiles "user_profile" `
				 
			EmployerCounts =`SELECT COUNT(employer_profiles.id) as total,
				(SELECT COUNT(*) FROM user_employments where 
				 user_employments.status = 1  ) as active ,
				(SELECT COUNT(*) FROM user_employments where 
				 user_employments.status = 0  ) as inactive 
				 FROM  employer_profiles `	
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
							
							return callback(_.get(Count_Users_value, 'rows'),_.get(Employer_Users_value, 'rows'));
						}
					});
				}
			});
		
    };


    //Build and sending response
    const sendResponse = (users,employee) => {
        _response_object.message = 'Dashboard Count successfully.';
        var meta = {};
        _response_object['users'] = users;
        _response_object['employee'] = employee;
        meta['page'] = filtered_query_data.page ? filtered_query_data.page : 1;
        meta['limit'] = filtered_query_data.limit;
       
        return response.ok(_response_object);
    };

    //Validating the request and pass on the appriopriate response
    validateModel.validate(null, input_attributes, filtered_query_data, async function(valid, errors) {
        if (valid) {
            
            //Preparing data
            await getListData( function(users,employee) {
                sendResponse(users,employee);
            });
        } else {
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });

};
