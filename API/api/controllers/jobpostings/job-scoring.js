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
    const sendResponse = (items, count, application) => {
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
        _response_object['profile'] = _.cloneDeep(items);
        _response_object['job'] = _.cloneDeep(model);
        _response_object['application'] = _.cloneDeep(application);
        return response.ok(_response_object);
    };
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
        job_type: yup.number().positive().oneOf([0, 1, 2, 3, 4, 5, 6, 7, 8]),
        end_to_end_implementation: yup.number().positive(),
    }).validate(post_request_data, { abortEarly: false }).then(value => {
        var list_query = squel.select({ tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"' }).from(UserProfiles.tableName, UserProfiles.tableAlias)
            .where("status=1")
            // .where("experience >=" + model.experience)
            .where("sap_experience >=" + model.sap_experience)
            .where(`skills && ARRAY[${model.skills}]::bigint[]`)
            .where("lower(city) = lower('" + model.city + "') OR willing_to_relocate=true OR ST_DistanceSphere(latlng, '" + model.latlng + "'::geometry) <=" + value.distance + " * 1609.34");
        if (value.user_id) {
            list_query.where("account =" + value.user_id);
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
        value.page = value.page ? parseInt(value.page) : 1;
        list_query.limit(1).offset(value.page-1);
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
                list_query.limit(1).offset(value.page);
                var count_query = list_query.toString().replace("LIMIT 1", " ").replace("*", "COUNT(*)").replace(`OFFSET ${value.page-1}`, " ");
                var count = sails.sendNativeQuery(count_query, async function(err, job_count) {
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
                                profile = profile[0];
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
                                if (profile.job_application) {
                                    application = profile.job_application;
                                }
                                delete profile.job_application;
                                // if ( model.domain = profile.domains_worked) {
                                //     score += 1;
                                // }
                            } else profile = {};
                            sendResponse(profile, job_count['rowCount'], application);
                        }
                    });
                });
            }
        })

    }).catch(err => {
        _response_object.errors = err.inner;
        // _response_object.count = err.inner.length;
        return response.status(400).json(err.inner);
    });
}
