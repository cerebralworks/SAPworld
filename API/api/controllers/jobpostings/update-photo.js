/**
 *
 * @author Saravanan Karthikeyan <saravanan@studioq.co.in>
 *
 */

/* global _, JobPostings, sails */

module.exports = async function updatePhoto(request, response) {
    const request_query = request.allParams();
    const id = parseInt(request_query.id);
    const logged_in_user = request.user;
    var _response_object = {};
    var fs = require('fs');
    //Process Photos
    const uploadPhotos = async (photo, callback) => {
        path = require('path');
        filename = 'photo-company-' + id + path.extname(photo.filename);
        file_path = 'public/images/Companies';
        await fileUpload.S3(photo, file_path, filename, [256,512], async function(err, done){
            if(err){
                err.field = 'photo';
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
        },{ContentType: photo.type});
    };
    //Add the filename to job's profile.
    const updateJobPosting = (filename, callback) => {
        JobPostings.update(id, {photo: filename}, async function(err, job){
            if(err){
                err.field = 'photo';
                await errorBuilder.build(err, function (error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            }else{
                return callback(job);
            }
        });
    };
    //Find the JobPostings record to db.
    const findPosting = (callback) => {
        let query = {id: id, employer: logged_in_user.employer_profile.id};
        JobPostings.findOne(query, async function(err, job){
            if(job){
                return callback(job);
            }else{
                _response_object.message = 'No posting details found with the given id.';
                return response.status(404).json(_response_object);
            }
        });
    };
    //Check whether photo exists in the request
    if (request._fileparser && request._fileparser.upstreams && request._fileparser.upstreams.length > 0) {
        try{
            request.file('photo').upload({maxBytes: 50000000}, async function (err, uploaded_files) {
                if (err) {
                    err.field = 'photo';
                    await errorBuilder.build(err, function (error_obj) {
                        _response_object.errors = error_obj;
                        _response_object.count = error_obj.length;
                        return response.status(500).json(_response_object);
                    });
                }
                if (uploaded_files.length > 0) {
                    /*Photo uploaded*/
                    var allowed_file_types = ['image/jpeg', 'image/png'];
                    if (allowed_file_types.indexOf(uploaded_files[0].type) === -1) {
                        fs.unlink(uploaded_files[0].fd, function(err){});
                        _response_object.errors = [{field: 'photo', rules: [{rule: 'required', message: 'photo should be only of type jpeg or png.'}]}];
                        _response_object.count = 1;
                        return response.status(400).json(_response_object);
                    }else{
                        await findPosting(async function(job){
                            //Uploading photo
                            await uploadPhotos(uploaded_files[0], async function (filename) {
                                //Update job
                                await updateJobPosting(filename, function (details) {
                                    _response_object.message = 'Photo has been updated successfully.';
                                    _response_object.details = details;
                                    /*var meta = {};
                                    meta['photo'] = {
                                      path: 'https://s3.' + sails.config.conf.aws.region + '.amazonaws.com/' + sails.config.conf.aws.bucket_name,
                                      folder: 'public/images/Companies',
                                      sizes: {
                                        small: 256,
                                        medium: 512
                                      }
                                    };
                                    meta['photo'].example = meta['photo'].path + '/' + meta['photo'].folder + '/' + meta['photo'].sizes.medium + '/photo-55.png';
                                    _response_object['meta'] = meta;*/
                                    return response.status(200).json(_response_object);
                                });
                            });
                        });
                    }
                }else{
                    _response_object.errors = [{field: 'photo', rules: [{rule: 'required', message: 'photo cannot be empty.'}]}];
                    _response_object.count = 1;
                    return response.status(400).json(_response_object);
                }
            });
        }catch(err){
            err.field = 'photo';
            await errorBuilder.build(err, function (error_obj) {
                _response_object.errors = error_obj;
                _response_object.count = error_obj.length;
                return response.status(500).json(_response_object);
            });
        }
    }else{
        _response_object.errors = [{field: 'photo', rules: [{rule: 'required', message: 'photo cannot be empty.'}]}];
        _response_object.count = 1;
        return response.status(400).json(_response_object);
    }
};
