/**
 *
 * @author Saravanan Karthikeyan <saravanan@studioq.co.in>
 *
 */

/* global _, EducationalFields, validateModel, sails */

module.exports = async function view(request, response) { 
 
    const request_query = request.allParams();
    const id = parseInt(request_query.id); 
    var _response_object = {};
    var input_attributes = [
       
    ];

    // Check whether the educational field id is exits in db.
    function isEducationalFieldExist(id, successCallBack){ 
        EducationalFields.findOne({where:{
            id: id,
            'status' : { '!=' : _.get(sails.config.custom.status_codes, 'deleted') } 
            }}, 
            function(err, educational_field){
                if(!educational_field){
                    _response_object.message = 'No educational field found with the given id.';
                    return response.status(404).json(_response_object);
                }else{ 
                    successCallBack(educational_field);
                }
            }); 
    }

    // Build and send response.
    function sendResponse(details){
        _response_object.message = 'Educational field item retrieved successfully.';
        _response_object['details'] = details;
        return response.ok(_response_object);
    };
	//Validating the request and pass on the appriopriate response.
    validateModel.validate(EducationalFields, input_attributes, {}, async function(valid, errors){
        if(valid){  
            isEducationalFieldExist(id, function(educational_field){
                sendResponse(educational_field);
            }); 
        }else{
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });
};
