/**
 *
 * @author vishal <vishal.m@agnitio-systems.com>
 *
 */

/* global _ Users, sails */


module.exports = function verifyotp(request, response) {
    const otp = request.body.otp;
	var responseData={};
	Users.find({id:request.body.id}).then(async function(user){
		if(request.body.otp === user[0].tokens.otp){
			responseData.token=user[0].tokens.reset;
			responseData.id=user[0].id;
			responseData.message="OTP verified successfully";
			return response.status(200).json(responseData);
		}else{
			responseData.message="Invalid OTP";
			return response.status(400).json(responseData);	
		}
		
	});
	
};
