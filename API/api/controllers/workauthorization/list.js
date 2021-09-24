/* global _, WorkAuthorization, validateModel, sails */

module.exports = async function list(request, response) {
    var _response_object = {};
    const request_query = request.allParams();
    const filtered_query_data = _.pick(request_query, ['page', 'sort','sorting', 'limit', 'search', 'status', 'program_name_ids']);
    const filtered_query_keys = Object.keys(filtered_query_data);
    var input_attributes = [
        { name: 'page', number: true, min: 1 },
        { name: 'limit', number: true, min: 1 },
        { name: 'status', enum: true, values: _.values(_.pick(sails.config.custom.status_codes, ['inactive', 'active'])) },
        { name: 'program_name_ids', array: true, individual_rule: { number: true, min: 1 }, message: "Has to be a comma seperated integer. ie: each value should be greater than 0." },
    ];

    if (filtered_query_keys.includes('program_name_ids')) {
        filtered_query_data.program_name_ids = filtered_query_data.program_name_ids.split(',');
    }

    //Find the Program based on general criteria.
    const getWrkauth = (criteria, callback) => {
        WorkAuthorization.count(criteria.where, function(err, total) {
            if (err) {
                var error = {
                    'name': 'count',
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
                var program_name_model = WorkAuthorization.find(criteria).meta({ makeLikeModifierCaseInsensitive: true });;
                program_name_model.exec(async function(err, workAuthorization) {
                    if (err) {
                        var error = {
                            'name': 'items',
                            'rules': [{
                                'rule': 'invalid',
                                'message': err.message
                            }]
                        };
                        _response_object.errors = [error];
                        _response_object.count = _response_object.errors.count;
                        return response.status(400).json(_response_object);
                    } else {
                        return callback(workAuthorization, {}, total);
                    }
                });
            }
        });
    };

    //Build and sending response.
    const sendResponse = (items, details, total) => {
        _response_object.message = 'workAuthorization name items retrieved successfully.';
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
                where: _.omit(filtered_query_data, ['page', 'limit', 'search','sorting', 'sort', 'program_name_ids'])
            };
            if (filtered_query_keys.includes('search')) {
                criteria.where.name = { 'like': "%" + filtered_query_data.search.toLowerCase() + "%" };
            }
            if (filtered_query_keys.includes('page')) {
                criteria.skip = ((parseInt(filtered_query_data.page)) - 1) * criteria.limit;
            }
            if (filtered_query_keys.includes('program_name_ids')) {
                criteria.where.id = { 'in': filtered_query_data.program_name_ids };
            }
            if (filtered_query_keys.includes('status')) {
                criteria.where.status = filtered_query_data.status;
            } else {
                // We should exclude deleted skill tags.
                criteria.where.status = { '!=': _.get(sails.config.custom.status_codes, 'deleted') };
            }
			if(!filtered_query_keys.includes('sorting')){
				criteria.sort = "id desc"
			}
			else{
				criteria.sort = filtered_query_data.sorting;
			}
            
            //Preparing data.
            await getWrkauth(criteria, function(workAuthorization, details, total) {
                sendResponse(workAuthorization, details, total);
            });
        } else {
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });

};