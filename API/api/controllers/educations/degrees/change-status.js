

/* global _, EducationalDegrees, validateModel, sails */

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
 
    // Update the Educational Degree record to db.
    function updateEducationalDegree(id, data, callback){ 
        EducationalDegrees.update(id, data, async function(err, educational_degree){
            if(err){
                await errorBuilder.build(err, function (error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            }else{
                return callback(educational_degree[0]);
            }
        });
    };

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
        if(parseInt(details.status) === 1){
            _response_object.message = 'Educational degree has been activated successfully.';
        }else{
            _response_object.message = 'Educational degree has been deactivated successfully.';
        }
        _response_object['details'] = {id: details.id, status: details.status};
        return response.ok(_response_object);
    };
	//Validating the request and pass on the appriopriate response.
    validateModel.validate(EducationalDegrees, input_attributes, filtered_post_data, async function(valid, errors){
        if(valid){ 
            if(filtered_post_keys.includes('status')){
                filtered_post_data.status = parseInt(filtered_post_data.status);
            }    
            isEducationalDegreeExist(id, function(educational_degree){ 
                updateEducationalDegree(id, filtered_post_data, function (educational_degree) {
                    sendResponse(educational_degree);
                });
            }); 
        }else{
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });
};
