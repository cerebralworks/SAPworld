/**
 *
 * @author Saravanan Karthikeyan <saravanan@studioq.co.in>
 *
 */

/* global _, EducationalInstitutions, validateModel, sails */

module.exports = async function update(request, response) {
    const post_request_data = request.body; 
    const request_query = request.allParams();
    const id = parseInt(request_query.id);
    var _response_object = {};
    pick_input = [
        'status', 'status_glossary'
    ];
    var filtered_post_data = _.pick(post_request_data, pick_input);
    const filtered_post_keys = Object.keys(filtered_post_data); 
    var input_attributes = [
        {name: 'status', enum: true, values: _.values(_.pick(sails.config.custom.status_codes,['inactive', 'active'] )), required: true},
    ]; 
    if(filtered_post_keys.includes('status') && parseInt(filtered_post_data.status) === _.get(sails.config.custom.status_codes, 'inactive')){ 
        input_attributes.push({name: 'status_glossary', required: true});
    } 
 
    // Update the Educational Institution record to db.
    function updateEducationalInstitution(id, data, callback){ 
        EducationalInstitutions.update(id, data, async function(err, educational_institution){
            if(err){
                await errorBuilder.build(err, function (error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            }else{
                return callback(educational_institution[0]);
            }
        });
    };

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
        if(parseInt(details.status) === 1){
            _response_object.message = 'Educational institution has been activated successfully.';
        }else{
            _response_object.message = 'Educational institution has been deactivated successfully.';
        }
        _response_object['details'] = {id: details.id, status: details.status};
        return response.ok(_response_object);
    };
	//Validating the request and pass on the appriopriate response.
    validateModel.validate(EducationalInstitutions, input_attributes, filtered_post_data, async function(valid, errors){
        if(valid){ 
            if(filtered_post_keys.includes('status')){
                filtered_post_data.status = parseInt(filtered_post_data.status);
            }    
            isEducationalInstitutionExist(id, function(educational_institution){ 
                updateEducationalInstitution(id, filtered_post_data, function (educational_institution) {
                    sendResponse(educational_institution);
                });
            }); 
        }else{
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });
};
