/**
 *
 * @author Saravanan Karthikeyan <saravanan@studioq.co.in>
 *
 */

/* global _, EducationalFields, validateModel, sails */

var squel = require("squel");
module.exports = function create(request, response) {
    const post_request_data = request.body;
    var _response_object = {};
    pick_input = [
        'name', 'description'
    ];
    var filtered_post_data = _.pick(post_request_data, pick_input);
    const filtered_post_keys = Object.keys(filtered_post_data); 
    var input_attributes = [ 
        {name: 'name', required: true}
    ]; 

    // Create a Educational Field in db.
    function createEducationalField(data, successCallBack){
        EducationalFields.create(data, async function(err, educational_field){
            if(err){
                await errorBuilder.build(err, function (error_obj) {
                    _response_object = {};
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            }else{
                successCallBack(educational_field); 
            }
        });
    } 

    // Check whether the name of educational field is unique in db.
    function isEducationalFieldNameIsUnique(name, successCallBack){
        EducationalFields.find(name, async function(err, educational_field){ 
            if(_.isEmpty(educational_field)){
                successCallBack();
            }else{
                _response_object = {};
                _response_object.details = {};
                _response_object.details.field = 'name';
                _response_object.details.rule = 'unique';
                _response_object.message = 'The value that you given for the attribute name has already exist.';
                return response.status(400).json(_response_object);
            }
        });
    }

    // Build and send response.
    function sendResponse(details){
        _response_object = {};
        _response_object.message = 'Educational field has been created successfully.';
        _response_object.details = details;
        return response.status(200).json(_response_object);
    };
	//Validating the request and pass on the appriopriate response.
    validateModel.validate(EducationalFields, input_attributes, filtered_post_data, async function(valid, errors){
        if(valid){ 
            if(filtered_post_keys.includes('name')){ 
                filtered_post_data.name = filtered_post_data.name.toLowerCase();
            }
            isEducationalFieldNameIsUnique(_.pick(filtered_post_data, ['name']), function(){ 
                createEducationalField(filtered_post_data, function(educational_field){
                    sendResponse(educational_field);
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
