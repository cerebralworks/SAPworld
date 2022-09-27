
/* global _, Categories, sails */

module.exports = async function update(request, response) {
    const post_request_data = request.body; 
    const request_query = request.allParams();
    const id = parseInt(request_query.id);
    var _response_object = {};
    pick_input = [
        'name', 'description'
    ];
    var filtered_post_data = _.pick(post_request_data, pick_input);
    const filtered_post_keys = Object.keys(filtered_post_data); 
    var input_attributes = [
        
    ]; 
    if(filtered_post_keys.includes('name') && _.isEmpty(_.get(filtered_post_data, 'name'))){ 
        input_attributes.push({name: 'name', required: true});
    }
    
    //Update the Category record to db.
    const updateRecord = (post_data, callback) => { 
        Categories.update(id, post_data, async function(err, category){
            if(err){
                await errorBuilder.build(err, function (error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            }else{
                return callback(category[0]);
            }
        });
    };

    // Check whether the category id is exits in db.
    function isCategoryExist(id, successCallBack){ 
        Categories.findOne({where:{
            id: id,
            'status' : _.get(sails.config.custom.status_codes, 'active')
            }}, 
            function(err, category){
                if(!category){
                    _response_object.message = 'No category found with the given id.';
                    return response.status(404).json(_response_object);
                }else{ 
                    successCallBack(category);
                }
            }); 
    }

    // Build and send response.
    function sendResponse(details){
        _response_object = {};
        _response_object.message = 'Category details has been updated successfully.';
        _response_object.details = details;
        return response.status(200).json(_response_object);
    };
	// validate the category fields data
    validateModel.validate(Categories, input_attributes, filtered_post_data, async function(valid, errors){
        if(valid){
            if(filtered_post_keys.includes('name')){ 
                filtered_post_data.name = filtered_post_data.name.toLowerCase();
            }   
            
            isCategoryExist(id, function(){
                updateRecord(filtered_post_data, function (category) {
                    sendResponse(category)
                });
            });  
        }else{
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });
};
