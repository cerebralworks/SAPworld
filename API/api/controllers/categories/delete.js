

/* global _, Categories, sails */
var async = require('async');

module.exports = async function deleteRecords(request, response) {
    const post_request_data = request.body; 
    var _response_object = {};
    var filtered_post_data = _.pick(post_request_data,['ids']); 
    var input_attributes = [
        {name: 'ids', required:true, array: true, individual_rule: {number: true, min:1}, min:1, message:"The length of the ids array should be grater than 0."},
    ];
    var status_deleted_sign = _.get(sails.config.custom.status_codes, 'deleted');
    //Delete categories
    const deleteRecords = (ids, callback) => {
        Categories.update({id: {in: ids}, status:[0,1]}, {status: status_deleted_sign}, async function(err, deleted){
            if(err){
                err.field = 'category';
                await errorBuilder.build(err, function (error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            }else{
                const deleted_categories_ids = [];
                if(deleted.length > 0){ 
                    async.forEachOf(deleted, (category, key, callback) => {
                        deleted_categories_ids.push(parseInt(category.id));
                        if(category.parent === null){
                            Categories.update({parent: parseInt(category.id), status:[0,1]}, {status: status_deleted_sign}, async function(err, sub_category){
                                if(!_.isEmpty(sub_category)){
                                    category.deleted_sub_categories = sub_category;
                                }
                                callback();
                            });
                        }
                    }, () => {
                        _response_object = {};
                        _response_object.data = deleted;
                        _response_object.deleted_ids = deleted_categories_ids;
                        _response_object.not_found_ids = _.difference(ids, deleted_categories_ids);
                        callback(false, _response_object);
                    });

                }else{
                    _response_object = {};
                    _response_object.details = {};
                    _response_object.details.deleted_ids = deleted_categories_ids;
                    _response_object.details.not_found_ids = _.difference(ids, deleted_categories_ids);
                    _response_object.message = 'No categories found with the given ids.';
                    response.status(400).json(_response_object);
                }
            }
        });
    };
	// validate the Categories fields to delete
    validateModel.validate(Categories, input_attributes, filtered_post_data, async function(valid, errors){
        if(valid){ 
            const ids = [];
            await filtered_post_data.ids.forEach(function (id) {
                ids.push(parseInt(id));
            });
            filtered_post_data.id = ids;
            delete filtered_post_data.ids; 
            await deleteRecords(filtered_post_data.id, async function (err, deleted_record_details) {
               if(!err){
                  _response_object = {};
                  _response_object.details = deleted_record_details;
                  _response_object.message = 'Category details have been deleted successfully.';
                  return response.status(200).json(_response_object);
               }  
            }); 
        }else{
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });
};
