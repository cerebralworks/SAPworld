
/* global _, UserProfiles, Users, sails */

module.exports = async function updatePhoto(request, response) {
    const post_request_data = request.body;
    const logged_in_user = request.user;
    var _response_object = {};
    var filtered_post_data = _.pick(post_request_data, ['file_key', 'remove_all_default']);
    //Delete file
    if (filtered_post_data.file_key && !filtered_post_data.remove_all_default) {

        let new_resume = logged_in_user.user_profile.doc_resume.map((value) => {
            value.default = 0;
            if (value.file == filtered_post_data.file_key) {
                value.default = 1;
            }
            return value;
        });
        UserProfiles.update({ id: logged_in_user.user_profile.id }, { doc_resume: new_resume }, async function(err, user) {
            if (err) {
                err.field = 'doc_resume';
                await errorBuilder.build(err, function(error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            } else {
                return sendResponse(user);
            }
        });
    } else if (filtered_post_data.remove_all_default) {
        let new_resume = logged_in_user.user_profile.doc_resume.map((value) => {
            value.default = 0;
            return value;
        });
        UserProfiles.update({ id: logged_in_user.user_profile.id }, { doc_resume: new_resume }, async function(err, user) {
            if (err) {
                err.field = 'doc_resume';
                await errorBuilder.build(err, function(error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            } else {
                return sendResponse(user);
            }
        });
    } else {
        _response_object.errors = [{ field: 'doc_resume', rules: [{ rule: 'required', message: 'file_key cannot be empty.' }] }];
        _response_object.count = 1;
        return response.status(400).json(_response_object);
    }


    //Send response.
    const sendResponse = (details) => {
        _response_object.message = 'Document has been changed successfully.';
        _response_object.details = details;
        /*var meta = {};
        meta['doc_resume'] = {
            path: 'https://s3.' + sails.config.conf.aws.region + '.amazonaws.com/' + sails.config.conf.aws.bucket_name,
            folder: 'public/resumes/Documents'
        };
        meta['doc_resume'].example = meta['doc_resume'].path + '/' + meta['doc_resume'].folder + '/doc-resume-55.png';
        _response_object['meta'] = meta;*/
        return response.status(200).json(_response_object);
    };

};