
/* global _, validateModel, Areas */

module.exports = async function list(request,response) {
    var _response_object = {};
    const request_query = request.allParams();
    const filtered_query_data = _.pick(request_query, ['page', 'sort', 'limit', 'search', 'status', 'expand', 'city', 'state', 'country']);
    const filtered_query_keys = Object.keys(filtered_query_data);
    var input_attributes = [
        {name: 'page', number: true, min: 1},
        {name: 'limit', number: true, min: 1},
        {name: 'status', enum: true, values: [0,1]},
        {name: 'city', number: true, min: 1},
        {name: 'state', number: true, min: 1}
    ];
    var expand = [];
    if(filtered_query_data.expand){
        expand = filtered_query_data.expand.split(',');
    }

    //Find the Areas based on general criteria.
    const getAreas = (criteria, callback) => {
        Areas.count(criteria.where,function (err, total) {
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
            }else if(total < 1){
                return callback([], {}, total);
            }else{
                var area_model = Areas.find(criteria);
                if(expand.includes('state')){
                    area_model.populate('state');
                }
                area_model.exec(async function(err, areas){
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
                        return callback(areas, {}, total);
                    }
                });
            }
        });
    };

    //Build and sending response
    const sendResponse = (items, details, total) => {
        _response_object.message = 'Area items retrieved successfully.';
        var meta = {};
        meta['count'] = items.length;
        meta['total'] = total;
        meta['page'] = filtered_query_data.page ? filtered_query_data.page : 1;
        meta['limit'] = filtered_query_data.limit;
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
            filtered_query_data.page = parseInt(filtered_query_data.page);
            var criteria = {
                limit: filtered_query_data.limit,
                where: _.omit(filtered_query_data, ['page', 'limit', 'search', 'expand', 'sort'])
            };
            if(filtered_query_keys.includes('search')) {
                criteria.where.name = {'contains': filtered_query_data.search};
            }
            if(filtered_query_keys.includes('city')) {
                criteria.where.city = parseInt(filtered_query_data.city);
            }
            if(filtered_query_keys.includes('state')) {
                criteria.where.state = parseInt(filtered_query_data.state);
            }
            if(filtered_query_keys.includes('country')) {
                criteria.where.country = filtered_query_data.country;
            }
            if(filtered_query_keys.includes('page')) {
                criteria.skip = ((parseInt(filtered_query_data.page))-1)*criteria.limit;
            }
            if(filtered_query_keys.includes('status')) {
                criteria.where.status = filtered_query_data.status;
            }else{
                criteria.where.status = 1;
            }
            if(filtered_query_keys.includes('sort')) {
                criteria.sort = [];
                const sort_array = filtered_query_data.sort.split(',');
                if (sort_array.length > 0) {
                    _.forEach(sort_array, function (value, key) {
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
            await getAreas(criteria, function (areas, details, total) {
                sendResponse(areas, details, total);
            });
        }
        else{
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });

};
