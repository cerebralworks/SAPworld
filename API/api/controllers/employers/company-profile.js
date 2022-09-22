module.exports = async function companyProfile(request, response) {
    const logged_in_user = request.user;
    var _response_object = {};
    //Build and sending response
    const sendResponse = (details) => {
        _response_object.message = 'Company details retrieved successfully.';
        /*var meta = {};
        meta['photo'] = {
            path: 'https://s3.' + sails.config.conf.aws.region + '.amazonaws.com/' + sails.config.conf.aws.bucket_name,
            folder: 'public/images/Employers',
            sizes: {
                small: 256,
                medium: 512,
                large: 1024,
            }
        };
        meta['photo'].example = meta['photo'].path + '/' + meta['photo'].folder + '/' + meta['photo'].sizes.medium + '/user-209.png';
        _response_object['meta'] = meta;*/
        _response_object['details'] = _.cloneDeep(details);
        return response.ok(_response_object);
    };
    var profile = await CompanyProfile.findOne({ user_id: logged_in_user.id });
    if (!profile) {
        _response_object.message = 'No record found';
        return response.status(200).json(_response_object);

    } else {
        sendResponse(profile);
    }
}