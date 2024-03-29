

/* global _, JobPostings, sails */

module.exports = function create(request, response) {
    const post_request_data = request.body;
    const request_query = request.allParams();
    const logged_in_user = request.user;
    var _response_object = {};
    let yup = sails.yup;
	var comanyid;
	var programming_id = [];
	var programming_ids = '';
	var programming_skills = [];
	    if(post_request_data.emp_id !=undefined){
			comanyid=post_request_data.emp_id
		}else{
            comanyid=logged_in_user.employer_profile.id;
		}
	for(let i=0;i<post_request_data.programming_skills.length;i++){
		if(post_request_data.programming_skills[i] !=null &&post_request_data.programming_skills[i] !=undefined){
			post_request_data.programming_skills[i] = post_request_data.programming_skills[i].replace(/\b\w/g, l => l.toUpperCase());
			programming_skills.push(post_request_data.programming_skills[i]);
		}
	}
	for(let i=0;i<post_request_data.programming_skills.length;i++){
		if(post_request_data.programming_skills[i] !=null &&post_request_data.programming_skills[i] !=undefined){
			var tempCriteria = {'name':post_request_data.programming_skills[i]};
			programming_ids = Program.findOrCreate(tempCriteria,tempCriteria,function (err, record){
				if(record && record['id']){
					programming_id.push(record['id']);
				}
			});
		}
	}
    let schema = yup.object().shape({
        id: yup.number().positive().test('id', 'cant find any record', async(value) => {
            let query = { id: value, company: comanyid };
            return await JobPostings.findOne(query).then(job => {
                //console.log(job)
                return true;
            }).catch(err => {
                //console.log(err)
                return false
            });
        }),
        title: yup.string().required().lowercase().min(3),
        type: yup.string().required(),
        description: yup.string(),
        salary_type: yup.number().oneOf([0, 1, 2]).nullable(true),
        salary_currency: yup.string().min(3).max(10).lowercase().nullable(true),
        salary: yup.number().positive().nullable(true),
        /* country: yup.string().required().lowercase(),
        state: yup.string().required().lowercase(),
        city: yup.string().required().lowercase(),
        zipcode: yup.number().required().positive().moreThan(1000), */
        availability: yup.number().required().oneOf([0, 15, 30, 45, 60]),
        latlng: yup.object().shape({
            lat: yup.number().min(-90).max(90),
            lng: yup.number().min(-180).max(180),
        }).required(),
		job_locations: yup.array().of(yup.object().shape({
            country: yup.string().required().lowercase(),
			state: yup.string().lowercase().nullable(true),
			city: yup.string().required().lowercase(),
			stateshort: yup.string().required().uppercase(),
			countryshort: yup.string().required().uppercase(),
        })).required(),
        experience: yup.number().min(0).default(0).required(),
        sap_experience: yup.number().min(0).default(0).required(),
        domain: yup.array().of(yup.number().positive()),
        hands_on_experience: yup.array().of(yup.object().shape({
            skill_id: yup.number().required().positive(),
            skill_name: yup.string().required().lowercase(),
            experience: yup.number().required().positive(),
            exp_type: yup.string().required().lowercase().oneOf(['years', 'months']),
        })).required(),
        skills: yup.array().of(yup.number().positive()),
        programming_skills: yup.array().of(yup.string()).required(),
        programming_id: yup.array().of(yup.string()),
        optinal_skills: yup.array().of(yup.string()),
        certification: yup.array().of(yup.string()),
        travel_opportunity: yup.number().required().oneOf([0, 25, 50, 75, 100]),
		work_authorization:yup.number().default(null).nullable(true),
        visa_sponsorship: yup.boolean(),
        must_match: yup.object().nullable(),
        end_to_end_implementation: yup.number().min(0),
        extra_criteria: yup.array().of(yup.object().shape({
            title: yup.string().required().lowercase(),
            value: yup.string().required().lowercase()
        })).nullable(),
        number_of_positions: yup.number().required().positive(),
        contract_duration: yup.number().min(0).when("type", {
            is: (val) => { val == 5 ? true : false },
            then: yup.string().required()
        }),
    });
    //Update the JobPostings record to db.
    const updateRecord = (post_data, callback) => {
        JobPostings.update(post_data.id, post_data, async function(err, job) {
            if (err) {
                await errorBuilder.build(err, function(error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            } else {
                //return callback(job[0]);
				var loc = job[0]['job_locations'];
				var jobid = job[0]['id'];
				JobLocation.find({jobid : jobid}).then(async function(data){
					 var res2 = loc.filter((a) => !data.some(b => a.city === b.city && a.country === b.country ))
					 var res1 = data.filter((a) => !loc.some(b => a.city === b.city && a.country === b.country ))
					 if(res2.length!==0){
					     res2 = res2.map(function(a,b){ 
							if(!a.zipcode){
								a.zipcode ='';
							}
							if(!a.state){
								a.state ='';
							}
							return{
								'jobid':jobid,
								'city':a.city,
								'state':a.state,
								'stateshort':a.stateshort,
								'countryshort':a.countryshort,
								'zipcode':a.zipcode,
								'country':a.country
							}
				        })
						var  insertCountry = await JobLocation.createEach(res2);
					 }
					 if(res1.length!==0){ 
						 var del = res1.map(a=>{return a.id;})
						 await JobApplications.update({job_location: { in: del }},{status : 0}).then()
						 //console.log(del)
						 await JobLocation.destroy({id: { in: del }}).then()
						 
					 }
					return callback(job[0]);
				})
				//var checkDetailsLocation = await JobLocation.find({'jobid' : job[0]['id']});
				//var insertElement = {'job_locations':checkDetailsLocation};
				//var insertData = await JobPostings.update(job[0]['id'], insertElement);
				//console.log(insertData);
               // return callback(job[0]);
            }
        });
    };
	//Validating the request and pass on the appriopriate response.
    schema.validate(post_request_data, { abortEarly: false }).then(async value => {
            if(post_request_data.emp_id !=undefined){
			await Users.find({employer_profile:post_request_data.emp_id}).then(data=>{
				 value.company = post_request_data.emp_id;
		         value.account = data[0].id;
				})
			}else{
			value.company = logged_in_user.employer_profile.id;
			value.account = logged_in_user.id;
			}
            var point = value.latlng['lng'] + ' ' + value.latlng['lat'];
            value.latlng_text = value.latlng.lat + ',' + value.latlng.lng;
            value.latlng = 'SRID=4326;POINT(' + point + ')';
			
			var arr2= value.hands_on_experience;
			if ( arr2 && Array.isArray(arr2)) {
				arr2 = arr2.filter(function(a,b){ return a.skill_id!=null && a.skill_id!='' });
				value.hands_on_skills = arr2.map(function(a,b){ return a.skill_id });
			}else{
				value.hands_on_skills =[];
			}
			if(!value.skills || !value.skills.length || value.skills.length ==0){
				value.skills = value.hands_on_skills;
			}
			value['programming_id'] = programming_id;
        value['programming_skills'] = programming_skills;
		    if(value.remote_option == null){
				value.remote_option=null;
			}
			if(value.salary==undefined){
				value.salary=0;
			}
            updateRecord(value, async function(updated_job) {
                _response_object.message = 'Job has been update successfully.';
                _response_object.details = updated_job;
				if(updated_job.entry ==true ){
					if(updated_job.visa_sponsorship ==true ){
					var Count_Users = `SELECT  user_profile.* as "job_id" FROM user_employments "job_posting"
		CROSS JOIN user_profiles "user_profile" 
		LEFT JOIN users "user_account" ON (user_account.id=user_profile.account) 
		LEFT JOIN job_location "locations" ON (locations.jobid= job_posting.id) 
		WHERE (locations.status = 1 OR locations.status = 98 )  AND user_profile.job_type && ARRAY[job_posting.type]::TEXT[] AND (job_posting.id = ${parseInt(updated_job.id)}) AND
		(user_account.status=1) AND (user_profile.work_authorization = 1 OR (( user_profile.country like locations.country OR  user_profile.other_countries && ARRAY[locations.country]::TEXT[] ) AND (( user_profile.city like locations.city OR  user_profile.other_cities && ARRAY[locations.city]::TEXT[] ) OR user_profile.willing_to_relocate =true ) ) )
		AND (COALESCE(user_profile.experience) >= job_posting.experience) AND (COALESCE(user_profile.experience) =0 ) group by user_profile.id `
					}else{
						var Count_Users = `SELECT  user_profile.* as "job_id" FROM user_employments "job_posting"
		CROSS JOIN user_profiles "user_profile" 
		LEFT JOIN users "user_account" ON (user_account.id=user_profile.account)
		LEFT JOIN job_location "locations" ON (locations.jobid= job_posting.id) 		
		WHERE (locations.status = 1 OR locations.status = 98 )  AND user_profile.job_type && ARRAY[job_posting.type]::TEXT[] AND (job_posting.id = ${parseInt(updated_job.id)}) AND
		(user_account.status=1) AND ( user_profile.country like locations.country OR  user_profile.other_countries && ARRAY[locations.country]::TEXT[] ) AND ( (( user_profile.city like locations.city OR  user_profile.other_cities && ARRAY[locations.city]::TEXT[]) OR ( user_profile.country like locations.country AND  user_profile.other_cities = '{}') AND user_profile.willing_to_relocate =true ) OR (user_profile.willing_to_relocate =false AND user_profile.city like locations.city ))
		AND (COALESCE(user_profile.experience) >= job_posting.experience)  AND (COALESCE(user_profile.experience) =0 ) group by user_profile.id `
					}

				}else{
					
					if(updated_job.visa_sponsorship ==true ){
					var Count_Users = `SELECT  user_profile.* as "job_id" FROM user_employments "job_posting"
		CROSS JOIN user_profiles "user_profile" 
		LEFT JOIN users "user_account" ON (user_account.id=user_profile.account) 
		LEFT JOIN job_location "locations" ON (locations.jobid= job_posting.id) 
		WHERE (locations.status = 1 OR locations.status = 98 )  AND user_profile.job_type && ARRAY[job_posting.type]::TEXT[] AND (job_posting.id = ${parseInt(updated_job.id)}) AND
		(user_account.status=1) AND (user_profile.work_authorization = 1 OR (( user_profile.country like locations.country OR  user_profile.other_countries && ARRAY[locations.country]::TEXT[] ) AND ( ( user_profile.city like locations.city OR  user_profile.other_cities && ARRAY[locations.city]::TEXT[] ) OR user_profile.willing_to_relocate =true ) ) ) AND 
		(( user_profile.hands_on_skills && job_posting.hands_on_skills ))
		AND (COALESCE(user_profile.experience) >= job_posting.experience) group by user_profile.id `
					}else{
						var Count_Users = `SELECT user_profile.* as "job_id" FROM user_employments "job_posting"
		CROSS JOIN user_profiles "user_profile" 
		LEFT JOIN users "user_account" ON (user_account.id=user_profile.account) 
		LEFT JOIN job_location "locations" ON (locations.jobid= job_posting.id) 
		WHERE (locations.status = 1 OR locations.status = 98 )  AND user_profile.job_type && ARRAY[job_posting.type]::TEXT[] AND (job_posting.id = ${parseInt(updated_job.id)}) AND
		(user_account.status=1) AND ( user_profile.country like locations.country OR  user_profile.other_countries && ARRAY[locations.country]::TEXT[] ) AND ( (( user_profile.city like locations.city OR  user_profile.other_cities && ARRAY[locations.city]::TEXT[]) OR ( user_profile.country like locations.country AND  user_profile.other_cities = '{}') AND user_profile.willing_to_relocate =true ) OR (user_profile.willing_to_relocate =false AND user_profile.city like locations.city )) AND 
		(( user_profile.hands_on_skills && job_posting.hands_on_skills ))
		AND (COALESCE(user_profile.experience) >= job_posting.experience) group by user_profile.id `
					}
				}
				var del = await Scoring.destroy({ job_id: updated_job.id });
				sails.sendNativeQuery(Count_Users, async function(err, Count_Users_value) {
					//console.log(Count_Users_value);
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
						var ScoreMasters ='';
						var ScoreMastersData = await ScoreMaster.find();
						ScoreMastersData = ScoreMastersData[0];
												// Validate the Score calculate value
						var tempSelect = Object.entries(updated_job.match_select).map(k =>{ 
							if(k[1] == "0"){
								return ({[k[0]]: ScoreMastersData['required'] });
							}if(k[1] == "1"){
								return({[k[0]]: ScoreMastersData['desired'] });
							}if(k[1] == "2"){
								return ({[k[0]]: ScoreMastersData['optional'] });
							}else{
								return ({[k[0]]: parseInt(0) });
							}
						});
						
						ScoreMasters = tempSelect.reduce(function(result, item) {
						  var key = Object.keys(item)[0]; //first property
						  result[key] = item[key];
						  return result;
						}, {});

						var arrayValue =[];
						//await Scoring.destroy(updated_job.id);
						for(let i=0;i<responseMatch.length;i++){
							checkDetails = responseMatch[i];
							var TotalCheckItems = 0;
							arrayValue.push({});
							//TOTAL EXPERIENCE CHECKING
							if(checkDetails['experience'] >= updated_job['experience']){
								arrayValue[i]['total_experience'] = 100 * ScoreMasters['experience'];
								TotalCheckItems = TotalCheckItems +ScoreMasters['experience'];
							}else{
								arrayValue[i]['total_experience'] = 0  * ScoreMasters['experience'];
								TotalCheckItems = TotalCheckItems +ScoreMasters['experience'];
							}
							//SAP EXPERIENCE CHECKING
							if(updated_job['entry']!=true){
								if(checkDetails['sap_experience'] >= updated_job['sap_experience']){
									arrayValue[i]['sap_experience'] = 100 * ScoreMasters['sap_experience'];
									TotalCheckItems = TotalCheckItems +ScoreMasters['sap_experience'];
								}else{
									arrayValue[i]['sap_experience'] = 0 * ScoreMasters['sap_experience'];
									TotalCheckItems = TotalCheckItems +ScoreMasters['sap_experience'];
								}								
							}
							//JOB TYPE CHECKING
							if(checkDetails.job_type.includes(updated_job.type)){
								arrayValue[i]['job_types'] = 100 * ScoreMasters['type'];
								TotalCheckItems = TotalCheckItems +ScoreMasters['type'];
							}else{
								arrayValue[i]['job_types'] = 0 * ScoreMasters['type'];
								TotalCheckItems = TotalCheckItems +ScoreMasters['type'];
							}
							//GET NATIONALITY ID TO STRING
							await Country.find({ id: checkDetails.nationality }).then(nationality => {
								checkDetails.nationality = nationality.map(function(value) {
									return value.nicename;
								});
								if(checkDetails.nationality.length!=0){
									checkDetails.nationality = checkDetails.nationality[0];
								}
							});
							//GET AUTHORIZED COUNTRY ID TO STRING
							if(checkDetails.authorized_country && checkDetails.authorized_country.length && checkDetails.authorized_country !=0){
								
								await Country.find({ id: checkDetails.authorized_country }).then(authorized_country => {
									checkDetails.authorized_country = authorized_country.map(function(value) {
										return value.nicename;
									});
								});
							}
							//WORK AUTHORIZATION CHECKING
							checkDetails['job_country'] =updated_job.job_locations[0]['country'];
							if(updated_job.work_authorization ==null || updated_job.work_authorization ==undefined){
								//arrayValue[i]['work_auth'] = 100 * ScoreMasters['work_auth'];
								arrayValue[i]['work_auth'] = 0;
							}else if( updated_job.work_authorization || updated_job.work_authorization == 1 || updated_job.work_authorization == 0 || updated_job.work_authorization == 2 ){
								if(checkDetails.work_authorization ==1 && updated_job.visa_sponsorship == true){
									arrayValue[i]['work_auth'] = 100 * ScoreMasters['work_authorization'];
									TotalCheckItems = TotalCheckItems +ScoreMasters['work_authorization'];
								}
								if(updated_job.work_authorization ==0 ){
									if(checkDetails.job_country.toLocaleLowerCase() == checkDetails.nationality.toLocaleLowerCase()){
										arrayValue[i]['work_auth'] = 100 * ScoreMasters['work_authorization'];
										TotalCheckItems = TotalCheckItems +ScoreMasters['work_authorization'];
									}else{
										arrayValue[i]['work_auth'] = 0 * ScoreMasters['work_authorization'];
										TotalCheckItems = TotalCheckItems +ScoreMasters['work_authorization'];
									}
								}
								if(updated_job.work_authorization ==1 ){
									if(checkDetails.job_country.toLocaleLowerCase() == checkDetails.nationality.toLocaleLowerCase()){
										arrayValue[i]['work_auth'] = 100 * ScoreMasters['work_authorization'];
										TotalCheckItems = TotalCheckItems +ScoreMasters['work_authorization'];
									}else if(checkDetails.authorized_country && checkDetails.authorized_country.length && checkDetails.authorized_country !=0){
										if(checkDetails.authorized_country.filter(function(a,b){ return a.toLocaleLowerCase() == checkDetails.job_country.toLocaleLowerCase() }).length !=0){
											arrayValue[i]['work_auth'] = 100 * ScoreMasters['work_authorization'];
											TotalCheckItems = TotalCheckItems +ScoreMasters['work_authorization'];
										}else{
											arrayValue[i]['work_auth'] = 0 * ScoreMasters['work_authorization'];
											TotalCheckItems = TotalCheckItems +ScoreMasters['work_authorization'];
										}
									}else if( updated_job.visa_sponsorship == false ){
										arrayValue[i]['work_auth'] = 100 * ScoreMasters['work_authorization'];
										TotalCheckItems = TotalCheckItems +ScoreMasters['work_authorization'];
									}else{
										arrayValue[i]['work_auth'] = 0 * ScoreMasters['work_authorization'];
										TotalCheckItems = TotalCheckItems +ScoreMasters['work_authorization'];
									}
								}
								if(updated_job.work_authorization ==2 ){
									arrayValue[i]['work_auth'] = 100 * ScoreMasters['work_authorization'];
									TotalCheckItems = TotalCheckItems +ScoreMasters['work_authorization'];
								}
										
							}
							//LOCATION CHECKING
							arrayValue[i]['job_location'] =100 * 1;
							TotalCheckItems = TotalCheckItems +1;
							//KNOWLEDGE CHECKING
							if(!updated_job.skills || !updated_job.skills.length || updated_job.skills.length ==0){
								arrayValue[i]['knowledge'] = 0;
							}else{
								updated_job.skills = updated_job.skills.filter(function(item, pos) {
									return !updated_job.hands_on_skills.includes(item) ;
								})
								if(!updated_job.skills || updated_job.skills.length ==0){
									//arrayValue[i]['knowledge'] =100 * ScoreMasters['knowledge'];
									arrayValue[i]['knowledge'] = 0;
								}else{
									var getDetails = updated_job.skills.filter(function(item, pos) {
										return checkDetails.skills.includes(item);
									});
									var lengthData = (getDetails.length/updated_job.skills.length)*100;
									arrayValue[i]['knowledge'] =lengthData  * ScoreMasters['skills'];
									TotalCheckItems = TotalCheckItems +ScoreMasters['skills'];
								}
							}
							//HANDS ON EXPERIENCE CHECKING
							if(updated_job['entry']!=true){
								if(!checkDetails.hands_on_skills || !checkDetails.hands_on_skills.length){
									checkDetails.hands_on_skills=[];
								}
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
								TotalCheckItems = TotalCheckItems +ScoreMasters['hands_on_experience'];
							}
							
							if(updated_job['entry']==true){
									if(updated_job['hands_on_experience'].length !=0){
									if(!checkDetails.hands_on_skills || !checkDetails.hands_on_skills.length){
										checkDetails.hands_on_skills=[];
									}
									var hands_on_Length = updated_job.hands_on_skills.filter(function(item, pos) {
										return checkDetails.hands_on_skills.includes(item);
									})
									checkDetails.skills = checkDetails.skills.filter(function(item, pos) {
										return !checkDetails.hands_on_skills.includes(item);
									})
									
									var lengthDatas = (hands_on_Length.length/updated_job.hands_on_skills.length*100 );
									arrayValue[i]['hands_on_experience'] =lengthDatas  * ScoreMasters['hands_on_experience'];
									TotalCheckItems = TotalCheckItems +ScoreMasters['hands_on_experience'];
										
									}else{
										arrayValue[i]['hands_on_experience'] =0;
										
									}	
								}
								
							//END TO END IMPLEMENTATION CHECKING
							if(!checkDetails['end_to_end_implementation']){
								arrayValue[i]['end_to_end_implemention'] = 0;
							}else{
								if(checkDetails['end_to_end_implementation'] >= updated_job['end_to_end_implementation']){
									arrayValue[i]['end_to_end_implemention'] = 100  * ScoreMasters['end_to_end_implementation'];
									TotalCheckItems = TotalCheckItems +ScoreMasters['end_to_end_implementation'];
									
									
								}else{
									arrayValue[i]['end_to_end_implemention'] = 0  * ScoreMasters['end_to_end_implementation'];
									TotalCheckItems = TotalCheckItems +ScoreMasters['end_to_end_implementation'];
								}
							}
							//EDUCATION CHECKING
							const educationItems = _.values(_.get(sails, 'config.custom.educationItems', {}));
							if(!updated_job.education){
								//arrayValue[i]['education'] = 100  * ScoreMasters['education'];
								arrayValue[i]['education'] = 0;
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
										TotalCheckItems = TotalCheckItems +ScoreMasters['education'];
									}else{
										arrayValue[i]['education'] = 0 * ScoreMasters['education'];
										TotalCheckItems = TotalCheckItems +ScoreMasters['education'];
									}
					
								}else{
									arrayValue[i]['education'] = 0 * ScoreMasters['education'];
									TotalCheckItems = TotalCheckItems +ScoreMasters['education'];
								}
							}
							// ROLE TYPE CHECKING
							if(!updated_job['employer_role_type']){
								//arrayValue[i]['job_role'] = 100 * ScoreMasters['job_role'];
								arrayValue[i]['job_role'] = 0;
							}else{
								if(!checkDetails['employer_role_type']){
									arrayValue[i]['job_role'] = 0 * ScoreMasters['employer_role_type'];
									TotalCheckItems = TotalCheckItems +ScoreMasters['employer_role_type'];
								}else if(checkDetails['employer_role_type'].toLocaleLowerCase() == updated_job['employer_role_type'].toLocaleLowerCase()){
									arrayValue[i]['job_role'] = 100 * ScoreMasters['employer_role_type'];
									TotalCheckItems = TotalCheckItems +ScoreMasters['employer_role_type'];
								}else{
									if(checkDetails['employer_role_type'].toLocaleLowerCase() == 'technofunctional'){
										arrayValue[i]['job_role'] = 100 * ScoreMasters['employer_role_type'];
										TotalCheckItems = TotalCheckItems +ScoreMasters['employer_role_type'];
									}else{
										arrayValue[i]['job_role'] = 0 * ScoreMasters['employer_role_type'];
										TotalCheckItems = TotalCheckItems +ScoreMasters['employer_role_type'];
									}
								}
							}
							//AVAILABILITY CHECKING
							if(updated_job['availability'] ==null || updated_job['availability'] == undefined ){
								arrayValue[i]['availability'] = 100 * ScoreMasters['availability'];
									TotalCheckItems = TotalCheckItems +ScoreMasters['availability'];
							}else{
								if(checkDetails['availability'] ==null || checkDetails['availability'] == undefined ){
									arrayValue[i]['availability'] = 0 * ScoreMasters['availability'];
									TotalCheckItems = TotalCheckItems +ScoreMasters['availability'];
								}else if(updated_job['availability'] >= checkDetails['availability'] ){
									arrayValue[i]['availability'] = 100 * ScoreMasters['availability'];
									TotalCheckItems = TotalCheckItems +ScoreMasters['availability'];
								}else{
									arrayValue[i]['availability'] = 0 * ScoreMasters['availability'];
									TotalCheckItems = TotalCheckItems +ScoreMasters['availability'];
								}
							}
							//CERTIFICATION SKILLS CHECKING
							if(!updated_job['certification']){
								//arrayValue[i]['certification'] = 100 * ScoreMasters['certification'];
								arrayValue[i]['certification'] = 0;
							}else{
								if(!checkDetails['certification']){
									arrayValue[i]['certification'] = 0 * ScoreMasters['certification'];	
									TotalCheckItems = TotalCheckItems +ScoreMasters['certification'];								
								}else if(updated_job['certification']){
									var certification = updated_job.certification.filter((el) => {
										return checkDetails.certification.some((f) => {
											return f.toLocaleLowerCase() == el.toLocaleLowerCase() ;
										});
									});
									if(certification.length !=0){
										certification	=(certification.length/updated_job.certification.length*100);
										arrayValue[i]['certification'] = certification * ScoreMasters['certification'];
										TotalCheckItems = TotalCheckItems +ScoreMasters['certification'];	
									}else{
										arrayValue[i]['certification'] = 0 * ScoreMasters['certification'];
										TotalCheckItems = TotalCheckItems +ScoreMasters['certification'];	
									}
								}
							}
							//PROGRAMMING SKILLS CHECKING
							if(!updated_job['programming_skills']){
								arrayValue[i]['programming'] = 100 * ScoreMasters['programming_skills'];
										TotalCheckItems = TotalCheckItems +ScoreMasters['programming_skills'];
							}else{
								if(!checkDetails['programming_skills']){
									arrayValue[i]['programming'] = 0 * ScoreMasters['programming_skills'];	
										TotalCheckItems = TotalCheckItems +ScoreMasters['programming_skills'];								
								}else if(updated_job['programming_skills']){
									var programming = updated_job.programming_skills.filter((el) => {
										return checkDetails.programming_skills.some((f) => {
											return f.toLocaleLowerCase() == el.toLocaleLowerCase() ;
										});
									});
									if(programming.length !=0){
										programming	=(programming.length/updated_job.programming_skills.length*100);
										arrayValue[i]['programming'] = programming * ScoreMasters['programming_skills'];
										TotalCheckItems = TotalCheckItems +ScoreMasters['programming_skills'];
									}else{
										arrayValue[i]['programming'] = 0 * ScoreMasters['programming_skills'];
										TotalCheckItems = TotalCheckItems +ScoreMasters['programming_skills'];
									}
								}
							}
							//OPTIONAL  SKILLS CHECKING
							if(!updated_job['optinal_skills']){
								arrayValue[i]['other_skills'] = 100 * ScoreMasters['optinal_skills'];
								TotalCheckItems = TotalCheckItems +ScoreMasters['optinal_skills'];
							}else{
								if(!checkDetails['other_skills']){
									arrayValue[i]['other_skills'] = 0 * ScoreMasters['optinal_skills'];
									TotalCheckItems = TotalCheckItems +ScoreMasters['optinal_skills'];									
								}else if(updated_job['optinal_skills']){
									var other_skills = updated_job.optinal_skills.filter((el) => {
										return checkDetails.other_skills.some((f) => {
											return f.toLocaleLowerCase() == el.toLocaleLowerCase() ;
										});
									});
									if(other_skills.length !=0){
										other_skills=(other_skills.length/updated_job.optinal_skills.length*100);
										arrayValue[i]['other_skills'] = other_skills * ScoreMasters['optinal_skills'];
										TotalCheckItems = TotalCheckItems +ScoreMasters['optinal_skills'];	
									}else{
										arrayValue[i]['other_skills'] = 0  * ScoreMasters['optinal_skills'];
										TotalCheckItems = TotalCheckItems +ScoreMasters['optinal_skills'];	
									}
								}
							}
							//DOMAIN CHECKING
							if(!updated_job['domain']){
								arrayValue[i]['domain'] = 100 * ScoreMasters['domain'];
								TotalCheckItems = TotalCheckItems +ScoreMasters['domain'];			
							}else{
								if(!checkDetails['domains_worked']){
									arrayValue[i]['domain'] = 0 * ScoreMasters['domain'];	
									TotalCheckItems = TotalCheckItems +ScoreMasters['domain'];	
								}else if(updated_job['domain']){
									var domains_worked = updated_job.domain.filter((el) => {
										return checkDetails.domains_worked.some((f) => {
											return parseInt(f) == parseInt(el) ;
										});
									});
									if(domains_worked.length !=0){
										domains_worked=(domains_worked.length/updated_job.domain.length*100);
										arrayValue[i]['domain'] = domains_worked * ScoreMasters['domain'];
										TotalCheckItems = TotalCheckItems +ScoreMasters['domain'];	
									}else{
										arrayValue[i]['domain'] = 0 * ScoreMasters['domain'];
										TotalCheckItems = TotalCheckItems +ScoreMasters['domain'];	
									}
								}
							}
							//CHECK REMOTE
							if(updated_job['remote'] == checkDetails['remote_only']){
								arrayValue[i]['remote'] = 100 * 0.5;
								TotalCheckItems = TotalCheckItems + 0.5;
							}else{
								arrayValue[i]['remote'] = 0 * 0.5;
								TotalCheckItems = TotalCheckItems + 0.5;
							}
							//CHECK TRAVEL
							if(checkDetails.travel >=updated_job.travel_opportunity){
								arrayValue[i]['travel'] = 100 * ScoreMasters['travel_opportunity'];
								TotalCheckItems = TotalCheckItems + ScoreMasters['travel_opportunity'];
							}else{
								arrayValue[i]['travel'] = 0 * ScoreMasters['travel_opportunity'];
								TotalCheckItems = TotalCheckItems + ScoreMasters['travel_opportunity'];
							}
							//LANGUAGE CHECKING
							if(!updated_job['language'] || !updated_job['language'].length || updated_job['language'].length ==0 ){
								//arrayValue[i]['language'] = 100 * ScoreMasters['language'];
								arrayValue[i]['language'] = 0;
							}else{
								if(!checkDetails['language_id']){
									arrayValue[i]['language'] = 0 * ScoreMasters['language'];	
									TotalCheckItems = TotalCheckItems +ScoreMasters['language'];								
								}else if(updated_job['language']){
									var language_id = updated_job.language.filter((el) => {
										return checkDetails.language_id.some((f) => {
											return parseInt(f) == parseInt(el) ;
										});
									});
									if(language_id.length !=0){
										language_id=(language_id.length/updated_job.language.length*100);
										arrayValue[i]['language'] = language_id * ScoreMasters['language'];
										TotalCheckItems = TotalCheckItems +ScoreMasters['language'];
									}else{
										arrayValue[i]['language'] = 0 * ScoreMasters['language'];
										TotalCheckItems = TotalCheckItems +ScoreMasters['language'];
									}
								}
							}
							if(updated_job['entry']==true){
								//arrayValue[i]['hands_on_experience'] =0;
								arrayValue[i]['sap_experience'] =0;
							}
							arrayValue[i]['score'] = Object.keys(arrayValue[i]).reduce((sum,key)=>sum+parseFloat(arrayValue[i][key]||0),0);
							arrayValue[i]['score'] =arrayValue[i]['score']/(10*TotalCheckItems);
							arrayValue[i]['job_id'] = updated_job['id'];
							arrayValue[i]['user_id'] = checkDetails['id'];
							arrayValue[i]['location_id'] = updated_job.job_locations[0]['id'];
							var post_data ={};
							post_data['job_id'] = arrayValue[i]['job_id'];
							post_data['user_id'] = arrayValue[i]['user_id'];
							//post_data['location_id'] = arrayValue[i]['location_id'];
							
							var post_datas =arrayValue[i];
							
							//User Notification
							var newMatch = {};
							var newMatchCheck = {};
							newMatch.name=updated_job['title'];
							newMatch.title='New Job Matches';
							newMatch.message='You’ve got a new match //'+newMatch.name;
							newMatch.account=checkDetails['account'];
							newMatch.user_id=checkDetails['id'];
							newMatch.job_id=updated_job['id'];
							newMatch.employer=updated_job['company'];	
							newMatchCheck.account=checkDetails['account'];
							newMatchCheck.user_id=checkDetails['id'];
							newMatchCheck.job_id=updated_job['id'];
							newMatchCheck.employer=updated_job['company'];	
							newMatch.view=0;
							
							
							//Employee Notification
							var newMatch1 = {};
							var newMatchCheck1 = {};
							newMatch1.name=checkDetails['first_name'] +' '+checkDetails['last_name'];
							newMatch1.title='New User Matches';
							newMatch1.message=updated_job['title']+'// has a new match';
							newMatch1.account=logged_in_user.id;
							newMatch1.user_id=checkDetails['id'];
							newMatch1.job_id=updated_job['id'];
							newMatch1.employer=updated_job['company'];
							
							var newMatch2 = {};
							newMatch2.name=checkDetails['first_name'] +' '+checkDetails['last_name'];
							newMatch2.title='Multiple User Matches';
							newMatch2.message=responseMatch.length+' candidates //are matching for the //'+updated_job['title'];
							newMatch2.account=logged_in_user.id;
							newMatch2.user_id=checkDetails['id'];
							newMatch2.job_id=updated_job['id'];
							newMatch2.employer=updated_job['company'];
							newMatch2.view=0;
							
							newMatchCheck1.account=logged_in_user.id;
							newMatchCheck1.user_id=checkDetails['id'];
							newMatchCheck1.job_id=updated_job['id'];
							newMatchCheck1.employer=updated_job['company'];		
							newMatch1.view=0;
							
							//User notification create
							await Notification.find(newMatchCheck).exec(async(err1, results)=> {
								if(results && results.length ==0 ){
								  if(newMatch.id ===undefined){
								     await Notification.findOrCreate(newMatchCheck,newMatch);
								  }
								}
							});
							
							//Employer notification create
							await Notification.find(newMatchCheck1).exec(async(err1, results)=> {
								if(results && results.length ==0 ){
									if(responseMatch.length > 1 && i==0){
										await Notification.findOrCreate(newMatchCheck1,newMatch2);	
									}
									else if(responseMatch.length == 1){
									await Notification.findOrCreate(newMatchCheck1,newMatch1);
									}
								}
							});

							//Score Calculation
							if(post_datas.score >=5){
							await Scoring.findOrCreate(post_data,post_datas).exec(async(err, user)=> {
								if (err) {
									console.log(err);
								} else {
									var created = true;
									return created;
								}
								
							});
							}
						}
						
					}
						
					}
				});
                return response.status(200).json(_response_object);
            });

        })
        .catch(err => {
            console.log(err)
            _response_object.errors = err.inner;
            // _response_object.count = err.inner.length;
            return response.status(400).json(err.inner);
        });

};