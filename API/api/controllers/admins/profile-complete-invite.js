/**
 *
 * @author vishal <vishal.m@agnitio-systems.com>
 *
 */

/* global _, UserProfiles,mailService */

module.exports = async function invite(request,response) {
    const user_id=request.body.id;
	var _response_object = {};
	UserProfiles.find({id:user_id}).then(async function(data,err){
		if(err){
			await errorBuilder.build(err, function (error_obj) {
				_response_object.errors = error_obj;
				_response_object.count = error_obj.length;
				return response.status(500).json(_response_object);
			});
		}
		await Users.find({username:data[0].email}).then(user=>{
		data[0].message=request.body.message;
		data[0].verified=user[0].verified;
		data[0].token=user[0].tokens.verification;
		const mail_data = {
					template: 'users/profile-invite',
					data: data[0],
					to: data[0].email,
					subject: request.body.subject
				};
	    //To send mail
		mailService.sendMail(mail_data);
		return response.ok({message:"Mail send succesfuly"});
		});
	});
	
	
};
