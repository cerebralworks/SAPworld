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

/* global _, validateModel, EmployerProfiles, cuisineEmployerProfiles */

var squel = require("squel");
var async = require("async");

module.exports = async function list(request, response) {
    var _response_object = {};
    const request_query = request.allParams();
    const logged_in_user = request.user;
    const filtered_query_data = _.pick(request_query, [
        'page', 'sort', 'limit', 'status', 'expand', 'search', 'search_type', 'company'
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
        { name: 'search_type', enum: true, values: [0, 1] }
    ];

    //Find the EmployerProfiles based on general criteria.
    const getEmployerProfiles = (criteria, callback) => {
        //Initializing query
        var query = squel.select({ tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"' }).from(SavedProfile.tableName, SavedProfile.tableAlias);
        query.left_join(UserProfiles.tableName, UserProfiles.tableAlias, UserProfiles.tableAlias + '.' + UserProfiles.schema.id.columnName + "=" + SavedProfile.tableAlias + '.' + SavedProfile.schema.user_id.columnName);
        var group_by = SavedProfile.tableAlias + "." + SavedProfile.schema.id.columnName;
        group_by += "," + UserProfiles.tableAlias + "." + UserProfiles.schema.id.columnName;

        if (filtered_query_keys.includes('search')) {
            if (filtered_query_keys.includes('search_type') && parseInt(filtered_query_data.search_type) === 1) {
                query.where('LOWER(' + UserProfiles.tableAlias + '.' + UserProfiles.schema.email.columnName + ") LIKE '%" + criteria.search.toLowerCase() + "%'");
            } else {
                let search_text = squel.expr();
                search_text.or('LOWER(' + UserProfiles.tableAlias + '.' + UserProfiles.schema.first_name.columnName + ") LIKE '%" + criteria.search.toLowerCase() + "%'");
                search_text.or('LOWER(' + UserProfiles.tableAlias + '.' + UserProfiles.schema.last_name.columnName + ") LIKE '%" + criteria.search.toLowerCase() + "%'");
                search_text.or('LOWER(' + UserProfiles.tableAlias + '.' + UserProfiles.schema.city.columnName + ") LIKE '%" + criteria.search.toLowerCase() + "%'");
                search_text.or('LOWER(' + UserProfiles.tableAlias + '.' + UserProfiles.schema.state.columnName + ") LIKE '%" + criteria.search.toLowerCase() + "%'");
                search_text.or('LOWER(' + UserProfiles.tableAlias + '.' + UserProfiles.schema.country.columnName + ") LIKE '%" + criteria.search.toLowerCase() + "%'");
                query.where(search_text);
            }
        }
        //Count query
        var count_query = squel.select().field('COUNT(DISTINCT ' + SavedProfile.tableAlias + '.' + SavedProfile.schema.id.columnName + ')').toString();
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
                fields = _.without(Object.keys(UserProfiles.schema), 'phone');
                fields.map(function(value) {
                    if (UserProfiles.schema[value].columnName || typeof UserProfiles.schema[value].columnName !== "undefined") {
                        query.field(UserProfiles.tableAlias + '.' + UserProfiles.schema[value].columnName, value);
                    }
                });


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
            await getEmployerProfiles(filtered_query_data, function(applications, details, total) {
                sendResponse(applications, details, total);
            });
        } else {
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.ok(_response_object);
        }
    });
};