/**
 *
 * @author Saravanan Karthikeyan <saravanan@studioq.co.in>
 *
 */

/* global _, EducationalInstitutions, validateModel, sails */

var squel = require("squel");
module.exports = function create(request, response) {
    const post_request_data = request.body;
    var _response_object = {};
    pick_input = [
        'name', 'description', 'address'
    ];
    var filtered_post_data = _.pick(post_request_data, pick_input);
    const filtered_post_keys = Object.keys(filtered_post_data); 
    var input_attributes = [ 
        {name: 'name', required: true},
        {name: 'address', required: true}
    ]; 

    // Create a Educational Institution in db.
    function createEducationalInstitution(data, successCallBack){
        EducationalInstitutions.create(data, async function(err, educational_institution){
            if(err){
                await errorBuilder.build(err, function (error_obj) {
                    _response_object = {};
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            }else{
                successCallBack(educational_institution); 
            }
        });
    } 

    // Check whether the name of educational institution is unique in db.
    function isEducationalInstitutionNameIsUnique(name, successCallBack){
        EducationalInstitutions.find(name, async function(err, educational_institution){ 
            if(_.isEmpty(educational_institution)){
                successCallBack();
            }else{
                _response_object = {};
                _response_object.details = {};
                _response_object.details.institution = 'name';
                _response_object.details.rule = 'unique';
                _response_object.message = 'The value that you given for the attribute name has already exist.';
                return response.status(400).json(_response_object);
            }
        });
    }

    // Build and send response.
    function sendResponse(details){
        _response_object = {};
        _response_object.message = 'Educational institution has been created successfully.';
        _response_object.details = details;
        return response.status(200).json(_response_object);
    };

    validateModel.validate(EducationalInstitutions, input_attributes, filtered_post_data, async function(valid, errors){
        if(valid){ 
            if(filtered_post_keys.includes('name')){ 
                filtered_post_data.name = filtered_post_data.name.toLowerCase();
            }
            isEducationalInstitutionNameIsUnique(_.pick(filtered_post_data, ['name']), function(){ 
                createEducationalInstitution(filtered_post_data, function(educational_institution){
                    sendResponse(educational_institution);
                });
            });
        }
        else{
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    }); 
};
