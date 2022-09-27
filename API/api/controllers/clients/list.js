

/* global Client */

module.exports = async function list(request,response) {
    var _response_object = {};
    var request_data = request.param();
	//To show the list of data's
    Clients.find().then(function (clients) {
        _response_object.message = 'Client items retrieved successfully.';
        var meta = {};
        meta['total'] = clients.length;
        meta['count'] = clients.length;
        _response_object['meta'] = meta;
        _response_object['items'] = clients;
        return response.ok(_response_object);
    })
    .catch(function (err) {
        return response.status(500).json(err);
    });
};
