//var env = require('./../../../../.env');
var env = require('node-env-file');
 env(__dirname+'/../../../../.env');
module.exports = async function create(request, response) {

    var _response_object = {};
    var request_data = request.body;
	var contactdetailsadmin ={
		template: 'contacts/admin',
            data: request_data,
            to: process.env.contact_email,
            subject: 'Contact Form'
	};
	var contactdetailsuser ={
		template: 'contacts/user',
            data: request_data,
            to: request_data.email,
            subject: 'Contact Form'
	};

    Contact.create(request_data).then(async function(data) {
		 await mailService.sendMail(contactdetailsadmin);
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