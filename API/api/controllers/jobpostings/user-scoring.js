var squel = require("squel");
var async = require("async");
module.exports = async function Scoring(request, response) {
    const post_request_data = request.allParams();
	const filtered_query_data = _.pick(post_request_data, ['page','expand','id', 'country', 'sort', 'limit', 'expand', 'search', 'status', 'type', 'skills', 'min_salary', 'max_salary', 'min_experience', 'max_experience', 'city', 'alphabet', 'location', 'location_miles', 'is_job_applied', 'company', 'zip_code', 'additional_fields', 'visa_sponsered', 'work_authorization']);
    const filtered_query_keys = Object.keys(filtered_query_data);
    var _response_object = {};
    const logged_in_user = request.user;
    let yup = sails.yup;
    var model = {};
    var score = 4;
    //Build and sending response
    const sendResponse = (items, count) => {
        _response_object.message = 'Job items retrieved successfully.';
        _response_object.score = score;
        var meta = {};
        meta['count'] = count;
        meta['page'] = post_request_data.page ? post_request_data.page : 1;
        meta['limit'] = post_request_data.limit;
        meta['photo'] = {
            path: 'https://s3.' + sails.config.conf.aws.region + '.amazonaws.com/' + sails.config.conf.aws.bucket_name,
            folder: 'public/images/Companies',
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
        _response_object['profile'] = _.cloneDeep(model);
        _response_object['jobs'] = _.cloneDeep(items);
        return response.ok(_response_object);
    };
	
    if (filtered_query_data.skills) {
        filtered_query_data.skills = filtered_query_data.skills.split(',');
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
    if (filtered_query_data.work_authorization) {
        filtered_query_data.work_authorization = parseInt(filtered_query_data.work_authorization);
    }
    if (filtered_query_data.visa_sponsered =="true") {
        filtered_query_data.visa_sponsered = true;
    }
    if (filtered_query_data.visa_sponsered == "false") {
        filtered_query_data.visa_sponsered = false;
    }
	
    yup.object().shape({
        job_id: yup.number().positive(),
        page: yup.number().min(0).default(0),
        work_authorization: yup.number().positive(),
        travel: yup.number().positive(),
        distance: yup.number().positive().default(100),
        availability: yup.number().positive(),
        job_type: yup.number().positive().oneOf([1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008]),
        end_to_end_implementation: yup.number().positive(),
    }).validate(post_request_data, { abortEarly: false }).then(value => {
        model = logged_in_user.user_profile;
        // console.log(model.latlng['coordinates'].toString());
        var list_query = squel.select({ tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"' }).from(JobPostings.tableName, JobPostings.tableAlias);
            list_query.where(`( job_posting.status =1 OR job_posting.id = (SELECT job_application.job_posting FROM job_applications "job_application" WHERE (job_application.job_posting = job_posting.id) AND (job_application.user = ${parseInt(filtered_query_data.id)} ))  )`);
            list_query.where("job_posting.status !=0");
            list_query.where("job_posting.status !=3");
            list_query.where("job_posting.experience <=" + model.experience);
			
			list_query.left_join(`scorings "scoring" ON (scoring.job_id = job_posting.id) `);
			list_query.left_join(`employer_profiles "employer" ON (job_posting.company = employer.id)  `);
			
			//if (filtered_query_data.expand =="company") {
                list_query.field(`employer.company AS "company_name" `);
            //}
			let sub_query = squel.select({ tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"' }).
                from(JobApplications.tableName, JobApplications.tableAlias).
                where(`${JobApplications.tableAlias}.${JobApplications.schema.job_posting.columnName} = ${JobPostings.tableAlias}.${JobPostings.schema.id.columnName}`).
                where(`${JobApplications.tableAlias}.${JobApplications.schema.user.columnName} = ${filtered_query_data.id}`);
                list_query.field(`EXISTS(${sub_query})`, 'is_job_applied');
				
			list_query.where("scoring.job_id =job_posting.id" );
			list_query.where("scoring.user_id  = "+filtered_query_data.id );
			
			if (filtered_query_data.id) {
				let build_job_application_table_columns = '';
				_.forEach(_.keys(JobApplications.schema), attribute => {
					if (!_.isEmpty(JobApplications.schema[attribute].columnName)) {
						build_job_application_table_columns += `'${JobApplications.schema[attribute].columnName}',${JobApplications.tableAlias}.${JobApplications.schema[attribute].columnName},`;
					}
				});
				build_job_application_table_columns = build_job_application_table_columns.slice(0, -1);
				let sub_querys = squel.select({ tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"' }).
				from(JobApplications.tableName, JobApplications.tableAlias).
				field(`json_build_object(${build_job_application_table_columns})`).
				where(`${JobApplications.tableAlias}.${JobApplications.schema.user.columnName} = ${parseInt(filtered_query_data.id)}`).
				where(`${JobApplications.tableAlias}.${JobApplications.schema.job_posting.columnName} = ${JobPostings.tableAlias}.${JobPostings.schema.id.columnName}`).
				limit(1);
				list_query.field(`(${sub_querys.toString()})`, 'job_application');
        }
		
			if (value.job_id) {
				list_query.where("job_posting.id =" + value.job_id);
			}
			if (!value.job_id) {
				list_query.limit(1).offset(value.page - 1);
			}else{
				list_query.limit(1);
			}
			 //Selecting fields
			fields = Object.keys(JobPostings.schema);
			fields.map(function(value) {
				if (JobPostings.schema[value].columnName || typeof JobPostings.schema[value].columnName !== "undefined") {
					list_query.field(JobPostings.tableAlias + '.' + JobPostings.schema[value].columnName, value);
				}
			});
			list_query.field("scoring.score as score");
			var group_by = JobPostings.tableAlias + "." + JobPostings.schema.id.columnName+",scoring.id,employer.id";
			list_query.group(group_by);
			list_query.order('scoring.score', false);
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
                if (profile.length) {
                    profile = profile[0]
					if(profile.score){
						score = profile.score.toFixed(1);
					}

                } else profile = {};
                var count_query = list_query.toString().replace("LIMIT 1", " ").replace("*", "COUNT(*)").replace(`OFFSET ${value.page-1}`, " ");
                var count = sails.sendNativeQuery(count_query, async function(err, job_postings) {
                    sendResponse(profile, job_postings['rowCount']);
                });


            }
        });
    }).catch(err => {
        _response_object.errors = err.inner;
        // _response_object.count = err.inner.length;
        return response.status(400).json(err.inner);
    });
}
