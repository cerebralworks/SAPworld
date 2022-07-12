/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/* global _, EmployerProfiles, UserInformation, Users, sails */


module.exports = async function updateCompanyProfile(request, response) {
    const post_request_data = request.body;
    var _response_object = {};
    const logged_in_user = request.user;
    let yup = sails.yup;
    let schema = yup.object().shape({
        name: yup.string().required().lowercase().min(3),
        email_id: yup.string().required().email().lowercase(),
        address: yup.string().lowercase(),
        city: yup.string().lowercase().required(),
        state: yup.string().lowercase().required(),
        country: yup.string().lowercase().required(),
        //zipcode: yup.number().positive(),
        contact: yup.array().of(yup.string()),
        description: yup.string().max(5000),
        /* latlng: yup.object().shape({
            lat: yup.number().min(-90).max(90),
            lng: yup.number().min(-180).max(180),
        }), */
        website: yup.string().url().lowercase(),
    });
    //Build and sending response
    const sendResponse = (details,dta) => {
		if(dta == true){
			_response_object.message = 'Company profile updated successfully.';
		}
        var meta = {};
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
        _response_object['meta'] = meta;
        _response_object['details'] = _.cloneDeep(details);
        return response.ok(_response_object);
    };
	//Validating the request and pass on the appriopriate response.
    await schema.validate(post_request_data, { abortEarly: false }).then(async value => {

        /* var point = value.latlng['lng'] + ' ' + value.latlng['lat'];
        value.latlng_text = value.latlng.lat + ',' + value.latlng.lng;
        value.latlng = 'SRID=4326;POINT(' + point + ')'; */
		if(value.latlng['lng'] && value.latlng['lng'] !=undefined && value.latlng['lng'] !="undefined" &&
		value.latlng['lat'] && value.latlng['lat'] !=undefined && value.latlng['lat'] !="undefined"){
		var point = value.latlng['lng'] + ' ' + value.latlng['lat'];
        value.latlng_text = value.latlng.lat + ',' + value.latlng.lng;
        value.latlng = 'SRID=4326;POINT(' + point + ')';
		}else{
			var point = "1.00" + ' ' + "5.00";
			value.latlng_text = "1.00" + ',' + "5.00";
			value.latlng = 'SRID=4326;POINT(' + point + ')';	
		}
        value.user_id = logged_in_user.id;
        console.log(value)
        var company_profile = await CompanyProfile.findOne({ user_id: value.user_id });
        
		if(value.contact){
			
		}else{
			value.contact=null;
		}
		if(value.description){
			
		}else{
			value.description=null;
		}
		if(value.website){
			
		}else{
			value.website=null;
		}
		var company ={
			company:value.name
		};
		var page = value['page'];
        if (!company_profile) {
            CompanyProfile.create(value, async function(err, profile) {
                console.log(err);
                if (err) {
                    await errorBuilder.build(err, function(error_obj) {
                        _response_object.errors = error_obj;
                        _response_object.count = error_obj.length;
                        return response.status(500).json(_response_object);
                    });
                } else {
                    sendResponse(profile,true);
                }
            });
        } else {
            CompanyProfile.update(company_profile.id, value, async function(err, profile) {
                console.log(err);
                if (err) {
                    await errorBuilder.build(err, function(error_obj) {
                        _response_object.errors = error_obj;
                        _response_object.count = error_obj.length;
                        return response.status(500).json(_response_object);
                    });
                } else {
                   // sendResponse(profile);
				   
					EmployerProfiles.update({where: {account : value.user_id}}, company, async function(errs, profiles) {
						console.log(errs);
						if (errs) {
							await errorBuilder.build(errs, function(error_obj) {
								_response_object.errors = error_obj;
								_response_object.count = error_obj.length;
								return response.status(500).json(_response_object);
							});
						} else {
							sendResponse(profile,false);
						}
					});
                }
            });
        }

    }).catch(err => {
        _response_object.errors = err.inner;
        // _response_object.count = err.inner.length;
        return response.status(400).json(err.inner);
    });

};