/* global _, UserProfiles, Users, sails */

module.exports = async function deleteRecords(request, response) {
    const post_request_data = request.body;
    const logged_in_user = request.user;
    var _response_object = {};
    var filtered_post_data = _.pick(post_request_data,['id']);
    const filtered_post_keys = Object.keys(filtered_post_data);
    var input_attributes = [
        {name: 'id', required:true},
    ];
    //Delete Applications
    const deleteRecords = (id, callback) => {
        JobApplications.destroyOne({id: id }, async function(err, deleted){
            if(err){
                return callback(false);
            }else{
                return callback(true);
            }
        });
    };
    //Find applications
    const findApplications = (query, callback) => {
        var applicant_model = JobApplications.findOne({id: query });
        applicant_model.exec(async function(err, applicant_list){
            if(err){
                err.field = 'Applications';
                await errorBuilder.build(err, function (error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            }else{
                if(applicant_list){
					if(applicant_list.id){
						callback(true);
					}
                }else{
                    response.status(400).json({'message':'No Application found with the given id.'});
                }
            }
        });
    };
    validateModel.validate(JobApplications, input_attributes, filtered_post_data, async function(valid, errors){
          if(valid){
              filtered_post_data.user = logged_in_user.user_profile.id;
              await findApplications(filtered_post_data.id, async function (education_keys) {
                  await deleteRecords(filtered_post_data.id, async function (done) {
                      if(done){
                          _response_object.message = 'Application details have been deleted successfully.';
                          return response.status(200).json(_response_object);
                      }else{
                          response.status(500).json({'message':'Something went wrong in deleting the applications.'});
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

