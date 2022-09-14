/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/* global _, UserProfiles,mailService */

module.exports = async function invite(request,response) {
    const user_id=request.body.id;
	
	UserProfiles.find({id:user_id}).then(data=>{
		data[0].message=request.body.message;
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
	
	
};
