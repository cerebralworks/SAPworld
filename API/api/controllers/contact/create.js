
var env = require('node-env-file');
env(__dirname+'/../../../../.env');

module.exports = async function create(request, response) {
    var _response_object = {};
    var request_data = request.body;
	
	//Admin Contact details
	var contactdetailsadmin ={
		template: 'contacts/admin',
		data: request_data,
		to: process.env.contact_email,
		subject: 'Contact Form'
	};
	
	//User Contact details
	var contactdetailsuser ={
		template: 'contacts/user',
        data: request_data,
        to: request_data.email,
        subject: 'Contact Form'
	};
	
	/**
	**	Contact Form Submission 
	**/
    Contact.create(request_data).then(async function(data) {
		
		// Sending mail to the admin
		await mailService.sendMail(contactdetailsadmin);
		
		//sending mail to the user
		await mailService.sendMail(contactdetailsuser);
		
        _response_object.details = data;
        return response.status(201).json(_response_object);
		
    }).catch(async function(err) {
        await errorBuilder.build(err, function(error_obj) {
            _response_object.errors = error_obj;
            _response_object.count = error_obj.length;
            return response.status(500).json(_response_object);
        });
    });

}