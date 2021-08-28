
/* global _, validateModel, getListDatas, Categories, Cities, EmployerProfiles, SkillTags, sails */

module.exports = async function dashboardDetails(request, response) {
    var _response_object = {};
    const request_query = request.allParams();
    const filtered_query_data = _.pick(request_query, ['page','status','search','id', 'sort', 'day', 'column', 'limit','company','view']);
    const filtered_query_keys = Object.keys(filtered_query_data);
    var input_attributes = [
        { name: 'page', number: true, min: 0 },
        { name: 'limit', number: true, min: 1 },
        { name: 'day', number: true, min: 1 }
       
    ];
	
    //Find the getListDatas based on general criteria.
    const getListDatas = async( callback) => {
			var searchQuery =``;
			if(filtered_query_data.search){
				searchQuery =`AND ((job_posting.title like '%${filtered_query_data.search}%') OR 
				(employer.first_name like '%${filtered_query_data.search}%' )	OR
				(employer.last_name like '%${filtered_query_data.search}%' )	
				
				)`;
			}
			query = `SELECT employer.first_name as first_name,job_posting.title as title,job_posting.created_at as created_at,
			json_build_object('first_name',employer.first_name,'last_name',employer.last_name) AS "employer" ,
			(SELECT COUNT(*) FROM  job_applications "job_application" where
			(job_application.status=1) AND (job_application.short_listed IS NULL or job_application.short_listed != true) 
			 AND (job_application.job_posting=job_posting.id)) as applicant,
			 (SELECT COUNT(*) FROM  job_applications "job_application" where
			(job_posting.status != 3 AND  job_application.status=2 ) 
			 AND (job_application.job_posting=job_posting.id)) as hired,
			 (SELECT COUNT(*) FROM  job_applications "job_application" where
			(job_posting.status != 3 AND  job_application.status=4 ) 
			 AND (job_application.job_posting=job_posting.id)) as rejected 
			FROM user_employments "job_posting" 
			LEFT JOIN employer_profiles "employer" ON (job_posting.company = employer.id)
			where job_posting.status != 3 AND (job_posting.created_at > (select now() - interval ' ${filtered_query_data.day} day ')) ${searchQuery} ORDER BY ${filtered_query_data.column} ${filtered_query_data.sort}
			 LIMIT ${filtered_query_data.limit} OFFSET ${filtered_query_data.page} `
			
			queryCount = `SELECT count(*)
			FROM user_employments "job_posting" 
			LEFT JOIN employer_profiles "employer" ON (job_posting.company = employer.id)
			where job_posting.status != 3  AND (job_posting.created_at > (select now() - interval ' ${filtered_query_data.day} day '))  ${searchQuery}  `
				if(filtered_query_data.view =='employer-inactive'){ 
			query =`SELECT  employer.first_name as first_name,job_posting.title as title,job_posting.created_at as created_at,
			json_build_object('first_name',employer.first_name,'last_name',employer.last_name) AS "employer" ,
			(SELECT COUNT(*) FROM  job_applications "job_application" where
			(job_application.status=1)  
			 AND (job_application.job_posting=job_posting.id)) as applicant,
			 (SELECT COUNT(*) FROM  job_applications "job_application" where
			(job_posting.status != 3 AND  job_application.status=2 ) 
			 AND (job_application.job_posting=job_posting.id)) as hired,
			 (SELECT COUNT(*) FROM  job_applications "job_application" where
			(job_posting.status != 3 AND  job_application.status=4 ) 
			 AND (job_application.job_posting=job_posting.id)) as rejected 
			FROM user_employments "job_posting" 
			LEFT JOIN employer_profiles "employer" ON (job_posting.company = employer.id)
			where job_posting.status != 3  AND (job_posting.created_at > (select now() - interval ' ${filtered_query_data.day} day ')) AND job_posting.status != 0   ${searchQuery}  ORDER BY ${filtered_query_data.column} ${filtered_query_data.sort}
			 LIMIT ${filtered_query_data.limit} OFFSET ${filtered_query_data.page} `	
			 
			queryCount =`SELECT count(*)
			FROM user_employments "job_posting" 
			LEFT JOIN employer_profiles "employer" ON (job_posting.company = employer.id)
			where job_posting.status != 3 AND job_posting.status != 0  AND (job_posting.created_at > (select now() - interval ' ${filtered_query_data.day} day '))   ${searchQuery} `	
				}
				if(filtered_query_data.view =='employer-active'){ 
			query =`SELECT  employer.first_name as first_name,job_posting.title as title,job_posting.created_at as created_at,
			json_build_object('first_name',employer.first_name,'last_name',employer.last_name) AS "employer" ,
			(SELECT COUNT(*) FROM  job_applications "job_application" where
			(job_application.status=1) AND (job_application.short_listed IS NULL or job_application.short_listed != true) 
			 AND (job_application.job_posting=job_posting.id)) as applicant,
			 (SELECT COUNT(*) FROM  job_applications "job_application" where
			(job_posting.status != 3 AND  job_application.status=2 ) 
			 AND (job_application.job_posting=job_posting.id)) as hired,
			 (SELECT COUNT(*) FROM  job_applications "job_application" where
			(job_posting.status != 3 AND  job_application.status=4 ) 
			 AND (job_application.job_posting=job_posting.id)) as rejected 
			FROM user_employments "job_posting" 
			LEFT JOIN employer_profiles "employer" ON (job_posting.company = employer.id)
			where job_posting.status != 3  AND (job_posting.created_at > (select now() - interval ' ${filtered_query_data.day} day ')) AND job_posting.status != 1  ${searchQuery}  ORDER BY ${filtered_query_data.column} ${filtered_query_data.sort}
			 LIMIT ${filtered_query_data.limit} OFFSET ${filtered_query_data.page}`	
			 
			queryCount =`SELECT count(*)
			FROM user_employments "job_posting" 
			LEFT JOIN employer_profiles "employer" ON (job_posting.company = employer.id)
			where job_posting.status != 3 AND job_posting.status != 1  AND (job_posting.created_at > (select now() - interval ' ${filtered_query_data.day} day '))  ${searchQuery} `	
				}
				
				if(filtered_query_data.search){
					searchQuery =`AND ((user_profile.city like '%${filtered_query_data.search}%') OR 
					(user_profile.first_name like '%${filtered_query_data.search}%' )	OR
					(user_profile.country like '%${filtered_query_data.search}%' )	OR
					(user_profile.job_role like '%${filtered_query_data.search}%' )	OR
					(user_profile.last_name like '%${filtered_query_data.search}%' )	
					
					)`;
				}
				if(filtered_query_data.view =='user'){ 
			query =`SELECT user_profile.first_name,user_profile.last_name,user_profile.created_at,
				user_profile.city,user_profile.state,user_profile.country,user_profile.job_role
				FROM  user_profiles "user_profile" where  (user_profile.created_at > (select now() - interval ' ${filtered_query_data.day} day '))  ${searchQuery}  ORDER BY ${filtered_query_data.column} ${filtered_query_data.sort}
			 LIMIT ${filtered_query_data.limit} OFFSET ${filtered_query_data.page}`	
			 
			queryCount =`SELECT count(*)
				FROM  user_profiles "user_profile"  where  (user_profile.created_at > (select now() - interval ' ${filtered_query_data.day} day '))  ${searchQuery} `	
				}
				if(filtered_query_data.view =='user-available'){ 
			query =`SELECT user_profile.first_name,user_profile.last_name,user_profile.created_at,
				user_profile.city,user_profile.state,user_profile.country,user_profile.job_role
				FROM  user_profiles "user_profile"  where  (user_profile.created_at > (select now() - interval ' ${filtered_query_data.day} day ')) AND 
				 ((user_profile.privacy_protection->>'available_for_opportunity')::text = 'true' )   ${searchQuery} 
				 ORDER BY ${filtered_query_data.column} ${filtered_query_data.sort}
			 LIMIT ${filtered_query_data.limit} OFFSET ${filtered_query_data.page}`	
			 
			queryCount =`SELECT  count(*)
				FROM  user_profiles "user_profile"  where  (user_profile.created_at > (select now() - interval ' ${filtered_query_data.day} day ')) AND 
				 ((user_profile.privacy_protection->>'available_for_opportunity')::text = 'true' )   ${searchQuery} `	
				}
				if(filtered_query_data.view =='user-notavailable'){ 
			query =`SELECT user_profile.first_name,user_profile.last_name,user_profile.created_at,
				user_profile.city,user_profile.state,user_profile.country,user_profile.job_role
				FROM  user_profiles "user_profile"   where  (user_profile.created_at > (select now() - interval ' ${filtered_query_data.day} day ')) AND 
				 ((user_profile.privacy_protection->>'available_for_opportunity')::text != 'true' ) 	  ${searchQuery} 			
				ORDER BY ${filtered_query_data.column} ${filtered_query_data.sort}
			 LIMIT ${filtered_query_data.limit} OFFSET ${filtered_query_data.page}`	
			 
			queryCount =`SELECT  count(*)
				FROM  user_profiles "user_profile"   where  (user_profile.created_at > (select now() - interval ' ${filtered_query_data.day} day ')) AND 
				 ((user_profile.privacy_protection->>'available_for_opportunity')::text != 'true' )   ${searchQuery}  `	
				}
			sails.sendNativeQuery(query, async function(err, Count_Users_value) {
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
					sails.sendNativeQuery(queryCount, async function(err, Count_value) {
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
							
							return callback(_.get(Count_Users_value, 'rows'),_.get(Count_value, 'rows'));
							
						}
					});
					
				}
			});
		
    };


    //Build and sending response
    const sendResponse = (users,Count_value) => {
        _response_object.message = 'Dashboard Details successfully .';
        var meta = {};
        _response_object['data'] = users;
        _response_object['Count'] = Count_value;
        meta['page'] = filtered_query_data.page ? filtered_query_data.page : 1;
        meta['limit'] = filtered_query_data.limit;
       
        return response.ok(_response_object);
    };

    //Validating the request and pass on the appriopriate response
    validateModel.validate(null, input_attributes, filtered_query_data, async function(valid, errors) {
        if (valid) {
            
            //Preparing data
            await getListDatas( function(users,Count_value) {
                sendResponse(users,Count_value);
            });
        } else {
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });

};
