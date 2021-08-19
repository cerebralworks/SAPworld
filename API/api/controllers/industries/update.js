/**
 *
 * @author Abiraman <abiraman@studioq.co.in>
 *
 */

/* global _, Industries */

module.exports = async function update(request, response) {
    //update: function(request, response) {
        const post_request_data = request.body;
        var _response_object = {};
        pick_input = ['name', 'description', 'status'];
        var filtered_post_data = _.pick(post_request_data, pick_input);
        const filtered_post_keys = Object.keys(filtered_post_data);
        var input_attributes = [
            { name: 'id', required: true, number: true },
            { name: 'name', required: true },
            { name: 'status', number: true, min: 0, max: 3 },
            { name: 'description', string: true },
        ];
		//Validating the request and pass on the appriopriate response.
        validateModel.validate(Industries, input_attributes, filtered_post_data, async function(valid, errors) {
            if (valid) {
                Industries.update({ id: filtered_post_data.id }, filtered_post_data, async function(err, industry) {
                    if (err) {
                        await errorBuilder.build(err, function(error_obj) {
                            _response_object.errors = error_obj;
                            _response_object.count = error_obj.length;
                            return response.status(500).json(_response_object);
                        });
                    } else {
                        _response_object.message = 'Industry has been updated successfully.';
                        _response_object.details = profile;
                        return response.status(200).json(_response_object);
                    }
                })
            } else {
                _response_object.errors = errors;
                _response_object.count = errors.length;
                return response.status(400).json(_response_object);
            }
        })

    //},

}