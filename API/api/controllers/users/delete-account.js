/* global _ Users, sails */

module.exports = function deleteAccount(request, response) {
	var requestData = request.body;
	var _response_object={};
	Users.update(requestData.id,{status:0},async function(err,user){
		if(err){
			await errorBuilder.build(err, function (error_obj) {
				_response_object.errors = error_obj;
				_response_object.count = error_obj.length;
				return response.status(500).json(_response_object);
			});
		}else{
			_response_object.message = "User Account Deleted successfully."
			return response.ok(_response_object);
		}
		
		
	})
	
}