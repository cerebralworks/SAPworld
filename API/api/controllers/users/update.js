/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/* global _, UserProfiles, UserInformation, Users, sails */
module.exports = async function update(request, response) {
    const post_request_data = request.body;
    const logged_in_user = request.user;
    post_request_data.id = logged_in_user.id;
    var _response_object = {};
    let yup = sails.yup;
    let schema = yup.object().shape({
        id: yup.number().test('user_profile', 'Cant find record', async(value) => {
            return await UserProfiles.find().where({ account: value }).limit(1).then(result => {
                return result.length > 0 ? true : false;
            })
        }),
        first_name: yup.string().required().lowercase().min(3),
        last_name: yup.string().required().lowercase(),
        bio: yup.string(),
        country: yup.string().required().lowercase(),
        state: yup.string().required().lowercase(),
        city: yup.string().required().lowercase(),
        zipcode: yup.number().required().positive().moreThan(1000),
        phone: yup.string().matches(/^([0|\+[0-9]{1,5})?([0-9]{10})$/, 'Mobile number must be like +919999999999'),
        /* latlng: yup.object().shape({
            lat: yup.number().min(-90).max(90),
            lng: yup.number().min(-180).max(180),
        }).required(), */
        education_qualification: yup.array().of(
            yup.object().shape({
                degree: yup.string().lowercase().required(),
                field_of_study: yup.string().lowercase().required(),
                year_of_completion: yup.number().positive().required()
            })
        ).default([]),
        preferred_locations: yup.array().of(
            yup.object().shape({
                city: yup.string().lowercase(),
                state: yup.string().lowercase(),
                country: yup.string().lowercase()
            })
        ).default([]),
        experience: yup.number().positive().default(1).required(),
        sap_experience: yup.number().positive().default(1).required(),
        current_employer: yup.string().required().lowercase(),
        current_employer_role: yup.string().required().lowercase(),
        domains_worked: yup.array().of(yup.number().positive()).required(),
        clients_worked: yup.array().of(yup.string()),
        hands_on_experience: yup.array().of(yup.object().shape({
            skill_id: yup.number().required().positive(),
            skill_name: yup.string().required().lowercase(),
            experience: yup.number().required().positive(),
            exp_type: yup.string().required().lowercase().oneOf(['years', 'months']),
        })).required(),
        skills: yup.array().of(yup.number().positive()),
        programming_skills: yup.array().of(yup.string()).required(),
        other_skills: yup.array().of(yup.string()),
        certification: yup.array().of(yup.string()),
        job_type: yup.array().of(yup.string()),
        job_role: yup.string().default(''),
        preferred_location: yup.number().oneOf([0, 1, 2, 3, 4, 5, 6, 7]),
        availability: yup.number().required().oneOf([0, 15, 30, 45, 60]),
        travel: yup.number().required().oneOf([0, 25, 50, 75, 100]),
        work_authorization: yup.boolean(),
        willing_to_relocate: yup.boolean().required(),
        remote_only: yup.boolean().required(),
        end_to_end_implementation: yup.number().min(0),
        privacy_protection: yup.object().shape({
            photo: yup.boolean().default(true),
            phone: yup.boolean().default(true),
            email: yup.boolean().default(true),
            current_employer: yup.boolean().default(true),
            available_for_opportunity: yup.boolean().default(true),
        }),
    });
    await schema.validate(post_request_data, { abortEarly: false }).then(async value => {
		if(value.latlng['lng'] && value.latlng['lng'] !=undefined && value.latlng['lng'] !="undefined" &&
		value.latlng['lat'] && value.latlng['lat'] !=undefined && value.latlng['lat'] !="undefined"){
		var point = value.latlng['lng'] + ' ' + value.latlng['lat'];
        value.latlng_text = value.latlng.lat + ',' + value.latlng.lng;
        value.latlng = 'SRID=4326;POINT(' + point + ')';
		}else{
			var point = "1.00" + ' ' + "5.00";
			value.latlng_text = "1.00" + ',' + "5.00";
			value.latlng = 'SRID=4326;POINT(' + point + ')';	
		}
		if(value.phone){
			await phoneEncryptor.encrypt(value.phone, function(encrypted_text) {
				value.phone = encrypted_text;
			});
		}else{
			value.phone =null;
		}
        value.status = 1;
		var arr1= value.skills;
		var arr2= value.hands_on_experience;
		if ( arr2 && Array.isArray(arr2)) {
			arr2 = arr2.filter(function(a,b){ return a.skill_id!=null && a.skill_id!='' });
			value.hands_on_skills = arr2.map(function(a,b){ return a.skill_id });
		}else{
			value.hands_on_skills =[];
		}
		var arr3= value.language_known;
		if (arr3 &&  Array.isArray(arr3) ) {
			arr3 = arr3.filter(function(a,b){ return a.language!=null && a.language!='' });
			value.language_id = arr3.map(function(a,b){ return a.language });
			
		}else{
			value.language_id = [];
		}
		var arr4= value.education_qualification;
		if (arr4 &&  Array.isArray(arr4) ) {
			arr4 = arr4.filter(function(a,b){ return a.degree!=null && a.degree!='' });
			value.education_degree = arr4.map(function(a,b){ return a.degree });
		}else{
			value.education_degree = [];
		}
		var arr5= value.preferred_locations;
		if (arr5 &&  Array.isArray(arr5) ) {
			arr5 = arr5.filter(function(a,b){ return a.country!=null && a.country!='' });
			value.other_countries = arr5.map(function(a,b){ return a.country });
			value.other_cities = arr5.map(function(a,b){ return a.city });
		}else{
			value.other_countries = [];
			value.other_cities = [];
		}
		//console.log(value);
		//Update the user profile details
        UserProfiles.update(logged_in_user.user_profile.id, value, async function(err, profile) {
            if (err) {
                await errorBuilder.build(err, function(error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            } else {
                var status = value.available_for_opportunity == false ? 7 : logged_in_user.status;
                Users.update(logged_in_user.id, { status: status }, function(err, profile) {});
                if (profile[0].email) {
                    delete profile[0].email;
                }
                if (profile[0].phone) {
                    delete profile[0].phone;
                }
                _response_object.message = 'Profile has been updated successfully.';
                _response_object.details = profile;
				
				var checkDetails = profile[0];
				//GET NATIONALITY ID TO STRING
				await Country.find({ id: checkDetails.nationality }).then(nationality => {
					checkDetails.nationality = nationality.map(function(value) {
						return value.nicename;
					});
				});
				//GET AUTHORIZED COUNTRY ID TO STRING
				if(checkDetails.authorized_country && checkDetails.authorized_country.length && checkDetails.authorized_country !=0){
					
					await Country.find({ id: checkDetails.authorized_country }).then(authorized_country => {
						checkDetails.authorized_country = authorized_country.map(function(value) {
							return value.nicename;
						});
					});
				}
				if(checkDetails.work_authorization == 1){
					var Count_Users = `SELECT  job_posting.* FROM user_employments "job_posting"
	CROSS JOIN user_profiles "user_profile" 
	LEFT JOIN users "user_account" ON (user_account.id=user_profile.account) 
	WHERE (job_posting.status = 1) AND user_profile.job_type && ARRAY[job_posting.type]::TEXT[] AND (user_profile.id = ${checkDetails.id}) AND
	(user_account.status=1) AND (job_posting.visa_sponsorship = true OR (( user_profile.country like job_posting.country OR  user_profile.other_countries && ARRAY[job_posting.country]::TEXT[] ) AND ( user_profile.city like job_posting.city OR  user_profile.other_cities && ARRAY[job_posting.city]::TEXT[] )) ) AND user_profile.hands_on_skills && job_posting.hands_on_skills 
	AND (COALESCE(user_profile.experience) >= job_posting.experience) group by job_posting.id `
				}else{
					var Count_Users = `SELECT  job_posting.* FROM user_employments "job_posting"
	CROSS JOIN user_profiles "user_profile" 
	LEFT JOIN users "user_account" ON (user_account.id=user_profile.account) 
	WHERE (job_posting.status = 1) AND user_profile.job_type && ARRAY[job_posting.type]::TEXT[] AND (user_profile.id = ${checkDetails.id}) AND
	(user_account.status=1) AND ((( user_profile.country like job_posting.country OR  user_profile.other_countries && ARRAY[job_posting.country]::TEXT[] ) AND ( user_profile.city like job_posting.city OR  user_profile.other_cities && ARRAY[job_posting.city]::TEXT[] )) ) AND user_profile.hands_on_skills && job_posting.hands_on_skills 
	AND (COALESCE(user_profile.experience) >= job_posting.experience) group by job_posting.id `
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
					if(Count_Users_value.rowCount!=0){
						var responseMatch = Count_Users_value['rows'];
						var ScoreMasters = await ScoreMaster.find();
						ScoreMasters = ScoreMasters[0];
						var arrayValue =[];
							await Scoring.destroy(checkDetails.id);
						for(let i=0;i<responseMatch.length;i++){
							var TotalCheckItems = 15;
							updated_job = responseMatch[i];
							arrayValue.push({});
							//TOTAL EXPERIENCE CHECKING
							if(checkDetails['experience'] >= updated_job['experience']){
								arrayValue[i]['total_experience'] = 100 * ScoreMasters['total_experience'];
							}else{
								arrayValue[i]['total_experience'] = 0  * ScoreMasters['total_experience'];
							}
							//SAP EXPERIENCE CHECKING
							if(checkDetails['sap_experience'] >= updated_job['sap_experience']){
								arrayValue[i]['sap_experience'] = 100 * ScoreMasters['sap_experience'];
							}else{
								arrayValue[i]['sap_experience'] = 0 * ScoreMasters['sap_experience'];
							}
							//JOB TYPE CHECKING
							if(checkDetails.job_type.includes(updated_job.type)){
								arrayValue[i]['job_types'] = 100 * ScoreMasters['job_types'];
							}else{
								arrayValue[i]['job_types'] = 0 * ScoreMasters['job_types'];
							}
							//WORK AUTHORIZATION CHECKING
							if(updated_job.work_authorization ==null || updated_job.work_authorization ==undefined){
								//arrayValue[i]['work_auth'] = 100 * ScoreMasters['work_auth'];
								arrayValue[i]['work_auth'] = 0;
								TotalCheckItems = TotalCheckItems-1;
							}else if(updated_job.work_authorization){
								if(checkDetails.work_authorization ==1 && updated_job.visa_sponsorship == true){
									arrayValue[i]['work_auth'] = 100 * ScoreMasters['work_auth'];
								}
								if(updated_job.work_authorization ==0 ){
									if(updated_job.country.toLocaleLowerCase() == checkDetails.nationality.toLocaleLowerCase()){
										arrayValue[i]['work_auth'] = 100 * ScoreMasters['work_auth'];
									}else{
										arrayValue[i]['work_auth'] = 0 * ScoreMasters['work_auth'];
									}
								}
								if(updated_job.work_authorization ==1 ){
									if(checkDetails.authorized_country && checkDetails.authorized_country.length && checkDetails.authorized_country !=0){
										if(checkDetails.authorized_country.filter(function(a,b){ return a.toLocaleLowerCase() == updated_job.country.toLocaleLowerCase() }).length !=0){
											arrayValue[i]['work_auth'] = 100 * ScoreMasters['work_auth'];
										}else{
											arrayValue[i]['work_auth'] = 0 * ScoreMasters['work_auth'];
										}
									}else{
										arrayValue[i]['work_auth'] = 0 * ScoreMasters['work_auth'];
									}
								}
								if(updated_job.work_authorization ==2 ){
									arrayValue[i]['work_auth'] = 100 * ScoreMasters['work_auth'];
								}
										
							}
							//LOCATION CHECKING
							arrayValue[i]['job_location'] =100 * ScoreMasters['job_location'];
							//KNOWLEDGE CHECKING
							if(!updated_job.skills || !updated_job.skills.length || updated_job.skills.length ==0){
								arrayValue[i]['knowledge'] = 0;
								TotalCheckItems = TotalCheckItems-1;
							}else{
								updated_job.skills = updated_job.skills.filter(function(item, pos) {
									return !updated_job.hands_on_skills.includes(item) ;
								})
								if(!updated_job.skills || updated_job.skills.length ==0){
									//arrayValue[i]['knowledge'] =100 * ScoreMasters['knowledge'];
									arrayValue[i]['work_auth'] = 0;
									TotalCheckItems = TotalCheckItems-1;
								}else{
									var getDetails = updated_job.skills.filter(function(item, pos) {
										return checkDetails.skills.includes(item);
									});
									var lengthData = (getDetails.length/updated_job.skills.length)*100;
									arrayValue[i]['knowledge'] =lengthData  * ScoreMasters['knowledge'];
								}
							}
							//HANDS ON EXPERIENCE CHECKING
							var hands_on_Length = updated_job.hands_on_skills.filter(function(item, pos) {
								return checkDetails.hands_on_skills.includes(item);
							})
							checkDetails.skills = checkDetails.skills.filter(function(item, pos) {
								return !checkDetails.hands_on_skills.includes(item);
							})
							var hands_on_Length_skills = updated_job.hands_on_skills.filter(function(item, pos) {
								return checkDetails.skills.includes(item);
							})
							var lengthDatas = ((hands_on_Length.length/updated_job.hands_on_skills.length*100 )+
											(hands_on_Length_skills.length/updated_job.hands_on_skills.length*25 ))
							arrayValue[i]['hands_on_experience'] =lengthDatas  * ScoreMasters['hands_on_experience'];
							//END TO END IMPLEMENTATION CHECKING
							if(!checkDetails['end_to_end_implementation']){
								arrayValue[i]['end_to_end_implemention'] = 0;
								TotalCheckItems = TotalCheckItems-0.5;
							}else{
								if(checkDetails['end_to_end_implementation'] >= updated_job['end_to_end_implementation']){
									arrayValue[i]['end_to_end_implemention'] = 100  * ScoreMasters['end_to_end_implemention'];
								}else{
									arrayValue[i]['end_to_end_implemention'] = 0  * ScoreMasters['end_to_end_implemention'];
								}
							}
							//EDUCATION CHECKING
							const educationItems = _.values(_.get(sails, 'config.custom.educationItems', {}));
							if(!updated_job.education){
								//arrayValue[i]['education'] = 100  * ScoreMasters['education'];
								arrayValue[i]['education'] = 0;
								TotalCheckItems = TotalCheckItems-0.25;
							}else{							
								if(checkDetails.education_qualification && checkDetails.education_qualification.length && checkDetails.education_qualification.length !=0 ){
									var datas = educationItems.filter((el) => {
										return checkDetails.education_qualification.some((f) => {
											return f.degree === el.text ;
										});
									});
									value = educationItems.filter(function(a,b){return a.text.toLocaleLowerCase() == updated_job.education.toLocaleLowerCase()})[0]['id'];
									
									if(datas.filter(function(a,b){ return a.id >= value }).length !=0 ){
										arrayValue[i]['education'] = 100 * ScoreMasters['education'];
									}else{
										arrayValue[i]['education'] = 0 * ScoreMasters['education'];
									}
					
								}else{
									arrayValue[i]['education'] = 0 * ScoreMasters['education'];
								}
							}
							// ROLE TYPE CHECKING
							if(!updated_job['employer_role_type']){
								//arrayValue[i]['job_role'] = 100 * ScoreMasters['job_role'];
								arrayValue[i]['job_role'] = 0;
								TotalCheckItems = TotalCheckItems-1;
							}else{
								if(!checkDetails['employer_role_type']){
									arrayValue[i]['job_role'] = 0 * ScoreMasters['job_role'];
								}else if(checkDetails['employer_role_type'].toLocaleLowerCase() == updated_job['employer_role_type'].toLocaleLowerCase()){
									arrayValue[i]['job_role'] = 100 * ScoreMasters['job_role'];
								}else{
									arrayValue[i]['job_role'] = 0 * ScoreMasters['job_role'];
								}
							}
							//AVAILABILITY CHECKING
							if(updated_job['availability'] ==null || updated_job['availability'] == undefined ){
								arrayValue[i]['availability'] = 100 * ScoreMasters['availability'];
							}else{
								if(checkDetails['availability'] ==null || checkDetails['availability'] == undefined ){
									arrayValue[i]['availability'] = 0 * ScoreMasters['availability'];
								}else if(updated_job['availability'] >= checkDetails['availability'] ){
									arrayValue[i]['availability'] = 100 * ScoreMasters['availability'];
								}else{
									arrayValue[i]['availability'] = 0 * ScoreMasters['availability'];
								}
							}
							//CERTIFICATION SKILLS CHECKING
							if(!updated_job['certification']){
								//arrayValue[i]['certification'] = 100 * ScoreMasters['certification'];
								arrayValue[i]['certification'] = 0;
								TotalCheckItems = TotalCheckItems-1;
							}else{
								if(!checkDetails['certification']){
									arrayValue[i]['certification'] = 0 * ScoreMasters['certification'];									
								}else if(updated_job['certification']){
									var certification = updated_job.certification.filter((el) => {
										return checkDetails.certification.some((f) => {
											return f.toLocaleLowerCase() == el.toLocaleLowerCase() ;
										});
									});
									if(certification.length !=0){
										certification	=(certification.length/updated_job.certification.length*100);
										arrayValue[i]['certification'] = certification * ScoreMasters['certification'];
									}else{
										arrayValue[i]['certification'] = 0 * ScoreMasters['certification'];
									}
								}
							}
							//PROGRAMMING SKILLS CHECKING
							if(!updated_job['programming_skills']){
								arrayValue[i]['programming'] = 100 * ScoreMasters['programming'];
							}else{
								if(!checkDetails['programming_skills']){
									arrayValue[i]['programming'] = 0 * ScoreMasters['programming'];									
								}else if(updated_job['programming_skills']){
									var programming = updated_job.programming_skills.filter((el) => {
										return checkDetails.programming_skills.some((f) => {
											return f.toLocaleLowerCase() == el.toLocaleLowerCase() ;
										});
									});
									if(programming.length !=0){
										programming	=(programming.length/updated_job.programming_skills.length*100);
										arrayValue[i]['programming'] = programming * ScoreMasters['programming'];
									}else{
										arrayValue[i]['programming'] = 0 * ScoreMasters['programming'];
									}
								}
							}
							//OPTIONAL  SKILLS CHECKING
							if(!updated_job['optinal_skills']){
								arrayValue[i]['other_skills'] = 100 * ScoreMasters['other_skills'];
							}else{
								if(!checkDetails['other_skills']){
									arrayValue[i]['other_skills'] = 0 * ScoreMasters['other_skills'];									
								}else if(updated_job['optinal_skills']){
									var other_skills = updated_job.optinal_skills.filter((el) => {
										return checkDetails.other_skills.some((f) => {
											return f.toLocaleLowerCase() == el.toLocaleLowerCase() ;
										});
									});
									if(other_skills.length !=0){
										other_skills=(other_skills.length/updated_job.optinal_skills.length*100);
										arrayValue[i]['other_skills'] = other_skills * ScoreMasters['other_skills'];
									}else{
										arrayValue[i]['other_skills'] = 0  * ScoreMasters['other_skills'];
									}
								}
							}
							//DOMAIN CHECKING
							if(!updated_job['domain']){
								arrayValue[i]['domain'] = 100 * ScoreMasters['domain'];
							}else{
								if(!checkDetails['domains_worked']){
									arrayValue[i]['domain'] = 0 * ScoreMasters['domain'];									
								}else if(updated_job['domain']){
									var domains_worked = updated_job.domain.filter((el) => {
										return checkDetails.domains_worked.some((f) => {
											return parseInt(f) == parseInt(el) ;
										});
									});
									if(domains_worked.length !=0){
										domains_worked=(domains_worked.length/updated_job.domain.length*100);
										arrayValue[i]['domain'] = domains_worked * ScoreMasters['domain'];
									}else{
										arrayValue[i]['domain'] = 0 * ScoreMasters['domain'];
									}
								}
							}
							//CHECK REMOTE
							if(updated_job['remote'] == checkDetails['remote_only']){
								arrayValue[i]['remote'] = 100 * ScoreMasters['remote'];
							}else{
								arrayValue[i]['remote'] = 0 * ScoreMasters['remote'];
							}
							//CHECK TRAVEL
							if(checkDetails.travel >=updated_job.travel_opportunity){
								arrayValue[i]['travel'] = 100 * ScoreMasters['travel'];
							}else{
								arrayValue[i]['travel'] = 0 * ScoreMasters['travel'];
							}
							//LANGUAGE CHECKING
							if(!updated_job['language'] || !updated_job['language'].length || updated_job['language'].length ==0 ){
								//arrayValue[i]['language'] = 100 * ScoreMasters['language'];
								arrayValue[i]['language'] = 0;
								TotalCheckItems = TotalCheckItems-0.25;
							}else{
								if(!checkDetails['language_id']){
									arrayValue[i]['language'] = 0 * ScoreMasters['language'];									
								}else if(updated_job['language']){
									var language_id = updated_job.language.filter((el) => {
										return checkDetails.language_id.some((f) => {
											return parseInt(f) == parseInt(el) ;
										});
									});
									if(language_id.length !=0){
										language_id=(language_id.length/updated_job.language.length*100);
										arrayValue[i]['language'] = language_id * ScoreMasters['language'];
									}else{
										arrayValue[i]['language'] = 0 * ScoreMasters['language'];
									}
								}
							}
							arrayValue[i]['score'] = Object.keys(arrayValue[i]).reduce((sum,key)=>sum+parseFloat(arrayValue[i][key]||0),0);
							arrayValue[i]['score'] =arrayValue[i]['score']/(10*TotalCheckItems);
							arrayValue[i]['job_id'] = updated_job['id'];
							arrayValue[i]['user_id'] = checkDetails['id'];
							var post_data ={};
							post_data['user_id'] = arrayValue[i]['user_id'];
							
							post_data['job_id'] = arrayValue[i]['job_id'];
							await Scoring.find(post_data).exec(async(err, user)=> {
								if (err) {
									console.log(err);
								} else {
									if(user.length ==0){
										var post_datas =arrayValue[i];
										await Scoring.create(post_datas, function(err, job) {
											if (err) {
												console.log(err)
											} else{
												var created = true;
												return created;
											}
										}); 

									}else{
										var post_datas =arrayValue[i];
										post_data = user[0]['id'];
										await Scoring.update(post_data, post_datas, function(err, job) {
											if (err) {
												console.log(err)
											} else{
												var created = true;
												return created;
											}
										}); 
									}
								}
							});
							
						}
						
					}
						
					}
				});
                return response.status(200).json(_response_object);
            }
        });
    }).catch(err => {
        _response_object.errors = err.inner;
        _response_object.count = err.inner.length;
        return response.status(400).json(err.inner);
    });

};