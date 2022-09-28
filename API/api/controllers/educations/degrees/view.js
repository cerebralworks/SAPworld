

/* global _, EducationalDegrees, validateModel, sails */

module.exports = async function view(request, response) { 
 
    const request_query = request.allParams();
    const id = parseInt(request_query.id); 
    var _response_object = {};
    var input_attributes = [
       
    ];

    // Check whether the educational degree id is exits in db.
    function isEducationalDegreeExist(id, successCallBack){ 
        EducationalDegrees.findOne({where:{
            id: id,
            'status' : { '!=' : _.get(sails.config.custom.status_codes, 'deleted') } 
            }}, 
            function(err, educational_degree){
                if(!educational_degree){
                    _response_object.message = 'No educational degree found with the given id.';
                    return response.status(404).json(_response_object);
                }else{ 
                    successCallBack(educational_degree);
                }
            }); 
    }

    // Build and send response.
    function sendResponse(details){
        _response_object.message = 'Educational degree item retrieved successfully.';
        _response_object['details'] = details;
        return response.ok(_response_object);
    };
	//Validating the request and pass on the appriopriate response.
    validateModel.validate(EducationalDegrees, input_attributes, {}, async function(valid, errors){
        if(valid){  
            isEducationalDegreeExist(id, function(educational_degree){
                sendResponse(educational_degree);
            }); 
        }else{
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });
};
