

/* global _, EmployerProfiles, UserInformation, Users, sails */


module.exports = async function saveProfile(request, response) {
    const post_request_data = request.body;
    var _response_object = {};
    const logged_in_user = request.user;
    let yup = sails.yup;
    let schema = yup.object().shape({
        user_id: yup.number().positive().test('check-id', 'There is no user profile', async(value) => {
            var profile = await Users.findOne({ id: value, status: { '!=': 3 }, user_profile: { '!=': null } });
            return !profile ? false : true;
        }),
        delete: yup.boolean().default(false)
    });
    //Build and sending response
    const sendResponse = (details) => {
        _response_object.message = ' profile saved successfully.';
        /*var meta = {};
        meta['photo'] = {
            path: 'https://s3.' + sails.config.conf.aws.region + '.amazonaws.com/' + sails.config.conf.aws.bucket_name,
            folder: 'media/Users',
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
	//Validating the request and pass on the appriopriate response.
    await schema.validate(post_request_data, { abortEarly: false }).then(async value => {
        if (!value.delete) {
			if(!value.description){
				value.description = '';
			}
            var company_profile = await SavedProfile.findOne({ account:logged_in_user.id, employee_id: logged_in_user.employer_profile.id, user_id: value.user_id });
            value.employee_id = logged_in_user.employer_profile.id;
            value.account = logged_in_user.id;
            if (!company_profile) {
                SavedProfile.create(value, async function(err, profile) {
                    if (err) {
                        await errorBuilder.build(err, function(error_obj) {
                            _response_object.errors = error_obj;
                            _response_object.count = error_obj.length;
                            return response.status(500).json(_response_object);
                        });
                    } else {
                        sendResponse(profile);
                    }
                });
            } else {
				  var company_profiles = await SavedProfile.updateOne({ account:logged_in_user.id,employee_id: logged_in_user.employer_profile.id, user_id: value.user_id }).set(value);
                if(company_profiles){
					return response.status(200).json({ message: ' profile updated successfully.', user_id: value.user_id });
				}else{
					sendResponse(company_profile);
				}
                
            }
        } else {
            await SavedProfile.destroyOne({ employee_id: logged_in_user.employer_profile.id, user_id: value.user_id }).then(success => {
                console.log(success)
            });
            return response.status(200).json({ message: ' profile deleted successfully.', user_id: value.user_id });
        }

    }).catch(err => {
        _response_object.errors = err.inner;
        // _response_object.count = err.inner.length;
        return response.status(400).json(err.inner);
    });

};
