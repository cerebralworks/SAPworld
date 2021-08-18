/**
 *
 * @author Saravanan Karthikeyan <saravanan@studioq.co.in>
 *
 */

/* global _, validateModel, JobPostings, Categories, Cities, EmployerProfiles, SkillTags, sails */

var squel = require("squel");
const job_type_values = _.values(_.get(sails, 'config.custom.job_types', {}));
module.exports = async function list(request, response) {
    var _response_object = {};
    const request_query = request.allParams();
    const filtered_query_data = _.pick(request_query, ['page','is_user_get','user_id','user_list','visa','filterData','skills_filter', 'country', 'sort','visa_sponsered', 'limit', 'expand', 'search', 'status', 'type', 'skills', 'min_salary', 'max_salary', 'min_experience', 'max_experience', 'city', 'alphabet', 'location', 'location_miles', 'is_job_applied', 'company', 'work_authorization', 'zip_code', 'additional_fields']);
    const filtered_query_keys = Object.keys(filtered_query_data);
    var input_attributes = [
        { name: 'page', number: true, min: 1 },
        { name: 'limit', number: true, min: 1 },
        { name: 'status', enum: true, values: _.values(_.pick(sails.config.custom.status_codes, ['inactive', 'active', 'paused'])) },
        { name: 'skills', array: true, individual_rule: { number: true, min: 1 } },
        { name: 'type', array: true, individual_rule: { number: true, min: _.min(job_type_values), max: _.max(job_type_values) } },
        { name: 'min_salary', number: true, positive: true },
        { name: 'max_salary', number: true, positive: true },
        { name: 'min_experience', number: true, positive: true },
        { name: 'max_experience', number: true, positive: true },
        { name: 'work_authorization', number: true, positive: true },
        {
            custom: true,
            message: 'Attribute (min_salary) should be lesser than the Attribute (max_salary).',
            result: await (() => {
                if (!_.isEmpty(_.get(filtered_query_data, 'min_salary')) && !_.isEmpty(_.get(filtered_query_data, 'max_salary'))) {
                    if (parseFloat(_.get(filtered_query_data, 'min_salary')) > parseFloat(_.get(filtered_query_data, 'max_salary'))) {
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
                    if (parseFloat(_.get(filtered_query_data, 'min_experience')) > parseFloat(_.get(filtered_query_data, 'max_experience'))) {
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    return true;
                }
            })()
        },
        { name: 'domain', number: true, min: 1 },
        { name: 'city', string: true, min: 1 },
        { name: 'alphabet', letter: true },
        { name: 'location_miles', number: true, min: 1 },
        { name: 'is_job_applied', number: true, min: 1 },
        { name: 'zipcode', number: true }
    ];
    var expand = [];
    if (filtered_query_data.expand) {
        expand = filtered_query_data.expand.split(',');
    }
    if (filtered_query_data.skills) {
        filtered_query_data.skills = filtered_query_data.skills.split(',');
    }
    if (filtered_query_data.work_authorization) {
        filtered_query_data.work_authorization = parseInt(filtered_query_data.work_authorization);
    }
    if (filtered_query_data.visa_sponsered =="true") {
        filtered_query_data.visa_sponsered = true;
    }
    if (filtered_query_data.user_list =="true") {
        filtered_query_data.user_list = true;
    }
    if (filtered_query_data.visa_sponsered == "false") {
        filtered_query_data.visa_sponsered = false;
    }
    if (filtered_query_data.visa =="true") {
        filtered_query_data.visa = true;
    }
    if (filtered_query_data.visa == "false") {
        filtered_query_data.visa = false;
    }
    if (filtered_query_data.is_user_get =="true") {
        filtered_query_data.is_user_get = true;
    }
    if (filtered_query_data.is_user_get == "false") {
        filtered_query_data.is_user_get = false;
    }
    if (filtered_query_data.skills_filter =="true") {
        filtered_query_data.skills_filter = true;
    }
    if (filtered_query_data.skills_filter == "false") {
        filtered_query_data.skills_filter = false;
    }
    if (filtered_query_data.type) {
        filtered_query_data.type = filtered_query_data.type.split(',');
    }
    if (filtered_query_data.city) {
        filtered_query_data.city = filtered_query_data.city.split(',');
    }
    if (filtered_query_data.country) {
        filtered_query_data.country = filtered_query_data.country.split(',');
    }
    var additional_fields = [];
    const additional_fields_details = { applications_count: 'applications_count' };
    if (filtered_query_keys.includes('additional_fields')) {
        additional_fields = filtered_query_data.additional_fields.split(',');
    }
    if (!_.isEmpty(filtered_query_data.location_miles)) {
        input_attributes.push({ name: 'location', required: true, geopoint: true });
    }
    if (!_.has(filtered_query_data, 'is_job_applied') && _.get(request, 'user.user_profile.id')) {
        filtered_query_data.is_job_applied = _.get(request, 'user.user_profile.id');
        filtered_query_keys.push('is_job_applied');
    }

    var row_deleted_sign = _.get(sails.config.custom.status_codes, 'deleted');

    //Find the JobPostings based on general criteria.
    const getJobPostings = async(criteria, callback) => {
        const count_query = await buildNativeQueryToGetJobPostingList(criteria, true,false).then(function(query) {
            return query;
        });
		//To count the fields
        sails.sendNativeQuery(count_query, async function(err, total) {
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
            } else if (_.get(total, 'count.rows[0].count') < 1) {
                return callback([], {}, _.get(total, 'count.rows[0].count'));
            } else {
                const list_query = await buildNativeQueryToGetJobPostingList(criteria, false,false,false).then(function(query) {
                    return query;
                });
				//To list the all data's
                sails.sendNativeQuery(list_query, async function(err, job_postings) {
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
						const group_query = await buildNativeQueryToGetJobPostingList(criteria, true,true,false).then(function(query) {
							return query;
						});
						//To get the country based data's
						sails.sendNativeQuery(group_query, async function(err, group_query_Value) {
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
								//return callback(_.get(job_postings, 'rows'), {}, parseInt(total.rowCount),_.get(group_query_Value, 'rows'));
								
								const visa_query = await buildNativeQueryToGetJobPostingList(criteria, false,false,true).then(function(query) {
									return query;
								});
								//To get the country based data's
								sails.sendNativeQuery(visa_query, async function(err, visa_query_Value) {
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
										return callback(_.get(job_postings, 'rows'), {}, parseInt(total.rowCount),_.get(group_query_Value, 'rows'), parseInt(visa_query_Value.rowCount));
									}
								});
							}
						});
                        //return callback(_.get(job_postings, 'rows'), {}, parseInt(_.get(_.cloneDeep(total), 'rows[0].count')));
                    }
                });
            }
        });
    };

    //Build sails native query
    const buildNativeQueryToGetJobPostingList = async(criteria, count = false,group = false,visa = false) => {

        let query = squel.select({ tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"' }).
		from(JobPostings.tableName, JobPostings.tableAlias);

        var fields = _.without(Object.keys(JobPostings.schema), 'company');
		
		// Join the Scoring Table
		if(filtered_query_data.user_list ==true){
			query.left_join(Scoring.tableName, Scoring.tableAlias, Scoring.tableAlias + '.' + Scoring.schema.job_id.columnName + "=" + JobPostings.tableAlias + '.' + JobPostings.schema.id.columnName);
			query.where(` ${JobPostings.tableAlias}.${JobPostings.schema.id.columnName} = ${Scoring.tableAlias}.${Scoring.schema.job_id.columnName} `);
			query.where(` ${Scoring.tableAlias}.${Scoring.schema.user_id.columnName} = ${filtered_query_data.user_id}`);
		}
		
        if (!count && !visa) {
			
            await fields.forEach(function(attribute) {
                query.field(`${JobPostings.tableAlias}.${JobPostings.schema[attribute].columnName}`);
            });

            if (_.get(criteria, 'is_job_applied')) {
                let sub_query = squel.select({ tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"' }).
                from(JobApplications.tableName, JobApplications.tableAlias).
                where(`${JobApplications.tableAlias}.${JobApplications.schema.job_posting.columnName} = ${JobPostings.tableAlias}.${JobPostings.schema.id.columnName}`).
                where(`${JobApplications.tableAlias}.${JobApplications.schema.user.columnName} = ${_.get(criteria, 'is_job_applied')}`);
                query.field(`EXISTS(${sub_query})`, 'is_job_applied');
            }

            let get_populate_table_fields = [];
            let build_populate_table_columns = '';

            if (expand.includes('company')) {
                get_populate_table_fields = Object.keys(EmployerProfiles.schema);
                build_populate_table_columns = '';
                await get_populate_table_fields.forEach(function(attribute) {
                    if (!_.isEmpty(EmployerProfiles.schema[attribute].columnName)) {
                        build_populate_table_columns += `'${EmployerProfiles.schema[attribute].columnName}',${EmployerProfiles.tableAlias}.${EmployerProfiles.schema[attribute].columnName},`;
                    }
                });
                build_populate_table_columns = build_populate_table_columns.slice(0, -1);
                query.field(`json_build_object(${build_populate_table_columns})`, JobPostings.schema.company.columnName);
            } else {
                query.field(`${JobPostings.tableAlias}.${JobPostings.schema.company.columnName}`);
            }

            // making additional fields
            if (additional_fields.includes(_.get(additional_fields_details, 'applications_count'))) {
                let sub_query = squel.select({ tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"' }).
                from(JobApplications.tableName, JobApplications.tableAlias).
                where(`${JobApplications.tableAlias}.${JobApplications.schema.job_posting.columnName} = ${JobPostings.tableAlias}.${JobPostings.schema.id.columnName}`).
                where(`${JobApplications.tableAlias}.${JobApplications.schema.status.columnName} != ${row_deleted_sign}`);
                sub_query.field("COUNT(*)");
                query.field(`(${sub_query})`, _.get(additional_fields_details, 'applications_count'));
            }

        } else if(group){
            query.field("country,count(country)");
        }else if(visa){
            query.field("count(*)");
        } else {
            query.field("COUNT(*)");
        }

        query.left_join(`${EmployerProfiles.tableName}`, `${EmployerProfiles.tableAlias}`, `${JobPostings.tableAlias}.company = ${EmployerProfiles.tableAlias}.id`);
		
		if(filtered_query_keys.includes('is_user_get')){
		 query.where(`( ${JobPostings.tableAlias}.${JobPostings.schema.status.columnName} = ${_.get(criteria, 'where.status')} OR job_posting.id = (SELECT job_application.job_posting FROM job_applications "job_application" WHERE (job_application.job_posting = job_posting.id) AND (job_application.user = ${filtered_query_data.user_id} )))`);
		  query.where(`${JobPostings.tableAlias}.${JobPostings.schema.status.columnName} != 0`);
        }else if (_.get(criteria, 'where.status') || filtered_query_keys.includes('status') ) {
            query.where(`${JobPostings.tableAlias}.${JobPostings.schema.status.columnName} = ${_.get(criteria, 'where.status')}`);
        } else {
            // We should not take deleted job posting into the list. ie: status (row_deleted_sign: variable) indicates the job posting is had been removed.
            query.where(`${JobPostings.tableAlias}.${JobPostings.schema.status.columnName} != ${row_deleted_sign}`);
        }
        if (_.get(criteria, 'where.alphabet')) {
            query.where(`LOWER(${JobPostings.tableAlias}.${JobPostings.schema.title.columnName}) LIKE '${_.get(criteria, 'where.alphabet')}%'`);
        }
        if (_.get(criteria, 'where.skills') ) {
			query.where(`${JobPostings.tableAlias}.${JobPostings.schema.hands_on_skills.columnName} && '${_.get(criteria, 'where.skills')}' `);
		}
        if (_.get(criteria, 'where.skills') && filtered_query_data.skills_filter == true) {
			for(let i=0;i<filtered_query_data.skills.length;i++){
				query.where(` ${JobPostings.tableAlias}.${JobPostings.schema.skills.columnName} && '{${filtered_query_data.skills[i]}}'`);
			}
        }
		
		if(visa ==true){
			 query.where(`${JobPostings.tableAlias}.${JobPostings.schema.visa_sponsorship.columnName} = true `);
		}
        if (filtered_query_data.visa) {
			query.where(`${JobPostings.tableAlias}.${JobPostings.schema.visa_sponsorship.columnName} = true `);
        }
        if (_.get(criteria, 'where.min_salary')) {
            query.where(`${JobPostings.tableAlias}.${JobPostings.schema.salary.columnName} >= ${_.get(criteria, 'where.min_salary')}`);
        }
        if (_.get(criteria, 'where.max_salary')) {
            query.where(`${JobPostings.tableAlias}.${JobPostings.schema.salary.columnName} <= ${_.get(criteria, 'where.max_salary')}`);
        }
        if (_.get(criteria, 'where.min_experience')) {
            query.where(`${JobPostings.tableAlias}.${JobPostings.schema.experience.columnName} >= ${_.get(criteria, 'where.min_experience')}`);
        }
        if (_.get(criteria, 'where.max_experience')) {
            query.where(`${JobPostings.tableAlias}.${JobPostings.schema.experience.columnName} <= ${_.get(criteria, 'where.max_experience')}`);
        }
        if (_.get(criteria, 'where.type')) {
            query.where(`${JobPostings.tableAlias}.${JobPostings.schema.type.columnName} = ANY('${_.get(criteria, 'where.type')}')`);
        }

        if (_.get(criteria, 'where.city') &&  filtered_query_data.visa_sponsered != true ) {
            query.where(`${JobPostings.tableAlias}.${JobPostings.schema.city.columnName}  = ANY('${_.get(criteria, 'where.city')}')`);
        }
        if (_.get(criteria, 'where.country')  &&  filtered_query_data.visa_sponsered != true ) {
           // query.where(`(${JobPostings.tableAlias}.${JobPostings.schema.country.columnName} = ANY('${_.get(criteria, 'where.country')}') or ${JobPostings.tableAlias}.${JobPostings.schema.visa_sponsorship.columnName} = ${filtered_query_data.visa_sponsered} )`);
		   query.where(`(${JobPostings.tableAlias}.${JobPostings.schema.country.columnName}  = ANY('${_.get(criteria, 'where.country')}'))`);
        }
		if( filtered_query_data.visa_sponsered == true && _.get(criteria, 'where.country') && _.get(criteria, 'where.city')){
			 query.where(`(${JobPostings.tableAlias}.${JobPostings.schema.visa_sponsorship.columnName} = true OR (${JobPostings.tableAlias}.${JobPostings.schema.city.columnName}  = ANY('${_.get(criteria, 'where.city')}') AND (${JobPostings.tableAlias}.${JobPostings.schema.country.columnName}  = ANY('${_.get(criteria, 'where.country')}'))))`);
		}
		if( filtered_query_data.visa_sponsered == true && _.get(criteria, 'where.country') && !filtered_query_data.city ){
			 query.where(`(${JobPostings.tableAlias}.${JobPostings.schema.visa_sponsorship.columnName} = true OR ((${JobPostings.tableAlias}.${JobPostings.schema.country.columnName}  = ANY('${_.get(criteria, 'where.country')}'))))`);
		}
        if ( filtered_query_data.visa_sponsered == false && !filtered_query_data.visa) {
            query.where(`${JobPostings.tableAlias}.${JobPostings.schema.visa_sponsorship.columnName} = ${filtered_query_data.visa_sponsered} `);
        }
        if (filtered_query_data.work_authorization == 1 && _.get(criteria, 'where.country')  && _.get(criteria, 'where.city')  ) {
            query.where(`(${JobPostings.tableAlias}.${JobPostings.schema.visa_sponsorship.columnName} = true or (${JobPostings.tableAlias}.${JobPostings.schema.country.columnName} = ANY('${_.get(criteria, 'where.country')}') AND ${JobPostings.tableAlias}.${JobPostings.schema.city.columnName}  = ANY('${_.get(criteria, 'where.city')}') )) `);
        }
        if (filtered_query_data.work_authorization == 1 && _.get(criteria, 'where.country') && !filtered_query_data.city  ) {
            query.where(`(${JobPostings.tableAlias}.${JobPostings.schema.visa_sponsorship.columnName} = true or (${JobPostings.tableAlias}.${JobPostings.schema.country.columnName} = ANY('${_.get(criteria, 'where.country')}'))) `);
        }
        if (_.get(criteria, 'where.company')) {
            query.where(`${JobPostings.tableAlias}.${JobPostings.schema.company.columnName} = ${_.get(criteria, 'where.company')}`);
        }
        if (_.get(criteria, 'where.zipcode')) {
            query.where(`${JobPostings.tableAlias}.${JobPostings.schema.zip_code.columnName} = ${_.get(criteria, 'where.zip_code')}`);
        }
        if (_.get(criteria, 'where.search.contains')) {
            let sub_query = squel.select({ tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"' }).
            from(SkillTags.tableName, SkillTags.tableAlias).
            field(`${SkillTags.tableAlias}.${SkillTags.schema.id.columnName}`).
            where(`LOWER(${SkillTags.tableAlias}.${SkillTags.schema.tag.columnName}) like '% LOWER(${_.get(criteria, 'where.search.contains')})%'`).
            where(`${SkillTags.tableAlias}.${SkillTags.schema.status.columnName} != ${row_deleted_sign}`);
            query.where(`((array(${sub_query}) && ${JobPostings.tableAlias}.${JobPostings.schema.skills.columnName} = true) or LOWER(${JobPostings.tableAlias}.${JobPostings.schema.title.columnName}) like '${_.get(criteria, 'where.search.contains')}%')`);
        }
        if (_.get(criteria, 'where.location_miles')) {
            const generateGeom = `ST_PointFromText(ST_AsEWKT(${JobPostings.tableAlias}.${JobPostings.schema.latlng.columnName}::geometry), 4326)::geography`;
            query.where(`ST_DWithin(${generateGeom}, ST_SetSRID(ST_MakePoint(${_.get(criteria, 'where.location.latitude')}, ${_.get(criteria, 'where.location.longitude')}), 4326), ${_.get(criteria, 'where.location_miles')} * 1609)`);
        }
		if(filtered_query_data.user_list ==true){
			if (count && !group) {
				query.group(`${JobPostings.tableAlias}.${JobPostings.schema.id.columnName},${EmployerProfiles.tableAlias}.${EmployerProfiles.schema.id.columnName},${Scoring.tableAlias}.${Scoring.schema.id.columnName}`);
				query.order('scoring.score',  false );
				return query.toString();
			}else if (group) {
				query.group(`${JobPostings.tableAlias}.${JobPostings.schema.id.columnName},${JobPostings.tableAlias}.${JobPostings.schema.country.columnName},${Scoring.tableAlias}.${Scoring.schema.id.columnName}`);
				query.order('scoring.score',  false );
				return query.toString();
			}else if (visa) {
				query.group(`${JobPostings.tableAlias}.${JobPostings.schema.id.columnName},${Scoring.tableAlias}.${Scoring.schema.id.columnName}`);
				query.order('scoring.score',  false );
				return query.toString();
			}else {
				query.order('scoring.score',  false );
				if (_.get(criteria, 'page')) {
					query.offset(_.get(criteria, 'page'));
				}
				query.group(`${JobPostings.tableAlias}.${JobPostings.schema.id.columnName},${EmployerProfiles.tableAlias}.${EmployerProfiles.schema.id.columnName},${Scoring.tableAlias}.${Scoring.schema.id.columnName}`);
				return query.limit(_.get(criteria, 'limit')).toString();
			}
		}else{
			if (count && !group) {
				query.group(`${JobPostings.tableAlias}.${JobPostings.schema.id.columnName},${EmployerProfiles.tableAlias}.${EmployerProfiles.schema.id.columnName}`);
				return query.toString();
			}else if (group) {
				query.group(`${JobPostings.tableAlias}.${JobPostings.schema.id.columnName}`);
				return query.toString();
			}else if (visa) {
				query.group(`${JobPostings.tableAlias}.${JobPostings.schema.id.columnName}`);
				return query.toString();
			} else {
				if (_.isArray(_.get(criteria, 'sort'))) {
					await _.get(criteria, 'sort').forEach(function(field) {
						let value = _.keys(field)[0];
						if (value === 'most_popular') {
							value = `array_length(${JobPostings.tableAlias}.${JobPostings.schema.skills.columnName}, 1)`
						} else {
							value = `${JobPostings.tableAlias}.${value}`;
						}
						query.order(value, field[_.keys(field)[0]] === 'DESC' ? false : true);
					});
				}
				if (_.get(criteria, 'page')) {
					query.offset(_.get(criteria, 'page'));
				}
				query.group(`${JobPostings.tableAlias}.${JobPostings.schema.id.columnName},${EmployerProfiles.tableAlias}.${EmployerProfiles.schema.id.columnName}`);
				return query.limit(_.get(criteria, 'limit')).toString();
			}
		}
    }

    //Build and sending response
    const sendResponse = (items, details, total,country,visa) => {
        _response_object.message = 'Job items retrieved successfully.';
        var meta = {};
        meta['count'] = items.length;
        meta['total'] = total;
        meta['visa'] = visa;
        meta['page'] = filtered_query_data.page ? filtered_query_data.page : 1;
        meta['limit'] = filtered_query_data.limit;
        meta['photo'] = {
            path: 'https://s3.' + sails.config.conf.aws.region + '.amazonaws.com/' + sails.config.conf.aws.bucket_name,
            folder: 'public/images/Companies',
            sizes: {
                small: 256,
                medium: 512
            }
        };
        meta['photo'].example = meta['photo'].path + '/' + meta['photo'].folder + '/' + meta['photo'].sizes.medium + '/[filename].[filetype]';
        _response_object['meta'] = meta;
        _response_object['items'] = _.cloneDeep(items);
        _response_object['country'] = _.cloneDeep(country);
        _response_object['visa'] = _.cloneDeep(visa);
        if (!_.isEmpty(details)) {
            _response_object['details'] = _.cloneDeep(details);
        }
        return response.ok(_response_object);
    };

    //Validating the request and pass on the appriopriate response
    validateModel.validate(null, input_attributes, filtered_query_data, async function(valid, errors) {
        if (valid) {
            filtered_query_data.limit = parseInt(filtered_query_data.limit) > 0 ? parseInt(filtered_query_data.limit) : 10;
            filtered_query_data.page = parseInt(filtered_query_data.page);
            var criteria = {
                limit: filtered_query_data.limit,
                where: _.omit(filtered_query_data, ['page', 'limit', 'search', 'expand', 'sort'])
            };
            if (filtered_query_keys.includes('search')) {
                criteria.where.search = { 'contains': filtered_query_data.search.toLowerCase() };
            }
            if (filtered_query_keys.includes('status')) {
                criteria.where.status = parseInt(filtered_query_data.status);
            }
            if (filtered_query_keys.includes('type')) {
                criteria.where.type = `{${filtered_query_data.type.toString()}}`;
            }
            if (filtered_query_keys.includes('skills')) {
                criteria.where.skills = `{${filtered_query_data.skills.toString()}}`;
            }
            if (filtered_query_keys.includes('min_salary')) {
                criteria.where.min_salary = parseInt(filtered_query_data.min_salary);
            }
            if (filtered_query_keys.includes('max_salary')) {
                criteria.where.max_salary = parseInt(filtered_query_data.max_salary);
            }
            if (filtered_query_keys.includes('min_experience')) {
                criteria.where.min_experience = parseInt(filtered_query_data.min_experience);
            }
            if (filtered_query_keys.includes('max_experience')) {
                criteria.where.max_experience = parseInt(filtered_query_data.max_experience);
            }
            if (filtered_query_keys.includes('category')) {
                criteria.where.category = parseInt(filtered_query_data.category);
            }
            if (filtered_query_keys.includes('city')) {
                criteria.where.city = `{${filtered_query_data.city.toString()}}`;
            }
            if (filtered_query_keys.includes('country')) {
                criteria.where.country = `{${filtered_query_data.country.toString()}}`
            }
            if (filtered_query_keys.includes('company')) {
                criteria.where.company = parseInt(filtered_query_data.company);
            }
            if (filtered_query_keys.includes('alphabet')) {
                criteria.where.alphabet = filtered_query_data.alphabet.toLowerCase();
            }
            if (filtered_query_keys.includes('location_miles')) {
                criteria.where.location_miles = parseInt(filtered_query_data.location_miles);
            }
            if (filtered_query_keys.includes('is_job_applied')) {
                criteria.is_job_applied = parseInt(filtered_query_data.is_job_applied);
            }
            if (filtered_query_keys.includes('location')) {
                location = filtered_query_data.location.split(',');
                criteria.where.location = { longitude: location[1], latitude: location[0] };
            }
            if (filtered_query_keys.includes('zipcode')) {
                criteria.where.zip_code = parseInt(filtered_query_data.zip_code);
            }
            if (filtered_query_keys.includes('page')) {
                criteria.page = (parseInt(filtered_query_data.page) - 1) * filtered_query_data.limit;
            }
            if (filtered_query_keys.includes('sort')) {
                criteria.sort = [];
                const sort_array = filtered_query_data.sort.split(',');
                if (sort_array.length > 0) {
                    _.forEach(sort_array, function(value, key) {
                        const sort_direction = value.split('.');
                        var sort = {};
                        sort[sort_direction[0]] = 'ASC';
                        if (sort_direction.length > 1) {
                            if (sort_direction[1] === 'desc') {
                                sort[sort_direction[0]] = 'DESC';
                            }
                        }
                        criteria.sort.push(sort);
                    });
                }
            }
            //Preparing data
            await getJobPostings(criteria, function(job_postings, details, total,country,visa) {
                sendResponse(job_postings, details, total,country,visa);
            });
        } else {
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });

};
