/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/* global _ Users, sails */


module.exports = function sendOtp(request, response) {
    const userid = request.body.id;
	var _response_object={};
	Users.find({id:userid}).then(async function(user){
		var data= {
				reset: user[0].tokens.reset,
				verification: user[0].tokens.verification,
				otp:parseInt(request.body.otp)
			  }
		await Users.update(userid, {tokens:data},async function(err, val) {
            if (err) {
                await errorBuilder.build(err, function(error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            } else {
				var data={otp: val[0].tokens.otp};
				const mail_data = {
					template: 'employers/verify-otp',
					data: data,
					to: user[0].username,
					subject: "OTP Verification"
				};
				//To send mail
				mailService.sendMail(mail_data);
				return response.status(200).json({message:"OTP send successfully"});
			}
			})
		
	});
	
};
