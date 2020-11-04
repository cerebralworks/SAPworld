/**
 *
 * @author Saravanan Karthikeyan <saravanan@studioq.co.in>
 *
 */

/* global _, Industries, validateModel, sails */

module.exports = async function list(request, response) {
    var _response_object = {};
    const request_query = request.allParams();
    const filtered_query_data = _.pick(request_query, ['page', 'sort', 'limit', 'search', 'status']);
    const filtered_query_keys = Object.keys(filtered_query_data);
    var input_attributes = [
        { name: 'page', number: true, min: 1 },
        { name: 'limit', number: true, min: 1 },
        { name: 'status', enum: true, values: _.values(_.pick(sails.config.custom.status_codes, ['inactive', 'active'])) }
    ];

    //Find the Industries based on general criteria.
    const getIndustries = (criteria, callback) => {
        Industries.count(criteria.where, function(err, total) {
            if (err) {
                var error = {
                    'institution': 'count',
                    'rules': [{
                        'rule': 'invalid',
                        'message': err.message
                    }]
                };
                _response_object.errors = [error];
                _response_object.count = _response_object.errors.count;
                return response.status(400).json(_response_object);
            } else if (total < 1) {
                return callback([], {}, total);
            } else {
                var industries_model = Industries.find(criteria);
                industries_model.exec(async function(err, industries) {
                    if (err) {
                        var error = {
                            'institution': 'items',
                            'rules': [{
                                'rule': 'invalid',
                                'message': err.message
                            }]
                        };
                        _response_object.errors = [error];
                        _response_object.count = _response_object.errors.count;
                        return response.status(400).json(_response_object);
                    } else {
                        return callback(industries, {}, total);
                    }
                });
            }
        });
    };

    //Build and sending response.
    const sendResponse = (items, details, total) => {
        _response_object.message = 'Industry items retrieved successfully.';
        var meta = {};
        meta['count'] = items.length;
        meta['total'] = total;
        meta['page'] = filtered_query_data.page ? filtered_query_data.page : 1;
        meta['limit'] = filtered_query_data.limit;
        _response_object['meta'] = meta;
        _response_object['items'] = _.cloneDeep(items);
        if (!_.isEmpty(details)) {
            _response_object['details'] = _.cloneDeep(details);
        }
        return response.ok(_response_object);
    };

    //Validating the request and pass on the appriopriate response.
    validateModel.validate(null, input_attributes, filtered_query_data, async function(valid, errors) {
        if (valid) {
            filtered_query_data.limit = parseInt(filtered_query_data.limit) > 0 ? parseInt(filtered_query_data.limit) : 10;
            filtered_query_data.page = parseInt(filtered_query_data.page);
            var criteria = {
                limit: filtered_query_data.limit,
                where: _.omit(filtered_query_data, ['page', 'limit', 'search', 'sort'])
            };
            if (filtered_query_keys.includes('search')) {
                criteria.where.name = { 'contains': filtered_query_data.search };
            }
            if (filtered_query_keys.includes('page')) {
                criteria.skip = ((parseInt(filtered_query_data.page)) - 1) * criteria.limit;
            }
            if (filtered_query_keys.includes('status')) {
                criteria.where.status = filtered_query_data.status;
            } else {
                // We should exclude deleted educational institutions.
                criteria.where.status = { '!=': _.get(sails.config.custom.status_codes, 'deleted') };
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
            //Preparing data.
            await getIndustries(criteria, function(industries, details, total) {
                sendResponse(industries, details, total);
            });
        } else {
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });

};