/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/* global _, UserProfiles, Users, sails */

module.exports = async function updatePhoto(request, response) {
    const post_request_data = request.body;
    const logged_in_user = request.user;
    var _response_object = {};
    var filtered_post_data = _.pick(post_request_data, ['file_key']);
    //Delete file
    if (filtered_post_data.file_key) {
        photo_key = [{ Key: 'public/resumes/Documents/' + filtered_post_data.file_key }];
        await fileUpload.deleteFromS3(photo_key, async function(err, done) {
            if (err) {
                err.field = 'doc_cover';
                await errorBuilder.build(err, function(error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            } else {
                if (done) {
                    logged_in_user.user_profile.doc_cover.splice(logged_in_user.user_profile.doc_cover.findIndex(e => e.file === filtered_post_data.file_key), 1);
                    UserProfiles.update({ id: logged_in_user.user_profile.id }, { doc_cover: logged_in_user.user_profile.doc_cover }, async function(err, user) {
                        if (err) {
                            err.field = 'doc_cover';
                            await errorBuilder.build(err, function(error_obj) {
                                _response_object.errors = error_obj;
                                _response_object.count = error_obj.length;
                                return response.status(500).json(_response_object);
                            });
                        } else {
                            return sendResponse(user);
                        }
                    });
                }
            }
        });
    } else {
        _response_object.errors = [{ field: 'doc_cover', rules: [{ rule: 'required', message: 'file_key cannot be empty.' }] }];
        _response_object.count = 1;
        return response.status(400).json(_response_object);
    }


    //Send response.
    const sendResponse = (details) => {
        _response_object.message = 'Document has been deleted successfully.';
        _response_object.details = details;
        var meta = {};
        meta['doc_cover'] = {
            path: 'https://s3.' + sails.config.conf.aws.region + '.amazonaws.com/' + sails.config.conf.aws.bucket_name,
            folder: 'public/resumes/Documents'
        };
        meta['doc_cover'].example = meta['doc_cover'].path + '/' + meta['doc_cover'].folder + '/doc-resume-55.png';
        _response_object['meta'] = meta;
        return response.status(200).json(_response_object);
    };

};