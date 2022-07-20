/* global _, UserProfiles, Users, sails */

module.exports = function resetPassword(request, response) {
	const post_request_data = request.body;
    const logged_in_user = request.user;
    var _response_object = {};
    var filtered_post_data = _.pick(post_request_data,['email', 'type']);
    var input_attributes = [
        {name: 'email', email: true, required: true},
        {name: 'type', enum: true, required: true, values: _.values(_.get(sails, 'config.custom.access_role', {}))} 
    ];
    //Send mail notification
    const sendMail = (data) => {
        const mail_data = {
            template: 'accounts/request-reset-password',
            data: data,
            to: data.email,
            subject: 'Password Reset Request'
        };
        mailService.sendMail(mail_data);
    };
	
	/**	
	**	To validate the request send for requesting user
	**/
    validateModel.validate(Users, input_attributes, filtered_post_data, async function(valid, errors){
        if(valid){
            var email = filtered_post_data.email.toLowerCase();
            const properties = {profile_type: _.get(filtered_post_data, 'type', 0)};
            await loginService.findUser(email, async function(errors, found_user){
                if(errors){
                    await errorBuilder.build(errors, function (error_obj) {
                        _response_object.errors = error_obj;
                        _response_object.count = error_obj.length;
                        return response.status(500).json(_response_object);
                    });
                }else{
					await UserProfiles.find({email:email}).then(async function(data){
						if(data.length !=0){
							found_user.first_name = data[0].first_name;
							found_user.last_name = data[0].last_name;
						}
					});
					await EmployerProfiles.find({email:email}).then(async function(data){
						if(data.length !=0){
							found_user.first_name = data[0].first_name;
							found_user.last_name = data[0].last_name;
						}
					});
                    var tokens = {};
                    if(found_user.tokens){
                        tokens = found_user.tokens;
                    }
                    tokens.reset = UtilsService.uid(20);
                    Users.update({id: found_user.id}, {tokens: tokens}, async function(err, user){
                        if(err){
                            await errorBuilder.build(err, function (error_obj) {
                                _response_object.errors = error_obj;
                                _response_object.count = error_obj.length;
                                return response.status(500).json(_response_object);
                            });
                        }else{
                            found_user.token = tokens.reset;
                            found_user.email = email;
							
                            sendMail(found_user);
                            _response_object.message = 'Great. We shot you an email with a link for resetting your account password. Check your inbox.';
                            return response.status(200).json(_response_object);
                        }
                    });
                }
            }, properties);
        }else{
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });
};
