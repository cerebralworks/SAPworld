/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/* global _, EmployerProfiles, UserInformation, Users, sails */

module.exports = function update(request, response) {
    const post_request_data = request.body;
    const logged_in_user = request.user;
    var _response_object = {};
    pick_input = [
        'first_name', 'last_name', 'company', 'department', 'city', 'country_code',
        'address_line_1', 'address_line_2', 'state', 'zipcode', 'description','privacy_protection'
    ];
    var filtered_post_data = _.pick(post_request_data, pick_input);
    const filtered_post_keys = Object.keys(filtered_post_data);
    var input_attributes = [
        { name: 'city' },
        { name: 'country_code'},
        { name: 'company' },
        { name: 'department'},
        { name: 'description' },
        { name: 'address_line_1' },
        { name: 'state' },
        { name: 'privacy_protection' },
    ];
	//Validating the request and pass on the appriopriate response.
    validateModel.validate(EmployerProfiles, input_attributes, filtered_post_data, async function(valid, errors) {
        if (valid) {
            filtered_not_post_keys = _.difference(pick_input, filtered_post_keys);
            filtered_not_post_keys.map(function(value) {
                filtered_post_data[value] = null;
            });
            var id;
            if (_.indexOf(logged_in_user.types, 2) < 0) {
                id = logged_in_user.employer_profile.id;
            } else if (post_request_data.id && parseInt(post_request_data.id) > 0) {
                id = parseInt(post_request_data.id);
            } else {
                _response_object.errors = [{ field: 'id', rules: [{ rule: 'required', message: 'id is required.' }] }];
                _response_object.count = 1;
                return response.status(400).json(_response_object);
            }
            EmployerProfiles.update({ id: id }, filtered_post_data, async function(err, profile) {
                if (err) {
                    await errorBuilder.build(err, function(error_obj) {
                        _response_object.errors = error_obj;
                        _response_object.count = error_obj.length;
                        return response.status(500).json(_response_object);
                    });
                } else {
                    if (profile[0].email) {
                        delete profile[0].email;
                    }
                    if (profile[0].phone) {
                        delete profile[0].phone;
                    }
                    _response_object.message = 'Profile has been updated successfully.';
                    _response_object.details = profile;
                    return response.status(200).json(_response_object);
                }
            });
        } else {
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });
};