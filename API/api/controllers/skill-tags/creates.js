/* global _, SkillTags, sails */

module.exports = async function create(request, response) {

    var _response_object = {};
    var request_data = request.body;
    SkillTags.create(request_data).then(function(skills) {
        _response_object.details = skills;
        return response.status(201).json(_response_object);
    }).catch(async function(err) {
        await errorBuilder.build(err, function(error_obj) {
            _response_object.errors = error_obj;
            _response_object.count = error_obj.length;
            return response.status(500).json(_response_object);
        });
    });

}