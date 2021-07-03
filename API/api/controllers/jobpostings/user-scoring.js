var squel = require("squel");
var async = require("async");
module.exports = async function Scoring(request, response) {
    const post_request_data = request.allParams();
	const filtered_query_data = _.pick(post_request_data, ['page', 'country', 'sort', 'limit', 'expand', 'search', 'status', 'type', 'skills', 'min_salary', 'max_salary', 'min_experience', 'max_experience', 'city', 'alphabet', 'location', 'location_miles', 'is_job_applied', 'company', 'zip_code', 'additional_fields', 'visa_sponsered', 'work_authorization']);
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
		
		if(model.skills){
		  // var tempData = model.hands_on_experience.map(function(a,b){ return a.skill_id });
			var tempData = model.skills;
	  }
            list_query.where("status=1");
            // .where("experience <=" + model.experience)
            //.where("sap_experience <=" + model.sap_experience)
            list_query.where(`skills && ARRAY[${tempData}]::bigint[]`);
            //.where("lower(city) = lower('" + model.city + "')  OR ST_DistanceSphere(latlng, ST_MakePoint(" + model.latlng['coordinates'].toString() + ")) <=" + value.distance + " * 1609.34");
            //.where("lower(city) = lower('" + model.city + "') ");
		
		
        if (model.job_type) {
            list_query.where(`${JobPostings.tableAlias}.${JobPostings.schema.type.columnName} = ANY('{${model.job_type}}')`);
        }
        if (filtered_query_data.city && model.work_authorization != 1 ) {
            list_query.where(`${JobPostings.tableAlias}.${JobPostings.schema.city.columnName}  = ANY('{${filtered_query_data.city}}')`);
        }
        if (filtered_query_data.country && model.work_authorization != 1 ) {
		list_query.where(`${JobPostings.tableAlias}.${JobPostings.schema.country.columnName}  = ANY('{${filtered_query_data.country}}')`);
        }
        if ( filtered_query_data.visa_sponsered == false && model.work_authorization != 1) {
            list_query.where(`${JobPostings.tableAlias}.${JobPostings.schema.visa_sponsorship.columnName} = ${filtered_query_data.visa_sponsered} `);
        }
        if (filtered_query_data.work_authorization == 1 ) {
		list_query.where(`(${JobPostings.tableAlias}.${JobPostings.schema.visa_sponsorship.columnName} = true or ${JobPostings.tableAlias}.${JobPostings.schema.country.columnName} = ANY('{${filtered_query_data.country}}') or ${JobPostings.tableAlias}.${JobPostings.schema.city.columnName}  = ANY('{${filtered_query_data.city}}') ) `);
        }
		
        if (value.job_id) {
            list_query.where("id =" + value.job_id);
        }
        if (value.work_authorization) {
            list_query.where("work_authorization=" + model.work_authorization);
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
        list_query.limit(1).offset(value.page - 1);
        // var query_string = list_query.toString() + `(CASE WHEN applyed=(
        //     SELECT id from she_job_applications WHERE user=${value.user_id} and job_posting=${JobPostings.tableAlias}.id)
        //     THEN 'true' ELSE 'false' END) `;

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
                } else profile = {};
                var count_query = list_query.toString().replace("LIMIT 1", " ").replace("*", "COUNT(*)").replace(`OFFSET ${value.page-1}`, " ");
                var count = sails.sendNativeQuery(count_query, async function(err, job_postings) {
                    sendResponse(profile, job_postings['rows'][0]['count']);
                });


            }
        });
    }).catch(err => {
        _response_object.errors = err.inner;
        // _response_object.count = err.inner.length;
        return response.status(400).json(err.inner);
    });
}
