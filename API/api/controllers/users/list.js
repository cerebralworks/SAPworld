/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global _, validateModel, UserProfiles, SkillTags cuisineUserProfiles */

var squel = require("squel");
var async = require("async");
const job_type_values = _.values(_.get(sails, 'config.custom.job_types', {}));
const row_deleted_sign = _.get(sails, 'config.custom.status_codes.deleted');
const row_hide_profile = _.get(sails, 'config.custom.status_codes.hide_profile');
module.exports = async function list(request, response) {
    var _response_object = {};
    const request_query = request.allParams();
    const logged_in_user = request.user;
    const filtered_query_data = _.pick(request_query, [
        'page', 'sort','country','work_authorization', 'limit', 'status', 'expand', 'search', 'search_type', 'city','visa', 'job_types', 'skill_tags', 'min_salary', 'max_salary', 'min_experience', 'max_experience', 'job_posting', 'skill_tags_filter_type', 'additional_fields',
		'domain','skills.','programming_skills','availability',
		'optinal_skills','certification',
		'facing_role','employer_role_type',
		'training_experience','travel_opportunity','work_authorization',
		'end_to_end_implementation','education',
		'remote','willing_to_relocate','language','visa'
    ]);
    const filtered_query_keys = Object.keys(filtered_query_data);
    var expand = [];
    if (filtered_query_keys.includes('expand')) {
        expand = filtered_query_data.expand.split(',');
    }
    var input_attributes = [
        { name: 'page', number: true, min: 1 },
        { name: 'limit', number: true, min: 1 },
        { name: 'status', enum: true, values: [0, 1] },
        { name: 'search_type', enum: true, values: [0, 1] },
        { name: 'skill_tags_filter_type', enum: true, values: [0, 1] },
        { name: 'job_types', array: true, individual_rule: { number: true, min: _.min(job_type_values), max: _.max(job_type_values) } },
        { name: 'job_posting', number: true, min: 1 },
        { name: 'skill_tags', array: true, individual_rule: { number: true, min: 1 } },
        { name: 'min_salary', number: true, positive: true },
        { name: 'max_salary', number: true, positive: true },
        { name: 'min_experience', number: true, positive: true },
        { name: 'max_experience', number: true, positive: true },
        {
            custom: true,
            message: 'Attribute (min_salary) should be lesser than the Attribute (max_salary).',
            result: await (() => {
                if (!_.isEmpty(_.get(filtered_query_data, 'min_salary')) && !_.isEmpty(_.get(filtered_query_data, 'max_salary'))) {
                    if (parseFloat(_.get(filtered_query_data, 'min_salary')) >= parseFloat(_.get(filtered_query_data, 'max_salary'))) {
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    return true;
                }
            })()
        },
        {
            custom: true,
            message: 'Attribute (min_experience) should be lesser than the Attribute (max_experience).',
            result: await (() => {
                if (!_.isEmpty(_.get(filtered_query_data, 'min_experience')) && !_.isEmpty(_.get(filtered_query_data, 'max_experience'))) {
                    if (parseFloat(_.get(filtered_query_data, 'min_experience')) >= parseFloat(_.get(filtered_query_data, 'max_experience'))) {
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    return true;
                }
            })()
        },
    ];
	//AdditionalFilters Adding
	if (filtered_query_keys.includes('domain')) {
        filtered_query_data.domain = filtered_query_data.domain.split(',');
        filtered_query_data.domain = filtered_query_data.domain.map(s => `'${s}'`).join(', ');
    }if (filtered_query_keys.includes('skills')) {
        filtered_query_data.skills = filtered_query_data.skills.split(',');
    }
	if (filtered_query_keys.includes('programming_skills')) {
        filtered_query_data.programming_skills = filtered_query_data.programming_skills.split(',');
        filtered_query_data.programming_skills = filtered_query_data.programming_skills.map(s => `'${s}'`).join(', ');
    }
	if (filtered_query_keys.includes('optinal_skills')) {
        filtered_query_data.optinal_skills = filtered_query_data.optinal_skills.split(',');
        filtered_query_data.optinal_skills = filtered_query_data.optinal_skills.map(s => `'${s}'`).join(', ');
    }
	if (filtered_query_keys.includes('certification')) {
        filtered_query_data.certification = filtered_query_data.certification.split(',');
        filtered_query_data.certification = filtered_query_data.certification.map(s => `'${s}'`).join(', ');
    }
	if (filtered_query_keys.includes('language')) {
        filtered_query_data.language = filtered_query_data.language.split(',');
       // filtered_query_data.language = filtered_query_data.language.map(s => `'${s}'`).join(', ');
    }
	if (filtered_query_keys.includes('education')) {
        filtered_query_data.education = filtered_query_data.education.toLocaleLowerCase();
    }
	
    if (filtered_query_data.visa =="true") {
        filtered_query_data.visa = true;
    }
    if (filtered_query_data.visa == "false") {
        filtered_query_data.visa = false;
    }
	
	
    if (filtered_query_keys.includes('skill_tags')) {
        filtered_query_data.skill_tags = filtered_query_data.skill_tags.split(',');
    }
    if (filtered_query_keys.includes('job_types')) {
        filtered_query_data.job_types = filtered_query_data.job_types.split(',');
    }
    var additional_fields = [];
    if (filtered_query_keys.includes('additional_fields')) {
        additional_fields = filtered_query_data.additional_fields.split(',');
        if (_.size(_.intersection(additional_fields, ['job_application'])) > 0) {
            input_attributes[_.findIndex(input_attributes, { name: 'job_posting' })].required = true;
        }
    }
    if (_.isEqual(parseInt(_.get(filtered_query_data, 'skill_tags_filter_type', 0)), 1)) {
        input_attributes[_.findIndex(input_attributes, { name: 'job_posting' })].required = true;
    }

    if (_.indexOf(_.get(logged_in_user, 'types'), _.get(sails, 'config.custom.access_role.employer')) > -1) {
        filtered_query_keys.push('employer');
        filtered_query_data.employer = _.get(logged_in_user, 'employer_profile.id');
    }
    //Find the UserProfiles based on general criteria.
    const getUserProfiles = (criteria, callback) => {
        //Initializing query
        var query = squel.select({ tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"' }).from(UserProfiles.tableName, UserProfiles.tableAlias);
       if (filtered_query_keys.includes('education')) {
			query.cross_join('json_array_elements(to_json(education_qualification)) degree(ele)');
	   }
	   if (filtered_query_keys.includes('language')) {
			query.cross_join('json_array_elements(to_json(language_known)) language(lang)');
	   }
	   if (filtered_query_keys.includes('country')) {
			query.cross_join('json_array_elements(to_json(preferred_locations)) country(coun)');
	   }
	   if (filtered_query_keys.includes('city')) {
			query.cross_join('json_array_elements(to_json(preferred_locations)) city(citys)');
	   }
        query.left_join(Users.tableName, Users.tableAlias, Users.tableAlias + '.' + Users.schema.id.columnName + "=" + UserProfiles.tableAlias + '.' + UserProfiles.schema.account.columnName);
        var group_by = UserProfiles.tableAlias + "." + UserProfiles.schema.id.columnName;
        group_by += "," + Users.tableAlias + "." + Users.schema.id.columnName;
        if (filtered_query_keys.includes('status')) {
            query.where(Users.tableAlias + '.' + Users.schema.status.columnName + "=" + parseInt(criteria.status));
        } else {
            query.where(Users.tableAlias + '.' + Users.schema.status.columnName + "=1");
        }
		
		
		//Filter the Custom Data's
		
        if (filtered_query_keys.includes('domain')) {
             query.where(UserProfiles.tableAlias + '.' + UserProfiles.schema.domains_worked.columnName + " && ARRAY["+criteria.domain+"]::bigint[]"  );
        }
        if (filtered_query_keys.includes('programming_skills')) {
             query.where(UserProfiles.tableAlias + '.' + UserProfiles.schema.programming_skills.columnName + " && ARRAY["+criteria.programming_skills+"]::text[]"  );
        }
        if (filtered_query_keys.includes('optinal_skills')) {
             query.where(UserProfiles.tableAlias + '.' + UserProfiles.schema.other_skills.columnName + " && ARRAY["+criteria.optinal_skills+"]::text[]"  );
        }
        if (filtered_query_keys.includes('certification')) {
             query.where(UserProfiles.tableAlias + '.' + UserProfiles.schema.certification.columnName + " && ARRAY["+criteria.certification+"]::text[]"  );
        }
        if (filtered_query_keys.includes('employer_role_type')) {
			 query.where('LOWER(' + UserProfiles.tableAlias + '.' + UserProfiles.schema.employer_role_type.columnName + ") = '" + criteria.employer_role_type.toLowerCase() + "' ");
        }
        if (filtered_query_keys.includes('end_to_end_implementation')) {
			 query.where( UserProfiles.tableAlias + '.' + UserProfiles.schema.end_to_end_implementation.columnName + " = '" + criteria.end_to_end_implementation + "' ");
        }
        if (filtered_query_keys.includes('remote')) {
			 query.where( UserProfiles.tableAlias + '.' + UserProfiles.schema.remote_only.columnName + " = '" + criteria.remote + "' ");
        }
        if (filtered_query_keys.includes('willing_to_relocate')) {
			 query.where( UserProfiles.tableAlias + '.' + UserProfiles.schema.willing_to_relocate.columnName + " = '" + criteria.willing_to_relocate + "' ");
        }
        if (filtered_query_keys.includes('availability')) {
			 query.where( UserProfiles.tableAlias + '.' + UserProfiles.schema.availability.columnName + " <= '" + criteria.availability + "' ");
        }
        if (filtered_query_keys.includes('travel_opportunity')) {
			 query.where( UserProfiles.tableAlias + '.' + UserProfiles.schema.travel.columnName + " <= '" + criteria.travel_opportunity + "' ");
        }
		
		
        if (filtered_query_keys.includes('city') && filtered_query_data.visa == false ) {
            //query.where('LOWER(' + UserProfiles.tableAlias + '.' + UserProfiles.schema.city.columnName + ") LIKE '%" + criteria.city.toLowerCase() + "%' OR willing_to_relocate=true");
           // query.where('LOWER(' + UserProfiles.tableAlias + '.' + UserProfiles.schema.city.columnName + ") = '" + criteria.city.toLowerCase() + "' ");
			query.where(`(LOWER(${UserProfiles.tableAlias}.${UserProfiles.schema.city.columnName}) LIKE '{${criteria.city.toLowerCase()}}') or (citys->>'city') = ANY( '{${filtered_query_data.city.toString()}}')`);
        }
        if (filtered_query_keys.includes('country') && filtered_query_data.visa == false ) {
            query.where(`(LOWER(${UserProfiles.tableAlias}.${UserProfiles.schema.country.columnName}) LIKE '{${criteria.country.toLowerCase()}}') or (coun->>'country') = ANY( '{${filtered_query_data.country.toString()}}')`);
            //query.orWhere('LOWER(' + UserProfiles.tableAlias + '.' + UserProfiles.schema.country.columnName + ") = '" + criteria.country.toLowerCase() + "'");
			//let search_texts = squel.expr();
            // search_texts.or('LOWER(' + UserProfiles.tableAlias + '.' + UserProfiles.schema.preferred_locations.columnName + '->>' + UserProfiles.schema.country.columnName + ") LIKE '%" + criteria.country.toLowerCase() + "%'");
             //query.where(search_texts);
        }
        if (filtered_query_data.visa == true) {
            query.where(UserProfiles.tableAlias + '.' + UserProfiles.schema.work_authorization.columnName + "= 1 " );
        }
        if (filtered_query_keys.includes('work_authorization')) {
            // query.where(UserProfiles.tableAlias + '.' + UserProfiles.schema.work_authorization.columnName + "="+criteria.work_authorization );
        }
        if (filtered_query_keys.includes('search')) {
            if (filtered_query_keys.includes('search_type') && parseInt(filtered_query_data.search_type) === 1) {
                query.where('LOWER(' + UserProfiles.tableAlias + '.' + UserProfiles.schema.email.columnName + ") LIKE '%" + criteria.search.toLowerCase() + "%'");
            } else {
                let search_text = squel.expr();
                search_text.or('LOWER(' + UserProfiles.tableAlias + '.' + UserProfiles.schema.first_name.columnName + ") LIKE '%" + criteria.search.toLowerCase() + "%'");
                search_text.or('LOWER(' + UserProfiles.tableAlias + '.' + UserProfiles.schema.last_name.columnName + ") LIKE '%" + criteria.search.toLowerCase() + "%'");
                query.where(search_text);
            }
        }
        if (filtered_query_keys.includes('job_types')) {
            //query.where(`${UserProfiles.tableAlias}.${UserProfiles.schema.job_type.columnName} = ANY('{${filtered_query_data.job_types.toString()}}')`);
            query.where(`${UserProfiles.tableAlias}.${UserProfiles.schema.job_type.columnName} IN ('{${filtered_query_data.job_types.toString()}}')`);
        }
        /* if (filtered_query_keys.includes('education')) {
            //query.where(`${UserProfiles.tableAlias}.${UserProfiles.schema.job_type.columnName} = ANY('{${filtered_query_data.job_types.toString()}}')`);
            query.where(`to_jsonb(${UserProfiles.tableAlias}.${UserProfiles.schema.education_qualification.columnName})->0->>'degree' =ANY('{"${filtered_query_data.education.toString()}"}')`);
        } */
		if (filtered_query_keys.includes('education')) {
            //query.where(`${UserProfiles.tableAlias}.${UserProfiles.schema.job_type.columnName} = ANY('{${filtered_query_data.job_types.toString()}}')`);
            query.where(`(ele->>'degree') =ANY('{"${filtered_query_data.education.toString()}"}')`);
        }
        /* if (filtered_query_keys.includes('language')) {
            //query.where(`${UserProfiles.tableAlias}.${UserProfiles.schema.job_type.columnName} = ANY('{${filtered_query_data.job_types.toString()}}')`);
            query.where(`to_jsonb(${UserProfiles.tableAlias}.${UserProfiles.schema.language_known.columnName})->0->>'language' =ANY('{${filtered_query_data.language.toString()}}')`);
        } */
		if (filtered_query_keys.includes('language')) {
            //query.where(`${UserProfiles.tableAlias}.${UserProfiles.schema.job_type.columnName} = ANY('{${filtered_query_data.job_types.toString()}}')`);
            query.where(`(lang->>'language') =ANY('{${filtered_query_data.language.toString()}}')`);
        }
        if (filtered_query_keys.includes('min_salary')) {
            query.where(`COALESCE(${UserProfiles.tableAlias}.${UserProfiles.schema.expected_salary.columnName}, 0) >= ${parseFloat(filtered_query_data.min_salary)}`);
        }
        if (filtered_query_keys.includes('max_salary')) {
            query.where(`COALESCE(${UserProfiles.tableAlias}.${UserProfiles.schema.expected_salary.columnName}, 0) <= ${parseFloat(filtered_query_data.max_salary)}`);
        }
        if (filtered_query_keys.includes('min_experience')) {
            query.where(`COALESCE(${UserProfiles.tableAlias}.${UserProfiles.schema.experience.columnName}, 0) >= ${parseInt(filtered_query_data.min_experience)}`);
        }
        if (filtered_query_keys.includes('max_experience')) {
            query.where(`COALESCE(${UserProfiles.tableAlias}.${UserProfiles.schema.experience.columnName}, 0) <= ${parseInt(filtered_query_data.max_experience)}`);
        }
        if (filtered_query_keys.includes('skill_tags') && _.isEqual(parseInt(_.get(filtered_query_data, 'skill_tags_filter_type', 0)), 0)) {
            // skill_tags_filter_type is 0. it indicates that skill_tags values will be provided by client.
            query.where(`${UserProfiles.tableAlias}.${UserProfiles.schema.skills.columnName} && ARRAY[${filtered_query_data.skill_tags}]::bigint[]`);
        }
        if (filtered_query_keys.includes('job_posting') && _.isEqual(parseInt(_.get(filtered_query_data, 'skill_tags_filter_type', 0)), 1)) {
            // skill_tags_filter_type is 1. it indicates that skill_tags values will be taken from job_posting skill_tags.
            let sub_query = squel.select({ tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"' });
            sub_query.from(JobPostings.tableName, JobPostings.tableAlias);
            sub_query.field(`${JobPostings.tableAlias}.${JobPostings.schema.skills.columnName}`);
            sub_query.where(`${JobPostings.tableAlias}.${JobPostings.schema.id.columnName} = ${parseInt(filtered_query_data.job_posting)}`);
            if (filtered_query_keys.includes('employer')) {
                sub_query.where(`${JobPostings.tableAlias}.${JobPostings.schema.company.columnName} = ${parseInt(filtered_query_data.employer)}`);
            }
            sub_query.where(`${JobPostings.tableAlias}.${JobPostings.schema.status.columnName} != ${row_deleted_sign}`);
            query.where(`${UserProfiles.tableAlias}.${UserProfiles.schema.skills.columnName} && (${sub_query.toString()})`);
        }
        //Count query
        var count_query = squel.select().field('COUNT(DISTINCT ' + UserProfiles.tableAlias + '.' + UserProfiles.schema.id.columnName + ')').toString();
        query_split = query.toString().split(/FROM(.+)/)[1];
        count_query = count_query + ' FROM ' + query_split.split(' ORDER')[0];
        sails.sendNativeQuery(count_query, function(err, total_result) {
            if (err) {
                var error = {
                    'field': 'count',
                    'rules': [{
                        'rule': 'invalid',
                        'message': err.message
                    }]
                };
                _response_object.errors = [error];
                _response_object.count = _response_object.errors.count;
                return response.status(400).json(_response_object);
            } else if (total_result.rowCount < 1) {
                return callback([], {}, 0);
            } else if (parseInt(total_result.rows[0].count) < 1) {
                return callback([], {}, 0);
            } else {
                //Selecting fields
                fields = _.without(Object.keys(UserProfiles.schema), 'phone', 'skill_tags');
                fields.map(function(value) {
                    if (UserProfiles.schema[value].columnName || typeof UserProfiles.schema[value].columnName !== "undefined") {
                        query.field(UserProfiles.tableAlias + '.' + UserProfiles.schema[value].columnName, value);
                    }
                });
                // Adding additional columns to users list
                if (additional_fields.includes('job_application') && filtered_query_keys.includes('job_posting')) {
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
                    where(`${JobApplications.tableAlias}.${JobApplications.schema.job_posting.columnName} = ${parseInt(filtered_query_data.job_posting)}`).
                    where(`${JobApplications.tableAlias}.${JobApplications.schema.user.columnName} = ${UserProfiles.tableAlias}.${UserProfiles.schema.id.columnName}`).
                    where(`${JobApplications.tableAlias}.${JobApplications.schema.status.columnName} !=${row_deleted_sign}`).
                    limit(1);
                    query.field(`(${sub_query.toString()})`, 'job_application');
                }

                //Populating expand values
                if (expand.includes('account')) {
                    user_fields = _.without(Object.keys(Users.schema), 'username', 'password', 'tokens');
                    user = '';
                    user_fields.map(function(value) {
                        if (Users.schema[value].columnName || typeof Users.schema[value].columnName !== "undefined") {
                            user += "'" + value + "'," + Users.tableAlias + "." + Users.schema[value].columnName + ",";
                        }
                    });
                    user = 'json_build_object(' + user.slice(0, -1) + ')';
                    query.field(user, 'account');
                }

                if (expand.includes('is_saved_profile') && _.indexOf(_.get(logged_in_user, 'types'), _.get(sails, 'config.custom.access_role.employer')) > -1) {
                    let sav_query = squel.select({tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"'}).from(SavedProfile.tableName);
                    sav_query.where('"' + SavedProfile.schema.employee_id.columnName + '"=' + logged_in_user.employer_profile.id);
                    sav_query.where(SavedProfile.schema.user_id.columnName + "=" + UserProfiles.tableAlias + '.' + UserProfiles.schema.id.columnName);
                    query.field('(SELECT EXISTS('+ sav_query.toString() +'))','is_saved_profile');
                }

                //Populating skill_tags
                if (expand.includes('skill_tags')) {
                    let sub_query = squel.select({ tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"' });
                    let build_skill_tags_table_columns = '';
                    sub_query.from(SkillTags.tableName, SkillTags.tableAlias);
                    _.forEach(_.keys(SkillTags.schema), attribute => {
                        if (!_.isEmpty(SkillTags.schema[attribute].columnName)) {
                            build_skill_tags_table_columns += `'${SkillTags.schema[attribute].columnName}',${SkillTags.tableAlias}.${SkillTags.schema[attribute].columnName},`;
                        }
                    });
                    build_skill_tags_table_columns = build_skill_tags_table_columns.slice(0, -1);
                    sub_query.field(`CASE WHEN ${UserProfiles.tableAlias}.${UserProfiles.schema.skills.columnName} IS NULL THEN NULL ELSE array_agg(json_build_object(${build_skill_tags_table_columns})) END`);
                    sub_query.where(`${SkillTags.tableAlias}.${SkillTags.schema.id.columnName} = ANY(${UserProfiles.tableAlias}.${UserProfiles.schema.skills.columnName})`);
                    query.field(`(${sub_query.toString()})`, `${UserProfiles.schema.skills.columnName}`);
                } else {
                    query.field(`${UserProfiles.tableAlias}.${UserProfiles.schema.skills.columnName}`);
                }

                //Sorting fields
                if (filtered_query_keys.includes('sort')) {
                    var sort = {};
                    const sort_array = filtered_query_data.sort.split(',');
                    if (sort_array.length > 0) {
                        _.forEach(sort_array, function(value, key) {
                            const sort_direction = value.split('.');
                            if (sort_direction.length > 1) {
                                if (sort_direction[1] === 'desc') {
                                    sort[sort_direction[0]] = 'DESC';
                                    query.order(sort_direction[0], false);
                                } else {
                                    query.order(sort_direction[0]);
                                }
                            }
                        });
                    }
                }
                //Setting pagination
                query.limit(filtered_query_data.limit);
                if (filtered_query_keys.includes('page')) {
                    filtered_query_data.page = parseInt(filtered_query_data.page);
                    query.offset((filtered_query_data.page - 1) * filtered_query_data.limit);
                }
                query.group(group_by);

                //Executing query
                var application_model = sails.sendNativeQuery(query.toString());
                application_model.exec(async function(err, applications_result) {
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

                        return callback(applications_result.rows, {}, parseInt(total_result.rows[0].count));
                    }
                });
            }
        });
    };
    //Build and sending response
    const sendResponse = (items, details, total) => {
        _response_object.message = 'Users list have been retrieved successfully.';
        var meta = {};
        meta['count'] = items.length;
        meta['total'] = total;
        meta['page'] = filtered_query_data.page ? filtered_query_data.page : 1;
        meta['limit'] = filtered_query_data.limit;
        meta['photo'] = {
            path: 'https://s3.' + sails.config.conf.aws.region + '.amazonaws.com/' + sails.config.conf.aws.bucket_name,
            folder: 'public/images/Users',
            sizes: {
                small: 256,
                medium: 512,
                large: 1024,
            }
        };
        meta['photo'].example = meta['photo'].path + '/' + meta['photo'].folder + '/' + meta['photo'].sizes.medium + '/user-209.png';
        meta['doc_resume'] = {
            path: 'https://s3.' + sails.config.conf.aws.region + '.amazonaws.com/' + sails.config.conf.aws.bucket_name,
            folder: 'public/resumes/Documents'
        };
        meta['doc_resume'].example = meta['doc_resume'].path + '/' + meta['doc_resume'].folder + '/doc-resume-55.png';
        _response_object['meta'] = meta;
        _response_object['items'] = _.cloneDeep(items);
        if (!_.isEmpty(details)) {
            _response_object['details'] = _.cloneDeep(details);
        }
        return response.ok(_response_object);
    };
    //Validating the request and pass on the appriopriate response
    validateModel.validate(null, input_attributes, filtered_query_data, async function(valid, errors) {
        if (valid) {
            filtered_query_data.limit = parseInt(filtered_query_data.limit) > 0 ? parseInt(filtered_query_data.limit) : 10;
            //Preparing data
            await getUserProfiles(filtered_query_data, function(applications, details, total) {
                var pro_details = [];
                if (!Object.keys(applications).length) {
                    sendResponse(applications, pro_details, total);
                    return true;
                }
                for (const element of applications) {
                    if (element.privacy_protection !== null) {
                        if (element.privacy_protection.photo == false) {
                            element.phone = 'default.jpg'
                        }
                        if (element.privacy_protection.email == false) {
                            element.email = 'xxxxx@sap-world.com'
                        }
                        if (element.privacy_protection.phone == false) {
                            element.phone = '0000000000'
                        }
                        if (element.privacy_protection.current_employer == false) {
                            element.current_employer = 'Nothing'
                        }

                    }
                    pro_details.push(element);
                }


                sendResponse(applications, pro_details, total);
            });
        } else {
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.ok(_response_object);
        }
    });

};
