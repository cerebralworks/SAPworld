var squel = require("squel");
var async = require("async");
module.exports = async function Scoring(request, response) {
    const post_request_data = request.allParams();
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
    yup.object().shape({
        job_id: yup.number().positive(),
        page: yup.number().min(0).default(0),
        work_authorization: yup.number().positive(),
        travel: yup.number().positive(),
        distance: yup.number().positive().default(100),
        availability: yup.number().positive(),
        job_type: yup.number().positive().oneOf([0, 1, 2, 3, 4, 5, 6, 7, 8]),
        end_to_end_implementation: yup.number().positive(),
    }).validate(post_request_data, { abortEarly: false }).then(value => {
        model = logged_in_user.user_profile;
        // console.log(model.latlng['coordinates'].toString());
        var list_query = squel.select({ tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"' }).from(JobPostings.tableName, JobPostings.tableAlias)
            .where("status=1")
            // .where("experience <=" + model.experience)
            .where("sap_experience <=" + model.sap_experience)
            .where(`skills && ARRAY[${model.skills}]::bigint[]`)
            .where("lower(city) = lower('" + model.city + "')  OR ST_DistanceSphere(latlng, ST_MakePoint(" + model.latlng['coordinates'].toString() + ")) <=" + value.distance + " * 1609.34");

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
