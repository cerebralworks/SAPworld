/**
 *
 * @author Saravanan Karthikeyan <saravanan@studioq.co.in>
 *
 */

/* global _, EducationalInstitutions, validateModel, sails */

module.exports = async function deleteRecords(request, response) { 
    const post_request_data = request.body;
    var _response_object = {};
    pick_input = [
       'ids'
    ];
    var filtered_post_data = _.pick(post_request_data, pick_input); 
    var input_attributes = [
        {name: 'ids', required:true, array: true, individual_rule: {number: true, min:1}, min:1}
    ]; 

    // Delete the Educational Institution records from db.
    function deleteEducationalInstitution(ids, data, callback){ 
        EducationalInstitutions.update({id: {in: ids}}, data, async function(err, educational_institution){
            if(err){
                await errorBuilder.build(err, function (error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            }else{
                return callback(educational_institution);
            }
        });
    };

    // Check whether the educational institution ids is exits in db.
    function isEducationalInstitutionExist(ids, successCallBack){ 
        EducationalInstitutions.find({where:{
            id: {in: ids},
            'status' : { '!=' : _.get(sails.config.custom.status_codes, 'deleted') } 
            }}, 
            function(err, educational_institution){
                if(_.isEmpty(educational_institution)){
                    _response_object.message = 'No educational institution found with the given ids.';
                    return response.status(404).json(_response_object);
                }else{ 
                    successCallBack();
                }
            }); 
    }

    // Build and send response.
    function sendResponse(details){
        _response_object.message = 'Educational institution has been deleted successfully.';
        _response_object['details'] = details;
        return response.ok(_response_object);
    };
	//Validating the request and pass on the appriopriate response.
    validateModel.validate(EducationalInstitutions, input_attributes, filtered_post_data, async function(valid, errors){
        if(valid){
            const ids = [];
            await filtered_post_data.ids.forEach(function (id) {
                ids.push(parseInt(id));
            });
            filtered_post_data = {status: _.get(sails.config.custom.status_codes, 'deleted')}; 
            isEducationalInstitutionExist(ids, function(){
                deleteEducationalInstitution(ids, filtered_post_data, function (educational_institution) {
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
