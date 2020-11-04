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

module.exports = async function view(request,response) {
    var _response_object = {};
    const request_query = request.allParams();
    const logged_in_user = request.user;
    const filtered_query_data = _.pick(request_query, ['id', 'expand']);
    const filtered_query_keys = Object.keys(filtered_query_data);
    var input_attributes = [
      {name: 'id', required: true, number: true},
    ];
    var expand = [];
    if(filtered_query_keys.includes('expand')) {
        expand = filtered_query_data.expand.split(',');
    }
    //Find the JobApplications based on general criteria.
    const getJobApplication = (criteria, callback) => {
        //Initializing query
        var query = squel.select({tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"'}).from(JobApplications.tableName, JobApplications.tableAlias);
        var group_by = JobApplications.tableAlias + "." + JobApplications.schema.id.columnName;
        query.where(JobApplications.tableAlias + '.' + JobApplications.schema.id.columnName + "=" + parseInt(filtered_query_data.id));
        if(_.indexOf(logged_in_user.types,2) < 0){
            query.where(JobApplications.tableAlias + '.' + JobApplications.schema.employer.columnName + "=" + logged_in_user.employer_profile.id);
        }
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
                if(JobPostings.schema[value].columnName || typeof JobPostings.schema[value].columnName !== "undefined"){
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
                if(UserProfiles.schema[value].columnName || typeof UserProfiles.schema[value].columnName !== "undefined"){
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
        //Setting pagination
        query.limit(1);
        query.group(group_by);
        //Executing query
        var application_model = sails.sendNativeQuery(query.toString());
        application_model.exec(async function(err, applications_result){
            if(applications_result && applications_result.rows && applications_result.rows.length > 0){
                return callback(applications_result.rows[0]);
            }else{
                _response_object.message = 'No job application found with the given id.';
                return response.status(404).json(_response_object);
            }
        });
    };
    //Build and sending response
    const sendResponse = (details) => {
        _response_object.message = 'Job application details retrieved successfully.';
        var meta = {};
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
        _response_object['details'] = _.cloneDeep(details);
        return response.ok(_response_object);
    };
    //Validating the request and pass on the appriopriate response
    validateModel.validate(null, input_attributes, filtered_query_data, async function(valid, errors){
        if(valid){
            //Preparing data
            await getJobApplication(filtered_query_data, function (details) {
                sendResponse(details);
            });
        }
        else{
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.ok(_response_object);
        }
    });
};
