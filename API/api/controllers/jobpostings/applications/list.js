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

/* global _, validateModel, JobApplications, cuisineJobApplications */

var squel = require("squel");
var async = require("async");

module.exports = async function list(request, response) {
    var _response_object = {};
    const request_query = request.allParams();
    const logged_in_user = request.user;
    const filtered_query_data = _.pick(request_query, [
        'page', 'sort', 'limit', 'status', 'expand', 'job_posting', 'user', 'employer', 'short_listed', 'detail_fields',
        'skill_tags', 'min_salary', 'max_salary', 'user_alphabet', 'job_types', 'min_experience', 'max_experience'
    ]);
    const filtered_query_keys = Object.keys(filtered_query_data);
    var expand = [];
    if (filtered_query_keys.includes('expand')) {
        expand = filtered_query_data.expand.split(',');
    }
    var detail_fields = [];
    if (filtered_query_data.detail_fields) {
        detail_fields = filtered_query_data.detail_fields.split(',');
    }
    var input_attributes = [
        { name: 'page', number: true, min: 1 },
        { name: 'limit', number: true, min: 1 },
        { name: 'status', enum: true, values: [0, 1,2,3,4,5,6,7,8,9] },
        { name: 'job_posting', number: true, min: 1 },
        { name: 'user', enum: true, min: 1 },
        { name: 'short_listed', enum: true, values: [0, 1] },
        { name: 'user', enum: true, min: 1 },
        { name: 'min_salary', number: true, min: true },
        { name: 'max_salary', number: true, min: true }
    ];
    //Find the JobApplications based on general criteria.
    const getJobApplications = (criteria, callback) => {
        //Initializing query
        var query = squel.select({ tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"' }).from(JobApplications.tableName, JobApplications.tableAlias);
        var group_by = JobApplications.tableAlias + "." + JobApplications.schema.id.columnName;
        if (
            filtered_query_keys.includes('min_salary') || filtered_query_keys.includes('max_salary') ||
            filtered_query_keys.includes('skill_tags') || filtered_query_keys.includes('job_types') ||
            expand.includes('job_posting') || detail_fields.includes('skill_tags')
        ) {
            query.left_join(JobPostings.tableName, JobPostings.tableAlias, JobPostings.tableAlias + '.' + JobPostings.schema.id.columnName + "=" + JobApplications.tableAlias + '.' + JobApplications.schema.job_posting.columnName);
            group_by += "," + JobPostings.tableAlias + "." + JobPostings.schema.id.columnName;
        }
        if (
            filtered_query_keys.includes('min_experience') || filtered_query_keys.includes('max_experience') ||
            filtered_query_keys.includes('user_alphabet') || expand.includes('user')
        ) {
            query.left_join(UserProfiles.tableName, UserProfiles.tableAlias, UserProfiles.tableAlias + '.' + UserProfiles.schema.id.columnName + "=" + JobApplications.tableAlias + '.' + JobApplications.schema.user.columnName);
            group_by += "," + UserProfiles.tableAlias + "." + UserProfiles.schema.id.columnName;
        }
        if (filtered_query_keys.includes('status')) {
            query.where(JobApplications.tableAlias + '.' + JobApplications.schema.status.columnName + "=" + parseInt(criteria.status));
        } /* else {
            query.where(JobApplications.tableAlias + '.' + JobApplications.schema.status.columnName + "=1");
        } */
        if (filtered_query_keys.includes('job_posting')) {
            query.where(JobApplications.tableAlias + '.' + JobApplications.schema.job_posting.columnName + "=" + parseInt(criteria.job_posting));
        }
        if (filtered_query_keys.includes('min_salary')) {
            query.where(JobPostings.tableAlias + '.' + JobPostings.schema.min_salary.columnName + ">=" + parseInt(criteria.min_salary));
        }
        if (filtered_query_keys.includes('max_salary')) {
            query.where(JobPostings.tableAlias + '.' + JobPostings.schema.max_salary.columnName + "<=" + parseInt(criteria.max_salary));
        }
        if (filtered_query_keys.includes('min_experience')) {
            query.where("COALESCE(" + UserProfiles.tableAlias + '.' + UserProfiles.schema.work_experience.columnName + ", 0) >=" + parseInt(criteria.min_experience));
        }
        if (filtered_query_keys.includes('max_experience')) {
            query.where("COALESCE(" + UserProfiles.tableAlias + '.' + UserProfiles.schema.work_experience.columnName + ", 0) <=" + parseInt(criteria.max_experience));
        }
        if (filtered_query_keys.includes('job_types')) {
            query.where(UserProfiles.tableAlias + '.' + UserProfiles.schema.preferred_job_type.columnName + "=ANY('{" + criteria.job_types + "}')");
        }
        if (filtered_query_keys.includes('user')) {
            query.where(JobApplications.tableAlias + '.' + JobApplications.schema.user.columnName + "=" + parseInt(criteria.user));
        }
        if (filtered_query_keys.includes('user_alphabet')) {
            query.where('LOWER(' + UserProfiles.tableAlias + '.' + UserProfiles.schema.first_name.columnName + ") LIKE '" + criteria.user_alphabet.toLowerCase() + "%'");
        }
        if (_.indexOf(logged_in_user.types, 2) > -1) {
            if (filtered_query_keys.includes('employer')) {
                query.where(JobApplications.tableAlias + '.' + JobApplications.schema.employer.columnName + "=" + parseInt(criteria.employer));
            }
        } else {
           // console.log(logged_in_user.employer_profile.id);
            query.where(JobApplications.tableAlias + '.' + JobApplications.schema.employer.columnName + "=" + logged_in_user.employer_profile.id);
        }
        if (filtered_query_keys.includes('short_listed')) {
            query.where(JobApplications.tableAlias + '.' + JobApplications.schema.short_listed.columnName + "=" + (!!+criteria.short_listed));
        }
        if (!filtered_query_keys.includes('short_listed')) {
            query.where(JobApplications.tableAlias + '.' + JobApplications.schema.short_listed.columnName + "!= true or job_application.short_listed IS NULL " );
        }
        //SKILL TAGS LOGIC BEGIN
        //Do not change the skill tags logic order. It must comes last at any cost. Add filters above this line if needed.
        var tag_input;
        if (detail_fields.includes('skill_tags')) {
            tag_input = query.toString().split(/FROM(.+)/)[1];
        }
        if (filtered_query_keys.includes('skill_tags')) {
            let tags = squel.expr();
            criteria.skill_tags.split(',').map(function(value) {
                tags.or(parseInt(value) + "=ANY(" + JobPostings.tableAlias + '.' + JobPostings.schema.skill_tags.columnName + ")");
            });
            query.where(tags);
        }
        //SKILL TAG LOGIC END
        //Count query
        var count_query = squel.select().field('COUNT(DISTINCT ' + JobApplications.tableAlias + '.' + JobApplications.schema.id.columnName + ')').toString();
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
                fields = _.without(Object.keys(JobApplications.schema), 'user_approach_id');
                fields.map(function(value) {
                    if (JobApplications.schema[value].columnName || typeof JobApplications.schema[value].columnName !== "undefined") {
                        query.field(JobApplications.tableAlias + '.' + JobApplications.schema[value].columnName, value);
                    }
                });
                //Populating expand values
                if (expand.includes('job_posting')) {
                    job_fields = _.without(Object.keys(JobPostings.schema), 'location_geom');
                    job = '';
                    job_fields.map(function(value) {
                        if ((JobPostings.schema[value].columnName || typeof JobPostings.schema[value].columnName !== "undefined" )&&
						JobPostings.schema[value].columnName !== 'account' && JobPostings.schema[value].columnName !== 'created_at' && JobPostings.schema[value].columnName !=='updated_at'
						&& JobPostings.schema[value].columnName !=='end_to_end_implementation' ) {
                            job += "'" + value + "'," + JobPostings.tableAlias + "." + JobPostings.schema[value].columnName + ",";
                        }
                    });
                    job = 'json_build_object(' + job.slice(0, -1) + ')';
                    query.field(job, 'job_posting');
                }
                if (expand.includes('user')) {
                    user_fields = _.without(Object.keys(UserProfiles.schema));
                    user = '';
                    user_fields.map(function(value) {
                        if((UserProfiles.schema[value].columnName || typeof UserProfiles.schema[value].columnName !== "undefined")&& 
						UserProfiles.schema[value].columnName !== 'created_at' && UserProfiles.schema[value].columnName !=='updated_at' &&
						UserProfiles.schema[value].columnName !== 'social_media_link' && UserProfiles.schema[value].columnName !=='preferred_location' &&
						UserProfiles.schema[value].columnName !== 'latlng' && UserProfiles.schema[value].columnName !== 'latlng_text'
						&& UserProfiles.schema[value].columnName !== 'hands_on_skills'
						&& UserProfiles.schema[value].columnName !== 'education_degree'
						&& UserProfiles.schema[value].columnName !== 'language_id'
						&& UserProfiles.schema[value].columnName !== 'other_cities'
						&& UserProfiles.schema[value].columnName !== 'other_countries'
						&& UserProfiles.schema[value].columnName !== 'end_to_end_implementation'
						&& UserProfiles.schema[value].columnName !== 'privacy_protection'){
                          user += "'" + value + "'," + UserProfiles.tableAlias + "." + UserProfiles.schema[value].columnName + ",";
                        }
                    });
                    if (expand.includes('user_skill_tags')) {
                        let sub_query = squel.select({ tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"' }).from(SkillTags.tableName, SkillTags.tableAlias + '_user');
                        sub_query.where(SkillTags.tableAlias + '_user.' + SkillTags.schema.id.columnName + "=ANY(" + UserProfiles.tableAlias + '.' + UserProfiles.schema.skill_tags.columnName + ")");
                        user_tag_fields = _.without(Object.keys(SkillTags.schema));
                        user_tags = '';
                        user_tag_fields.map(function(value) {
                            if (SkillTags.schema[value].columnName || typeof SkillTags.schema[value].columnName !== "undefined") {
                                user_tags += "'" + value + "'," + SkillTags.tableAlias + "_user." + SkillTags.schema[value].columnName + ",";
                            }
                        });
                        user_tags = 'CASE WHEN ' + UserProfiles.tableAlias + "." + UserProfiles.schema.skill_tags.columnName + ' IS NULL THEN NULL ELSE array_agg(json_build_object(' + user_tags.slice(0, -1) + ')) END';
                        user += "'" + UserProfiles.schema.skill_tags.columnName + "',(" + sub_query.field(user_tags).toString() + "),";
                    }
                    user = 'json_build_object(' + user.slice(0, -1) + ')';
                    query.field(user, 'user');
                }
                if (expand.includes('employer')) {
                    query.left_join(EmployerProfiles.tableName, EmployerProfiles.tableAlias, EmployerProfiles.tableAlias + '.' + EmployerProfiles.schema.id.columnName + "=" + JobApplications.tableAlias + '.' + JobApplications.schema.employer.columnName);
                    employer_fields = _.without(Object.keys(EmployerProfiles.schema));
                    employer = '';
                    employer_fields.map(function(value) {
                        if (EmployerProfiles.schema[value].columnName || typeof EmployerProfiles.schema[value].columnName !== "undefined") {
                            employer += "'" + value + "'," + EmployerProfiles.tableAlias + "." + EmployerProfiles.schema[value].columnName + ",";
                        }
                    });
                    employer = 'json_build_object(' + employer.slice(0, -1) + ')';
                    group_by += "," + EmployerProfiles.tableAlias + "." + EmployerProfiles.schema.id.columnName;
                    query.field(employer, 'employer');
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
                    } else if (detail_fields.includes('skill_tags')) {
                        tag_input = '(SELECT UNNEST(' + JobPostings.tableAlias + '.' + JobPostings.schema.skill_tags.columnName + ') AS ' + SkillTags.schema.id.columnName + ' FROM' + tag_input + ')';
                        var tag_query = squel.select({ tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"' }).from(tag_input, 'tag');
                        tag_query.left_join(SkillTags.tableName, SkillTags.tableAlias, SkillTags.tableAlias + '.' + SkillTags.schema.id.columnName + "=tag." + SkillTags.schema.id.columnName);
                        tag_query.group('tag.' + SkillTags.schema.id.columnName + ',' + SkillTags.tableAlias + '.' + SkillTags.schema.id.columnName);
                        tag_query.field('tag.' + SkillTags.schema.id.columnName, SkillTags.schema.id.columnName);
                        tag_query.field(SkillTags.tableAlias + '.' + SkillTags.schema.tag.columnName, SkillTags.schema.tag.columnName);
                        tag_query.field('count(tag)', 'count');
                        var tag_model = sails.sendNativeQuery(tag_query.toString());
                        tag_model.exec(async function(err, tags_result) {
                            if (err) {
                                var error = {
                                    'field': 'skill_tags',
                                    'rules': [{
                                        'rule': 'invalid',
                                        'message': err.message
                                    }]
                                };
                                _response_object.errors = [error];
                                _response_object.count = _response_object.errors.count;
                                return response.status(400).json(_response_object);
                            } else {
                                var details = { skill_tags: tags_result.rows };
                                return callback(applications_result.rows, details, parseInt(total_result.rows[0].count));
                            }
                        });
                    } else {
                        return callback(applications_result.rows, {}, parseInt(total_result.rows[0].count));
                    }
                });
            }
        });
    };
    //Build and sending response
    const sendResponse = (items, details, total) => {
        _response_object.message = 'Job application items retrieved successfully.';
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
        meta['video_resume'] = {
            path: 'https://s3.' + sails.config.conf.aws.region + '.amazonaws.com/' + sails.config.conf.aws.bucket_name,
            folder: 'public/resumes/Documents'
        };
        meta['video_resume'].example = meta['video_resume'].path + '/' + meta['video_resume'].folder + '/video-resume-55.png';
        meta['company'] = {
            path: 'https://s3.' + sails.config.conf.aws.region + '.amazonaws.com/' + sails.config.conf.aws.bucket_name,
            folder: 'public/images/Company'
        };
        meta['company'].example = meta['company'].path + '/' + meta['company'].folder + '/company-55.png';
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
            await getJobApplications(filtered_query_data, async function(applications, details, total) {
                var map_array = [];
                if (applications.length) {
                    for (let index = 0; index < applications.length; index++) {
                        const value = applications[index];
                        if (value.user.phone) {
                            await phoneEncryptor.decrypt(value.user.phone, function(decrypted_text) {
                                value.user.phone = decrypted_text;
                            });

                        }
                        map_array.push(value);
                    }
                }
                //console.log(map_array)
                sendResponse(map_array, details, total);
            });
        } else {
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.ok(_response_object);
        }
    });
};