var squel = require("squel");
var async = require("async");
module.exports = async function Scoring(request, response) {
    const post_request_data = request.allParams();
    var _response_object = {};
    const logged_in_user = request.user;
    let yup = sails.yup;
    var model = {};
    var score = 4;
    const filtered_query_data = _.pick(post_request_data, [
        'page', 'sort','country','work_authorization', 'limit', 'status', 'expand', 'search', 'search_type', 'city','visa', 'job_types', 'skill_tags', 'min_salary', 'max_salary', 'min_experience', 'max_experience', 'job_posting', 'skill_tags_filter_type', 'additional_fields',
		'domain','skills.','programming_skills','availability',
		'optinal_skills','certification',
		'facing_role','employer_role_type',
		'training_experience','travel_opportunity','work_authorization',
		'end_to_end_implementation','education',
		'remote','willing_to_relocate','language','visa','filter_location'
    ]);
	const filtered_query_keys = Object.keys(filtered_query_data);
    //Build and sending response
    const sendResponse = (items, count, application) => {
        _response_object.message = 'Job items retrieved successfully.';
        _response_object.score = score;
        var meta = {};
        meta['count'] = count;
        meta['page'] = post_request_data.page ? post_request_data.page : 1;
        meta['limit'] = post_request_data.limit;
        meta['photo'] = {
            path: 'https://s3.' + sails.config.conf.aws.region + '.amazonaws.com/' + sails.config.conf.aws.bucket_name,
            folder: 'public/images/Users',
            sizes: {
                small: 256,
                medium: 512
            }
        };
        meta['photo'].example = meta['photo'].path + '/' + meta['photo'].folder + '/' + meta['photo'].sizes.medium + '/[filename].[filetype]';
        meta['doc_resume'] = {
            path: 'https://s3.' + sails.config.conf.aws.region + '.amazonaws.com/' + sails.config.conf.aws.bucket_name,
            folder: 'public/resumes/Documents'
        };
        meta['doc_resume'].example = meta['doc_resume'].path + '/' + meta['doc_resume'].folder + '/doc-resume-55.png';
        _response_object['meta'] = meta;
        _response_object['profile'] = _.cloneDeep(items);
        _response_object['job'] = _.cloneDeep(model);
        _response_object['application'] = _.cloneDeep(application);
        return response.ok(_response_object);
    };
	
    if (filtered_query_data.visa =="true") {
        filtered_query_data.visa = true;
    }
    if (filtered_query_data.visa == "false") {
        filtered_query_data.visa = false;
    }
    if (filtered_query_data.filter_location =="true") {
        filtered_query_data.filter_location = true;
    }
    if (filtered_query_data.filter_location == "false") {
        filtered_query_data.filter_location = false;
    }
	
	
    if (filtered_query_keys.includes('skill_tags')) {
        filtered_query_data.skill_tags = filtered_query_data.skill_tags.split(',');
    }
    if (filtered_query_keys.includes('job_types')) {
        filtered_query_data.job_types = filtered_query_data.job_types.split(',');
    }
	//Validate to form data
    yup.object().shape({
        id: yup.number().test('job_id', 'Cant find record', async(value) => {
            return await JobPostings.findOne({ company: logged_in_user.employer_profile.id || 0, id: value, status: 1 }).then((result) => {
                model = result;
                return true;
            }).catch(err => {
                return false;
            })
        }),
        user_id: yup.number().positive(),
        page: yup.number().min(0).default(0),
        work_authorization: yup.number().positive(),
        travel: yup.number().positive(),
        distance: yup.number().positive().default(100),
        availability: yup.number().positive(),
        job_type: yup.number().positive().oneOf([1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008]),
        end_to_end_implementation: yup.number().positive(),
    }).validate(post_request_data, { abortEarly: false }).then(value => {
		
        var list_query = squel.select({ tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"' }).from(UserProfiles.tableName, UserProfiles.tableAlias);
		
		
	   if (model.country && !value.user_id) {
			//list_query.cross_join('json_array_elements(to_json(preferred_locations)) country(coun)');
	   }
	   if (model.city && !value.user_id) {
			//list_query.cross_join('json_array_elements(to_json(preferred_locations)) city(citys)');
	   }
	   if(model.skills){
		   var tempData = model.hands_on_experience.map(function(a,b){ return a.skill_id });
		   //var tempData = model.skills;
	   }
	   
            list_query.where("status=1");
            list_query.where("experience >=" + model.experience);
            //.where("sap_experience >=" + model.sap_experience)
            list_query.where(`user_profile.hands_on_skills && ARRAY[${tempData}]::bigint[]`);
            //list_query.where("lower(city) = lower('" + model.city + "') OR willing_to_relocate=true ");
            //.where("lower(city) = lower('" + model.city + "') OR willing_to_relocate=true OR ST_DistanceSphere(latlng, '" + model.latlng + "'::geometry) <=" + value.distance + " * 1609.34");
		

			
		
		//list_query.cross_join('json_array_elements(to_json(user_profile.hands_on_experience)) skill_id(skillss)');
		//list_query.where(`(skillss->>'skill_id') = ANY( '{${tempData}}')`);
        if (model.city && model.visa_sponsorship == false && !value.user_id) {
			list_query.where(`( user_profile.country like '{${model.city.toString()}}' OR user_profile.other_cities && ARRAY['${model.city.toString()}']::text[] )`);
        }
        if (model.country && model.visa_sponsorship == false && !value.user_id) {
            list_query.where(`( user_profile.country like '{${model.country.toString()}}' OR user_profile.other_countries && ARRAY['{${model.country.toString()}}']::text[] )`);
        }
		list_query.where(`(user_profile.privacy_protection->>'available_for_opportunity')::text = 'true'`);
        if (model.visa_sponsorship == true && !value.user_id) {
            //list_query.where(`(${UserProfiles.tableAlias}.${UserProfiles.schema.work_authorization.columnName} = 1 or  (( user_profile.country like {${model.country.toString()}} OR(coun->>'country') = ANY( '{${model.country.toString()}}')) AND ( user_profile.country like {${model.city.toString()}} OR (citys->>'city') = ANY( '{${model.city.toString()}}')) ))`);
            list_query.where(`( (( user_profile.country like '{${model.country.toString()}}' OR user_profile.other_countries && ARRAY['${model.country.toString()}']::text[] ) AND ( user_profile.country like '{${model.city.toString()}}' OR user_profile.other_cities && ARRAY['${model.city.toString()}']::text[] ) ))`);
        }
        if (model.type && !value.user_id && model.visa_sponsorship == false ) {
           //list_query.where(`${UserProfiles.tableAlias}.${UserProfiles.schema.job_type.columnName} && ARRAY[${model.type.toString()}]::text[]`);
        }
       // if (model.includes('min_experience')) {
           // list_query.where(`COALESCE(${UserProfiles.tableAlias}.${UserProfiles.schema.experience.columnName}, 0) >= ${parseInt(filtered_query_data.min_experience)}`);
        //}
		
        if (value.user_id) {
            list_query.where("id =" + value.user_id);
        }
        if (value.work_authorization) {
            //list_query.where("work_authorization=" + model.work_authorization);
            score += 1;
        }
        if (value.travel) {
            list_query.where("travel >=" + model.travel);
            score += 1;
        }
        if (value.job_type) {
            list_query.where("job_type=" + model.job_type);
            score += 1;
        }
        if (value.availability) {
            list_query.where("availability >=" + model.availability);
            score += 1;
        }
        if (value.end_to_end_implementation) {
            list_query.where("end_to_end_implementation >=" + model.end_to_end_implementation);
            score += 1;
        }
		var group_by = UserProfiles.tableAlias + "." + UserProfiles.schema.id.columnName;
        //group_by += "," + Users.tableAlias + "." + Users.schema.id.columnName;
		
        value.page = value.page ? value.page : 1;
	        list_query.limit(1).offset(value.page - 1);
         
        var count_query = list_query.clone();
		list_query.group(group_by);
        //Selecting fields
        fields = _.without(Object.keys(UserProfiles.schema), 'phone', 'skill_tags');
        fields.map(function(value) {
            if (UserProfiles.schema[value].columnName || typeof UserProfiles.schema[value].columnName !== "undefined") {
                list_query.field(UserProfiles.tableAlias + '.' + UserProfiles.schema[value].columnName, value);
            }
        });
        if (value.id) {
            let build_job_application_table_columns = '';
            _.forEach(_.keys(JobApplications.schema), attribute => {
                if (!_.isEmpty(JobApplications.schema[attribute].columnName)) {
                    build_job_application_table_columns += `'${JobApplications.schema[attribute].columnName}',${JobApplications.tableAlias}.${JobApplications.schema[attribute].columnName},`;
                }
            });
            build_job_application_table_columns = build_job_application_table_columns.slice(0, -1);
            let sub_query = squel.select({ tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"' }).
            from(JobApplications.tableName, JobApplications.tableAlias).
            field(`json_build_object(${build_job_application_table_columns})`).
            where(`${JobApplications.tableAlias}.${JobApplications.schema.job_posting.columnName} = ${parseInt(value.id)}`).
            where(`${JobApplications.tableAlias}.${JobApplications.schema.user.columnName} = ${UserProfiles.tableAlias}.${UserProfiles.schema.id.columnName}`).
            limit(1);
            list_query.field(`(${sub_query.toString()})`, 'job_application');
        }
        sails.sendNativeQuery(list_query.toString(), async function(err, job_postings) {
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
                profile = _.get(job_postings, 'rows');
                let application = null;
                if (profile.length) {
                    profile = profile[0]

                    if (!value.work_authorization && model.work_authorization == profile.work_authorization) {
                        score += 1;
                    }
                    if (!value.travel && model.travel_opportunity <= profile.travel) {
                        score += 1;
                    }
                    if (!value.job_type && model.job_type == profile.job_type) {
                        score += 1;
                    }
                    if (!value.availability && model.availability >= profile.availability) {
                        score += 1;
                    }
                    if (!value.end_to_end_implementation && model.end_to_end_implementation <= profile.end_to_end_implementation) {
                        score += 1;
                    }
                    // if ( model.domain = profile.domains_worked) {
                    //     score += 1;
                    // }
                    if (profile.job_application) {
                        application = profile.job_application;
                        delete profile.job_application;
                    }
                } else profile = {};
                count_query = count_query.toString().replace("LIMIT 1", " ").replace("*", "COUNT(DISTINCT user_profile.id)").replace(`OFFSET ${value.page-1}`, " ");
                var count = sails.sendNativeQuery(count_query, async function(err, job_postings) {
                    sendResponse(profile, job_postings['rows'][0]['count'], application);
                });
            }
        });
    }).catch(err => {
        _response_object.errors = err.inner;
        // _response_object.count = err.inner.length;
        return response.status(400).json(err.inner);
    });
}
