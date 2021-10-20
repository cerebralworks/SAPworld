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
    var filtered_post_data = _.pick(post_request_data,['video_resume', 'type']);
    var fs = require('fs');
    //Process file
    const uploadFile = async (video_resume, callback) => {
        path = require('path');
        filename = 'video-resume-' + Number(new Date()) + '-' + Math.floor((Math.random() * 9999999999) + 1)  + path.extname(video_resume.filename);
        file_path = 'public/resumes/Videos';
        await fileUpload.S3file(video_resume, file_path, filename, async function(err, done){
            if(err){
                err.field = 'video_resume';
                await errorBuilder.build(err, function (error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            }else{
                if(done){
                    return callback(filename);
                }
            }
        });
    };
    //Delete file
    const deleteFile = async (callback) => {
        photo_key = [{Key: 'public/resumes/Videos/' + logged_in_user.user_profile.video_resume}];
        await fileUpload.deleteFromS3(photo_key, async function(err, done){
            if(err){
                err.field = 'video_resume';
                await errorBuilder.build(err, function (error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            }else{
                if(done){
                    return callback(done);
                }
            }
        });
    };
    //Add the filename to user's profile.
    const updateUser = (filename, callback) => {
        UserProfiles.update({id: logged_in_user.user_profile.id}, {video_resume: filename}, async function(err, user){
            if(err){
                err.field = 'video_resume';
                await errorBuilder.build(err, function (error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            }else{
                return callback(user);
            }
        });
    };
    //Send response.
    const sendResponse = (details) => {
        _response_object.message = 'Video has been updated successfully.';
        _response_object.details = details;
        var meta = {};
        meta['video_resume'] = {
          path: 'https://s3.' + sails.config.conf.aws.region + '.amazonaws.com/' + sails.config.conf.aws.bucket_name,
          folder: 'public/resumes/Videos'
        };
        meta['video_resume'].example = meta['video_resume'].path + '/' + meta['video_resume'].folder + '/video-resume-55.png';
        _response_object['meta'] = meta;
        return response.status(200).json(_response_object);
    };
    //Check whether video_resume exists in the request
    if (request._fileparser && request._fileparser.upstreams && request._fileparser.upstreams.length > 0) {
        try{
            request.file('video_resume').upload({maxBytes: 50000000}, async function (err, uploaded_files) {
                if (err) {
                    err.field = 'video_resume';
                    await errorBuilder.build(err, function (error_obj) {
                        _response_object.errors = error_obj;
                        _response_object.count = error_obj.length;
                        return response.status(500).json(_response_object);
                    });
                }
                if (uploaded_files.length > 0) {
                    /*Photo uploaded*/
                    var allowed_file_types = ['video/mp4', 'video/flv', 'video/mpeg', 'video/ogv', 'video/webm'];
                    if (allowed_file_types.indexOf(uploaded_files[0].type) === -1) {
                        fs.unlink(uploaded_files[0].fd, function(err){});
                        _response_object.errors = [{field: 'video_resume', rules: [{rule: 'required', message: 'video_resume should be only of type jpeg or png.'}]}];
                        _response_object.count = 1;
                        return response.status(400).json(_response_object);
                    }else{
                        if(logged_in_user.user_profile.video_resume){
                            //Deleting file
                            await deleteFile(async function (filename) {
                                //Uploading video_resume
                                await uploadFile(uploaded_files[0], async function (filename) {
                                    //Update user
                                    await updateUser(filename, function (details) {
                                        sendResponse(details);
                                    });
                                });
                            });
                        }else{
                            //Uploading video_resume
                            await uploadFile(uploaded_files[0], async function (filename) {
                                //Update user
                                await updateUser(filename, function (details) {
                                    sendResponse(details);
                                });
                            });
                        }
                    }
                }else{
                    _response_object.errors = [{field: 'video_resume', rules: [{rule: 'required', message: 'video_resume cannot be empty.'}]}];
                    _response_object.count = 1;
                    return response.status(400).json(_response_object);
                }
            });
        }catch(err){
            err.field = 'video_resume';
            await errorBuilder.build(err, function (error_obj) {
                _response_object.errors = error_obj;
                _response_object.count = error_obj.length;
                return response.status(500).json(_response_object);
            });
        }
    }else{
        _response_object.errors = [{field: 'video_resume', rules: [{rule: 'required', message: 'video_resume cannot be empty.'}]}];
        _response_object.count = 1;
        return response.status(400).json(_response_object);
    }
};
