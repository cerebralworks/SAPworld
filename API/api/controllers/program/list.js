
/* global _, validateModel, getUserListData, Program, sails */

var squel = require("squel");
const job_type_values = _.values(_.get(sails, 'config.custom.job_types', {}));
module.exports = async function UserList(request, response) {
    var _response_object = {};
    const request_query = request.allParams();
    const filtered_query_data = _.pick(request_query, ['page','status','column','id', 'sort', 'limit','company','view','search']);
    const filtered_query_keys = Object.keys(filtered_query_data);
    var input_attributes = [
        { name: 'page', number: true, min: 0 },
        { name: 'limit', number: true, min: 1 }
       
    ];

    //Find the getUserListData based on general criteria.
    const getUserListData = async( callback) => {
		   var searchQuery =``;
		   if(filtered_query_data.search){
			   searchQuery =`where (
				program.name ilike '%${filtered_query_data.search}%'
				)`;
		   }
			programs = `SELECT * FROM program ${searchQuery}  ORDER BY ${filtered_query_data.sort}
			 LIMIT ${filtered_query_data.limit} OFFSET ${filtered_query_data.page}`
				
			programCount = `SELECT count(*) FROM program ${searchQuery}`
			sails.sendNativeQuery(programs, async function(err, programs) {
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
							
							sails.sendNativeQuery(programCount, async function(errs, programCount) {
								if (errs) {
									var error = {
										'field': 'items',
										'rules': [{
											'rule': 'invalid',
											'message': errs.message
										}]
									};
									_response_object.errors = [error];
									_response_object.count = _response_object.errors.count;
									return response.status(400).json(_response_object);
								} else {
									
									return callback(_.get(programs, 'rows'),_.get(programCount, 'rows'));
								}
							});
					
				}
			});
		
    };


    //Build and sending response
    const sendResponse = (users,total) => {
        _response_object.message = 'programs Details successfully.';
        var meta = {};
        meta['count'] = users.length;
        meta['total'] = total[0]['count'];
        meta['page'] = filtered_query_data.page ? parseInt(filtered_query_data.page) : 1;
        meta['limit'] = filtered_query_data.limit;
		_response_object['meta'] = meta;
		_response_object['items'] = users;
       
        return response.ok(_response_object);
    };

    //Validating the request and pass on the appriopriate response
    validateModel.validate(null, input_attributes, filtered_query_data, async function(valid, errors) {
        if (valid) {
            
            //Preparing data
            await getUserListData( function(users,total) {
                sendResponse(users,total);
            });
        } else {
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });

};
