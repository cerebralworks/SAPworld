/**
 *
 * @author Saravanan Karthikeyan <saravanan@studioq.co.in>
 *
 */

/* global _, EducationalInstitutions, validateModel, sails */

module.exports = async function view(request, response) { 
 
    const request_query = request.allParams();
    const id = parseInt(request_query.id); 
    var _response_object = {};
    var input_attributes = [
        {name: 'id', number: true},
    ];

    // Check whether the educational institution id is exits in db.
    function isEducationalInstitutionExist(id, successCallBack){ 
        EducationalInstitutions.findOne({where:{
            id: id,
            'status' : { '!=' : _.get(sails.config.custom.status_codes, 'deleted') } 
            }}, 
            function(err, educational_institution){
                if(!educational_institution){
                    _response_object.message = 'No educational institution found with the given id.';
                    return response.status(404).json(_response_object);
                }else{ 
                    successCallBack(educational_institution);
                }
            }); 
    }

    // Build and send response.
    function sendResponse(details){
        _response_object.message = 'Educational institution item retrieved successfully.';
        _response_object['details'] = details;
        return response.ok(_response_object);
    };

    validateModel.validate(EducationalInstitutions, input_attributes, {id}, async function(valid, errors){
        if(valid){  
            isEducationalInstitutionExist(id, function(educational_institution){
                sendResponse(educational_institution);
            }); 
        }else{
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });
};
