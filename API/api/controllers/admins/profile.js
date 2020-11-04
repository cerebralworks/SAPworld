/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/* global _, validateModel, UserProfiles */

module.exports = async function view(request,response) {
    const logged_in_user = request.user;
    var _response_object = {};
    const request_query = request.allParams();
    const filtered_query_data = _.pick(request_query, ['expand']);
    const filtered_query_keys = Object.keys(filtered_query_data);
    var input_attributes = [];
    var expand = [];
    if(filtered_query_keys.includes('expand')){
        expand = filtered_query_data.expand.split(',');
    }
    validateModel.validate(null, input_attributes, filtered_query_data,function(valid, errors){
        if(valid){
            var admin_model = AdminProfiles.findOne({id: logged_in_user.admin_profile.id});
            if(expand.includes('account')) {
                admin_model.populate('account')
            }
            admin_model.exec(async function(err, admin_details){
                if (!admin_details) {
                    _response_object.message = 'No admin found with the given id.';
                    return response.status(404).json(_response_object);
                } else {
                    _response_object.message = 'Admin details retrieved successfully';
                    var meta = {};
                    meta['photo'] = {
                      path: 'https://s3.' + sails.config.conf.aws.region + '.amazonaws.com/' + sails.config.conf.aws.bucket_name,
                      folder: 'public/images/Users',
                      sizes: {
                        small: 256,
                        medium: 512
                      }
                    };
                    meta['photo'].example = meta['photo'].path + '/' + meta['photo'].folder + '/' + meta['photo'].sizes.medium + '/photo-55.png';
                    _response_object['meta'] = meta;
                   _response_object.details = Object.assign({}, admin_details);
                   return response.ok(_response_object);
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
