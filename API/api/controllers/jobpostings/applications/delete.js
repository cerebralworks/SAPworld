

/* global _, UserProfiles, Users, sails */

module.exports = async function deleteRecords(request, response) {
    const post_request_data = request.body;
    const logged_in_user = request.user;
    var _response_object = {};
    var filtered_post_data = _.pick(post_request_data,['ids']);
    const filtered_post_keys = Object.keys(filtered_post_data);
    var input_attributes = [
        {name: 'ids', required:true, array: true, individual_rule: {number: true, min:1}},
    ];
    //Delete educations
    const deleteRecords = (ids, callback) => {
        UserEducations.destroy({id: {in: ids}}, async function(err, deleted){
            if(err){
                return callback(false);
            }else{
                return callback(true);
            }
        });
    };
    //Find educations
    const findEducations = (query, callback) => {
        var education_model = UserEducations.find(query);
        education_model.exec(async function(err, education_list){
            if(err){
                err.field = 'education';
                await errorBuilder.build(err, function (error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            }else{
                if(education_list.length > 0 && education_list.length === query.id.length){
                    callback(true);
                }else{
                    response.status(400).json({'message':'No educations found with the given ids.'});
                }
            }
        });
    };
	//Validating the request and pass on the appriopriate response.
    validateModel.validate(UserEducations, input_attributes, filtered_post_data, async function(valid, errors){
          if(valid){
              filtered_post_data.user = logged_in_user.user_profile.id;
              var ids = [];
              filtered_post_data.ids.forEach(async function (id) {
                  ids.push(parseInt(id));
              });
              filtered_post_data.id = ids;
              delete filtered_post_data.ids;
              await findEducations(filtered_post_data, async function (education_keys) {
                  await deleteRecords(filtered_post_data.id, async function (done) {
                      if(done){
                          _response_object.message = 'Education details have been deleted successfully.';
                          return response.status(200).json(_response_object);
                      }else{
                          response.status(500).json({'message':'Something went wrong in deleting the educations.'});
                      }
                  });
              });
          }else{
              _response_object.errors = errors;
              _response_object.count = errors.length;
              return response.status(400).json(_response_object);
          }
    });
};
