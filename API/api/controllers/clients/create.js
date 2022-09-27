

/* global Clients */

module.exports = function create(request,response) {
    var _response_object = {};
    var request_data = request.body;
	//create a new client data
    Clients.create(request_data).then(function (client) {
        _response_object.details = client;
        _response_object.message = 'Client created successfully';
        return response.status(201).json(_response_object);
    }).catch(async function (err) {
        await errorBuilder.build(err,function (error_obj) {
            _response_object.errors = error_obj;
            _response_object.count = error_obj.length;
            return response.status(500).json(_response_object);
        });
    });
};
