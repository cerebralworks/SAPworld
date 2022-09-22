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

module.exports = async function list(request,response) {
    var _response_object = {};
    const request_query = request.allParams();
    const logged_in_user = request.user;
    const filtered_query_data = _.pick(request_query, [
        'page', 'sort', 'limit', 'status', 'expand', 'search', 'search_type', 'company'
    ]);
    const filtered_query_keys = Object.keys(filtered_query_data);
    var expand = [];
    if(filtered_query_keys.includes('expand')) {
        expand = filtered_query_data.expand.split(',');
    }
    var input_attributes = [
        {name: 'page', number: true, min: 1},
        {name: 'limit', number: true, min: 1},
        {name: 'status', enum: true, values: [0,1]},
        {name: 'search_type', enum: true, values: [0,1]}
    ];

    //Find the EmployerProfiles based on general criteria.
    const getEmployerProfiles = (criteria, callback) => {
        //Initializing query
        var query = squel.select({tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"'}).from(EmployerProfiles.tableName, EmployerProfiles.tableAlias);
        query.left_join(Users.tableName, Users.tableAlias, Users.tableAlias + '.' + Users.schema.id.columnName + "=" + EmployerProfiles.tableAlias + '.' + EmployerProfiles.schema.account.columnName);
        var group_by = EmployerProfiles.tableAlias + "." + EmployerProfiles.schema.id.columnName;
        group_by += "," + Users.tableAlias + "." + Users.schema.id.columnName;
        if(filtered_query_keys.includes('status')){
            query.where(Users.tableAlias + '.' + Users.schema.status.columnName + "=" + parseInt(criteria.status));
        }else{
            query.where(Users.tableAlias + '.' + Users.schema.status.columnName + "=1");
        }
        if(filtered_query_keys.includes('company')){
            query.where('LOWER(' + EmployerProfiles.tableAlias + '.' + EmployerProfiles.schema.company.columnName + ") LIKE '%" + criteria.company.toLowerCase() + "%'");
        }
        if(filtered_query_keys.includes('search')){
            if(filtered_query_keys.includes('search_type') && parseInt(filtered_query_data.search_type) === 1){
                query.where('LOWER(' + EmployerProfiles.tableAlias + '.' + EmployerProfiles.schema.email.columnName + ") LIKE '%" + criteria.search.toLowerCase() + "%'");
            }else{
                let search_text = squel.expr();
                search_text.or('LOWER(' + EmployerProfiles.tableAlias + '.' + EmployerProfiles.schema.first_name.columnName + ") LIKE '%" + criteria.search.toLowerCase() + "%'");
                search_text.or('LOWER(' + EmployerProfiles.tableAlias + '.' + EmployerProfiles.schema.last_name.columnName + ") LIKE '%" + criteria.search.toLowerCase() + "%'");
                query.where(search_text);
            }
        }
        //Count query
        var count_query = squel.select().field('COUNT(DISTINCT '+ EmployerProfiles.tableAlias + '.' + EmployerProfiles.schema.id.columnName +')').toString();
        query_split = query.toString().split(/FROM(.+)/)[1];
        count_query = count_query + ' FROM ' + query_split.split(' ORDER')[0];
		//To count the records of data filtered
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
                fields = _.without(Object.keys(EmployerProfiles.schema), 'phone');
                fields.map(function(value){
                    if(EmployerProfiles.schema[value].columnName || typeof EmployerProfiles.schema[value].columnName !== "undefined"){
                        query.field(EmployerProfiles.tableAlias + '.' + EmployerProfiles.schema[value].columnName, value);
                    }
                });
                //Populating expand values
                if(expand.includes('account')){
                    user_fields = _.without(Object.keys(Users.schema), 'username', 'password', 'tokens');
                    user = '';
                    user_fields.map(function(value){
                        if(Users.schema[value].columnName || typeof Users.schema[value].columnName !== "undefined"){
                            user += "'"+ value + "'," + Users.tableAlias + "." + Users.schema[value].columnName + ",";
                        }
                    });
                    user = 'json_build_object(' + user.slice(0, -1) + ')';
                    query.field(user,'account');
                }
                if(expand.includes('city')){
                    let sub_query = squel.select({tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"'}).from(Cities.tableName, Cities.tableAlias);
                    sub_query.where(Cities.tableAlias + "." + Cities.schema.id.columnName + '=' + EmployerProfiles.tableAlias + "." + EmployerProfiles.schema.city.columnName);
                    city_fields = _.without(Object.keys(Cities.schema));
                    city = '';
                    city_fields.map(function(value){
                        if(Cities.schema[value].columnName || typeof Cities.schema[value].columnName !== "undefined"){
                            city += "'"+ value + "'," + Cities.tableAlias + "." + Cities.schema[value].columnName + ",";
                        }
                    });
                    if(expand.includes('state')){
                        sub_query.left_join(States.tableName, States.tableAlias, States.tableAlias + '.' + States.schema.id.columnName + "=" + Cities.tableAlias + '.' + Cities.schema.state.columnName);
                        state_fields = _.without(Object.keys(States.schema));
                        state = '';
                        state_fields.map(function(value){
                            if(States.schema[value].columnName || typeof States.schema[value].columnName !== "undefined"){
                                state += "'"+ value + "'," + States.tableAlias + "." + States.schema[value].columnName + ",";
                            }
                        });
                        state = 'json_build_object(' + state.slice(0, -1) + ')';
                        city += "'"+ Cities.schema.state.columnName + "'," + state + ",";
                    }
                    if(expand.includes('country')){
                        sub_query.left_join(Countries.tableName, Countries.tableAlias, Countries.tableAlias + '.' + Countries.schema.id.columnName + "=" + Cities.tableAlias + '.' + Cities.schema.country.columnName);
                        country_fields = _.without(Object.keys(Countries.schema));
                        country = '';
                        country_fields.map(function(value){
                            if(Countries.schema[value].columnName || typeof Countries.schema[value].columnName !== "undefined"){
                                country += "'"+ value + "'," + Countries.tableAlias + "." + Countries.schema[value].columnName + ",";
                            }
                        });
                        country = 'json_build_object(' + country.slice(0, -1) + ')';
                        city += "'"+ Cities.schema.country.columnName + "'," + country + ",";
                    }
                    city = 'json_build_object(' + city.slice(0, -1) + ')';
                    sub_query.field(city);
                    query.field('(' + sub_query.toString() + ')', 'city');
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
       /* meta['photo'] = {
          path: 'https://s3.' + sails.config.conf.aws.region + '.amazonaws.com/' + sails.config.conf.aws.bucket_name,
          folder: 'public/images/Users',
          sizes: {
            small: 256,
            medium: 512,
            large: 1024,
          }
        };
        meta['photo'].example = meta['photo'].path + '/' + meta['photo'].folder + '/' + meta['photo'].sizes.medium + '/user-209.png';*/
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
            await getEmployerProfiles(filtered_query_data, function (applications, details, total) {
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
