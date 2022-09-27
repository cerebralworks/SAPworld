

/* global _, validateModel, Categories */

var squel = require("squel");
module.exports = async function list(request, response) {
    var _response_object = {};
    const request_query = request.allParams();
    const filtered_query_data = _.pick(request_query, ['page', 'sort', 'limit', 'expand', 'search', 'status', 'type', 'parent']);
    var row_deleted_sign = _.get(sails.config.custom.status_codes, 'deleted');
    const filtered_query_keys = Object.keys(filtered_query_data);
    var input_attributes = [
        { name: 'page', number: true, min: 1 },
        { name: 'limit', number: true, min: 1 },
        { name: 'status', enum: true, values: [0, 1] },
        { name: 'type', enum: true, values: [0, 1, row_deleted_sign] },
        { name: 'parent', number: true, min: 1, message: 'Parent should be greater than 0' }
    ];
    var expand = [];
    if (filtered_query_data.expand) {
        expand = filtered_query_data.expand.split(',')
    }
    //Find the Categories based on general criteria.
    const getCategories = async(criteria, callback) => {
        const count_query = await buildNativeQueryToGetCategoryList(criteria, true).then(function(query) {
            return query;
        });
		//return the total value
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
                const list_query = await buildNativeQueryToGetCategoryList(criteria, false).then(function(query) {
                    return query;
                });
				//return the list of data's
                sails.sendNativeQuery(list_query, async function(err, categories) {
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
                        return callback(_.get(categories, 'rows'), {}, parseInt(_.get(_.cloneDeep(total), 'rows[0].count')));
                    }
                });
            }
        });
    };

    //Build sails native query
    const buildNativeQueryToGetCategoryList = async(criteria, count = false) => {

        let query = squel.select({ tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"' }).
        from(Categories.tableName, "category");

        var fields = _.without(Object.keys(Categories.schema), 'parent');

        if (!count) {
            await fields.forEach(function(attribute) {
                query.field(Categories.schema[attribute].columnName);
            });
            if (expand.includes('parent')) {
                let sub_query = squel.select({ tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"' }).
                from(Categories.tableName);
                var build_columns = '';
                await fields.forEach(function(attribute) {
                    build_columns += `'${Categories.schema[attribute].columnName}',${Categories.schema[attribute].columnName},`;
                });
                build_columns = build_columns.slice(0, -1);
                sub_query.field(`json_build_object(${build_columns})`).
                where(`${Categories.schema.id.columnName} = category.${Categories.schema.parent.columnName}`);
                query.field(`(${sub_query.toString()})`, Categories.schema.parent.columnName);
            }
            if (expand.includes('jobs_count')) {
                let sub_query = squel.select({ tableAliasQuoteCharacter: '"', fieldAliasQuoteCharacter: '"' }).from(JobPostings.tableName, "job_posting");
                sub_query.field('COUNT(*)');
                sub_query.where(`category.${Categories.schema.id.columnName} = job_posting.${JobPostings.schema.category.columnName}`);
                query.field(`(${sub_query.toString()})::INTEGER`, 'jobs_count');
            }
        } else {
            query.field("COUNT(*)");
        }

        if (_.get(criteria, 'where.name.contains')) {
            query.where(`${Categories.schema.name.columnName} LIKE '${_.get(criteria, 'where.name.contains')}%'`);
        }
        if (_.get(criteria, 'where.type')) {
            query.where(`${Categories.schema.type.columnName} = ${_.get(criteria, 'where.type')}`);
        }
        if (_.get(criteria, 'where.status')) {
            query.where(`${Categories.schema.status.columnName} = ${_.get(criteria, 'where.status')}`);
        } else {
            // We should not take deleted category into the list. ie: status (row_deleted_sign: variable) indicates the category is had been removed.
            query.where(`${Categories.schema.status.columnName} != ${row_deleted_sign}`);
        }
        if (_.get(criteria, 'where.parent')) {
            query.where(`${Categories.schema.parent.columnName} = ${_.get(criteria, 'where.parent')}`);
        }
        if (count) {
            return query.toString();
        } else {
            if (_.isArray(_.get(criteria, 'sort'))) {
                await _.get(criteria, 'sort').forEach(function(field) {
                    query.order(_.keys(field)[0], field[_.keys(field)[0]] === 'DESC' ? false : true);
                });
            }
            if (_.get(criteria, 'page')) {
                query.offset(_.get(criteria, 'page'));
            }
            return query.limit(_.get(criteria, 'limit')).toString();
        }
    }

    //Build and sending response
    const sendResponse = (items, details, total) => {
        _response_object.message = 'Category items retrieved successfully.';
        var meta = {};
        meta['count'] = items.length;
        meta['total'] = total;
        meta['page'] = filtered_query_data.page ? filtered_query_data.page : 1;
        meta['limit'] = filtered_query_data.limit;
        /*meta['photo'] = {
            path: 'https://s3.' + sails.config.conf.aws.region + '.amazonaws.com/' + sails.config.conf.aws.bucket_name,
            folder: 'public/images/Categories',
            sizes: {
                small: 256,
                medium: 512
            }
        };
        meta['photo'].example = meta['photo'].path + '/' + meta['photo'].folder + '/' + meta['photo'].sizes.medium + '/[filename].[filetype]';*/
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
            filtered_query_data.page = parseInt(filtered_query_data.page);
            var criteria = {
                limit: filtered_query_data.limit,
                where: _.omit(filtered_query_data, ['page', 'limit', 'search', 'expand', 'sort'])
            };
            if (filtered_query_keys.includes('search')) {
                criteria.where.name = { 'contains': filtered_query_data.search };
            }
            if (filtered_query_keys.includes('type')) {
                criteria.where.type = parseInt(filtered_query_data.type);
            }
            if (filtered_query_keys.includes('status')) {
                criteria.where.status = parseInt(filtered_query_data.status);
            }
            if (filtered_query_keys.includes('parent')) {
                criteria.where.parent = parseInt(filtered_query_data.parent);
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
            await getCategories(criteria, function(categories, details, total) {
                sendResponse(categories, details, total);
            });
        } else {
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });

};