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
    var filtered_post_data = _.pick(post_request_data, ['doc_resume', 'title']);
    var fs = require('fs');
    //Process file
    const uploadFile = async(doc_resume, callback) => {
        path = require('path');
        filename = 'doc-resume-' + Number(new Date()) + '-' + Math.floor((Math.random() * 9999999999) + 1) + path.extname(doc_resume.filename);
        file_path = 'public/resumes/Documents';
        await fileUpload.S3file(doc_resume, file_path, filename, async function(err, done) {
            if (err) {
                err.field = 'doc_resume';
                await errorBuilder.build(err, function(error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
					console.log(_response_object );
                    return response.status(500).json(_response_object);
                });
            } else {
                if (done) {
                    return callback(filename);
                }
            }
        });
    };

    //Add the filename to user's profile.
    const updateUser = (filename, callback) => {
        var resume = logged_in_user.user_profile.doc_resume !== null ? logged_in_user.user_profile.doc_resume : [];
        resume.push({ title: filtered_post_data.title, file: filename, default: 0 });
        UserProfiles.update({ id: logged_in_user.user_profile.id }, { doc_resume: resume }, async function(err, user) {
            if (err) {
                err.field = 'doc_resume';
                await errorBuilder.build(err, function(error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
					console.log(_response_object );
                    return response.status(500).json(_response_object);
                });
            } else {
                return callback(user);
            }
        });
    };
    //Send response.
    const sendResponse = (details) => {
        _response_object.message = 'Document has been updated successfully.';
        _response_object.details = details;
        var meta = {};
        meta['doc_resume'] = {
            path: 'https://s3.' + sails.config.conf.aws.region + '.amazonaws.com/' + sails.config.conf.aws.bucket_name,
            folder: 'public/resumes/Documents'
        };
        meta['doc_resume'].example = meta['doc_resume'].path + '/' + meta['doc_resume'].folder + '/doc-resume-55.png';
        _response_object['meta'] = meta;
        return response.status(200).json(_response_object);
    };
    //Check whether doc_resume exists in the request
    if (request._fileparser && request._fileparser.upstreams && request._fileparser.upstreams.length > 0) {
        try {
            request.file('doc_resume').upload({ maxBytes: 50000000 }, async function(err, uploaded_files) {
                if (err) {
                    err.field = 'doc_resume';
                    await errorBuilder.build(err, function(error_obj) {
                        _response_object.errors = error_obj;
                        _response_object.count = error_obj.length;
						console.log(_response_object );
                        return response.status(500).json(_response_object);
                    });
                }
                if (uploaded_files.length > 0) {
                    /*Photo uploaded*/
                    var allowed_file_types = ['doc', 'docx', 'odt', 'pdf'];
                    let file_name_arr = uploaded_files[0].filename.split('.');
                    if (allowed_file_types.indexOf(file_name_arr[file_name_arr.length - 1]) === -1) {
                        fs.unlink(uploaded_files[0].fd, function(err) {});
                        _response_object.errors = [{ field: 'doc_resume', rules: [{ rule: 'required', message: 'doc_resume should be only of type ' + allowed_file_types.join(',') }] }];
                        _response_object.count = 1;
                        return response.status(400).json(_response_object);
                    } else {

                        //Uploading doc_resume
                        await uploadFile(uploaded_files[0], async function(filename) {
                            //Update user
                            await updateUser(filename, function(details) {
                                sendResponse(details);
                            });
                        });

                    }
                } else {
                    _response_object.errors = [{ field: 'doc_resume', rules: [{ rule: 'required', message: 'doc_resume cannot be empty.' }] }];
                    _response_object.count = 1;
                    return response.status(400).json(_response_object);
                }
            });
        } catch (err) {
            err.field = 'doc_resume';
            await errorBuilder.build(err, function(error_obj) {
                _response_object.errors = error_obj;
                _response_object.count = error_obj.length;
				console.log(_response_object );
                return response.status(500).json(_response_object);
            });
        }
    } else {
        _response_object.errors = [{ field: 'doc_resume', rules: [{ rule: 'required', message: 'doc_resume cannot be empty.' }] }];
        _response_object.count = 1;
		
        return response.status(400).json(_response_object);
    }
};