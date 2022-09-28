

/* global _, Categories, sails */

module.exports = function create(request, response) {
    const post_request_data = request.body;
    var _response_object = {};
    pick_input = [
        'name', 'description', 'type'
    ];
    var filtered_post_data = _.pick(post_request_data, pick_input);
    const filtered_post_keys = Object.keys(filtered_post_data);
    var input_attributes = [
        {name: 'name', required: true},
        {name: 'description'},
        {name: 'type', enum: true, values: [0,1]}
    ];
    if(filtered_post_keys.includes('type') && parseInt(filtered_post_data.type) === 1){
        if(_.has(post_request_data, 'parent')){
            filtered_post_data.parent = post_request_data.parent;
            filtered_post_keys.push('parent');
        }
        input_attributes.push({name: 'parent', required: true, number: true, min: 1, message: "Value need to be greater than zero" });
    }
	//validate the input fileds
    validateModel.validate(Categories, input_attributes, filtered_post_data, async function(valid, errors){
        if(valid){
            if(filtered_post_keys.includes('type')){
                filtered_post_data.type = parseInt(filtered_post_data.type);
            }
            if(filtered_post_keys.includes('parent')){
                filtered_post_data.parent = parseInt(filtered_post_data.parent);
                // Checking whether the parent category is exist
                var isCategoryExist = await Categories.findOne({
                    id: filtered_post_data.parent,
                    type: 0
                });
                if(!isCategoryExist){
                     _response_object.message = `No parent category found with the given parent ${filtered_post_data.parent}.`;
                     return response.status(404).json(_response_object);
                }
            }
            if(filtered_post_keys.includes('name')){
                filtered_post_data.name = filtered_post_data.name.toLowerCase();
            }   
            //Creating record
            Categories.create(filtered_post_data, async function(err, category){
                if(err){
                    await errorBuilder.build(err, function (error_obj) {
                        _response_object.errors = error_obj;
                        _response_object.count = error_obj.length;
                        return response.status(500).json(_response_object);
                    });
                }else{
                    _response_object.message = 'Category has been created successfully.';
                    _response_object.details = category;
                    return response.status(200).json(_response_object);
                }
            });
        }
        else{
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });
};
