/**
 *
 * @author Abiraman <abiraman@studioq.co.in>
 *
 */

/* global _, Industries */

module.exports = async function create(request, response) {

        var _response_object = {};
        var request_data = request.body;
        Industries.create(request_data).then(function(industry) {
            _response_object.details = industry;
            _response_object.message = 'Client created successfully';
            return response.status(201).json(_response_object);
        }).catch(async function(err) {
            await errorBuilder.build(err, function(error_obj) {
                _response_object.errors = error_obj;
                _response_object.count = error_obj.length;
                return response.status(500).json(_response_object);
            });
        });

}