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

module.exports = async function list(request,response) {
    var _response_object = {};
    const request_query = request.allParams();
    const logged_in_user = request.user;
    const filtered_query_data = _.pick(request_query, [
        'page', 'sort', 'limit', 'status', 'expand', 'job_posting', 'employer', 'short_listed'
    ]);
    const filtered_query_keys = Object.keys(filtered_query_data);
    var input_attributes = [
        {name: 'page', number: true, min: 1},
        {name: 'limit', number: true, min: 1},
        {name: 'status', enum: true, values: [0, 1,2,3,4,5,6,7,8,9] },
        { name: 'short_listed', enum: true, values: [0, 1] },
        {name: 'job_posting', number: true, min: 1},
        {name: 'user', enum: true, min: 1}
    ];
    var expand = [];
    if(filtered_query_keys.includes('expand')) {
        expand = filtered_query_data.expand.split(',');
    }
    //Find the JobApplications based on general criteria.
    const getJobApplications = (criteria, callback) => {
        //Initializing query
        var query = squel.select({tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"'}).from(JobApplications.tableName, JobApplications.tableAlias);
        var group_by = JobApplications.tableAlias + "." + JobApplications.schema.id.columnName;
        query.where(JobApplications.tableAlias + '.' + JobApplications.schema.user.columnName + "=" + logged_in_user.user_profile.id);
        if(filtered_query_keys.includes('status')){
            query.where(JobApplications.tableAlias + '.' + JobApplications.schema.status.columnName + "=" + parseInt(criteria.status));
        }else{
            //query.where(JobApplications.tableAlias + '.' + JobApplications.schema.status.columnName + "=1");
        }
        if (filtered_query_keys.includes('short_listed')) {
            query.where(JobApplications.tableAlias + '.' + JobApplications.schema.short_listed.columnName + "=" + (!!+criteria.short_listed));
        }
        if(filtered_query_keys.includes('job_posting')){
            query.where(JobApplications.tableAlias + '.' + JobApplications.schema.job_posting.columnName + "=" + parseInt(criteria.job_posting));
        }
        if(filtered_query_keys.includes('employer')){
            query.where(JobApplications.tableAlias + '.' + JobApplications.schema.employer.columnName + "=" + parseInt(criteria.employer));
        }
        //Count query
        var count_query = squel.select().field('COUNT(DISTINCT '+ JobApplications.tableAlias + '.' + JobApplications.schema.id.columnName +')').toString();
        query_split = query.toString().split(/FROM(.+)/)[1];
        count_query = count_query + ' FROM ' + query_split.split(' ORDER')[0];
        sails.sendNativeQuery(count_query,function (err, total_result) {
            if(err){
                var error = {
                    'field': 'count',
                    'rules': [
                        {
                            'rule': 'invalid',
                            'message': err.message
                        }
                    ]
                };
                _response_object.errors = [error];
                _response_object.count = _response_object.errors.count;
                return response.status(400).json(_response_object);
            }else if(total_result.rowCount < 1){
                return callback([], {}, 0);
            }else if(parseInt(total_result.rows[0].count) < 1){
                return callback([], {}, 0);
            }else{
                //Selecting fields
                fields = _.without(Object.keys(JobApplications.schema), 'user_approach_id');
                fields.map(function(value){
                    if(JobApplications.schema[value].columnName || typeof JobApplications.schema[value].columnName !== "undefined"){
                        query.field(JobApplications.tableAlias + '.' + JobApplications.schema[value].columnName, value);
                    }
                });
                //Populating expand values
                if(expand.includes('job_posting')){
                    query.left_join(JobPostings.tableName, JobPostings.tableAlias, JobPostings.tableAlias + '.' + JobPostings.schema.id.columnName + "=" + JobApplications.tableAlias + '.' + JobApplications.schema.job_posting.columnName);
                    job_fields = _.without(Object.keys(JobPostings.schema), 'location_geom');
                    job = '';
                    job_fields.map(function(value){
                         if ((JobPostings.schema[value].columnName || typeof JobPostings.schema[value].columnName !== "undefined" )&&
						JobPostings.schema[value].columnName !== 'created_at' && JobPostings.schema[value].columnName !=='updated_at'
						&& JobPostings.schema[value].columnName !=='end_to_end_implementation' ) {
                            job += "'"+ value + "'," + JobPostings.tableAlias + "." + JobPostings.schema[value].columnName + ",";
                        }
                    });
                    job = 'json_build_object(' + job.slice(0, -1) + ')';
                    group_by += "," + JobPostings.tableAlias + "." + JobPostings.schema.id.columnName;
                    query.field(job,'job_posting');
                }
                if(expand.includes('user')){
                    query.left_join(UserProfiles.tableName, UserProfiles.tableAlias, UserProfiles.tableAlias + '.' + UserProfiles.schema.id.columnName + "=" + JobApplications.tableAlias + '.' + JobApplications.schema.user.columnName);
                    user_fields = _.without(Object.keys(UserProfiles.schema));
                    user = '';
                    user_fields.map(function(value){
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
                            user += "'"+ value + "'," + UserProfiles.tableAlias + "." + UserProfiles.schema[value].columnName + ",";
                        }
                    });
                    user = 'json_build_object(' + user.slice(0, -1) + ')';
                    group_by += "," + UserProfiles.tableAlias + "." + UserProfiles.schema.id.columnName;
                    query.field(user,'user');
                }
                if(expand.includes('employer')){
                    query.left_join(EmployerProfiles.tableName, EmployerProfiles.tableAlias, EmployerProfiles.tableAlias + '.' + EmployerProfiles.schema.id.columnName + "=" + JobApplications.tableAlias + '.' + JobApplications.schema.employer.columnName);
                    employer_fields = _.without(Object.keys(EmployerProfiles.schema));
                    employer = '';
                    employer_fields.map(function(value){
                        if(EmployerProfiles.schema[value].columnName || typeof EmployerProfiles.schema[value].columnName !== "undefined"){
                            employer += "'"+ value + "'," + EmployerProfiles.tableAlias + "." + EmployerProfiles.schema[value].columnName + ",";
                        }
                    });
                    employer = 'json_build_object(' + employer.slice(0, -1) + ')';
                    group_by += "," + EmployerProfiles.tableAlias + "." + EmployerProfiles.schema.id.columnName;
                    query.field(employer,'employer');
                }
                //Sorting fields
                if(filtered_query_keys.includes('sort')) {
                    var sort = {};
                    const sort_array = filtered_query_data.sort.split(',');
                    if (sort_array.length > 0) {
                        _.forEach(sort_array, function (value, key) {
                            const sort_direction = value.split('.');
                            if (sort_direction.length > 1) {
                                if (sort_direction[1] === 'desc') {
                                    sort[sort_direction[0]] = 'DESC';
                                    query.order(sort_direction[0], false);
                                }else{
                                    query.order(sort_direction[0]);
                                }
                            }
                        });
                    }
                }
                //Setting pagination
                query.limit(filtered_query_data.limit);
                if(filtered_query_keys.includes('page')){
                    filtered_query_data.page = parseInt(filtered_query_data.page);
                    query.offset((filtered_query_data.page-1)*filtered_query_data.limit);
                }
                query.group(group_by);
                //Executing query
                var application_model = sails.sendNativeQuery(query.toString());
                application_model.exec(async function(err, applications_result){
                    if(err){
                        var error = {
                            'field': 'items',
                            'rules': [
                                {
                                    'rule': 'invalid',
                                    'message': err.message
                                }
                            ]
                        };
                        _response_object.errors = [error];
                        _response_object.count = _response_object.errors.count;
                        return response.status(400).json(_response_object);
                    }else{
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
        if(!_.isEmpty(details)){
            _response_object['details'] = _.cloneDeep(details);
        }
        return response.ok(_response_object);
    };
    //Validating the request and pass on the appriopriate response
    validateModel.validate(null, input_attributes, filtered_query_data, async function(valid, errors){
        if(valid){
            filtered_query_data.limit = parseInt(filtered_query_data.limit) > 0 ? parseInt(filtered_query_data.limit) : 10;
            //Preparing data
            await getJobApplications(filtered_query_data, function (applications, details, total) {
                sendResponse(applications, details, total);
            });
        }
        else{
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.ok(_response_object);
        }
    });
};
