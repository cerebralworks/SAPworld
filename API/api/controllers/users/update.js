/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/* global _, UserProfiles, UserInformation, Users, sails */
module.exports = async function update(request, response) {
    const post_request_data = request.body;
    const logged_in_user = request.user;
    post_request_data.id = logged_in_user.id;
    var _response_object = {};
    let yup = sails.yup;
    let schema = yup.object().shape({
        id: yup.number().test('user_profile', 'Cant find record', async(value) => {
            return await UserProfiles.find().where({ account: value }).limit(1).then(result => {
                return result.length > 0 ? true : false;
            })
        }),
        first_name: yup.string().required().lowercase().min(3),
        last_name: yup.string().required().lowercase(),
        bio: yup.string(),
        country: yup.string().required().lowercase(),
        state: yup.string().required().lowercase(),
        city: yup.string().required().lowercase(),
        zipcode: yup.number().required().positive().moreThan(1000),
        phone: yup.string().matches(/^([0|\+[0-9]{1,5})?([0-9]{10})$/, 'Mobile number must be like +919999999999'),
        /* latlng: yup.object().shape({
            lat: yup.number().min(-90).max(90),
            lng: yup.number().min(-180).max(180),
        }).required(), */
        education_qualification: yup.array().of(
            yup.object().shape({
                degree: yup.string().lowercase().required(),
                field_of_study: yup.string().lowercase().required(),
                year_of_completion: yup.number().positive().required()
            })
        ).default([]),
        preferred_locations: yup.array().of(
            yup.object().shape({
                city: yup.string().lowercase(),
                state: yup.string().lowercase(),
                country: yup.string().lowercase()
            })
        ).default([]),
        experience: yup.number().positive().default(1).required(),
        sap_experience: yup.number().positive().default(1).required(),
        current_employer: yup.string().required().lowercase(),
        current_employer_role: yup.string().required().lowercase(),
        domains_worked: yup.array().of(yup.number().positive()).required(),
        clients_worked: yup.array().of(yup.string()),
        hands_on_experience: yup.array().of(yup.object().shape({
            skill_id: yup.number().required().positive(),
            skill_name: yup.string().required().lowercase(),
            experience: yup.number().required().positive(),
            exp_type: yup.string().required().lowercase().oneOf(['years', 'months']),
        })).required(),
        skills: yup.array().of(yup.number().positive()).required(),
        programming_skills: yup.array().of(yup.string()).required(),
        other_skills: yup.array().of(yup.string()),
        certification: yup.array().of(yup.string()),
        job_type: yup.array().of(yup.string()),
        job_role: yup.string().default(''),
        preferred_location: yup.number().oneOf([0, 1, 2, 3, 4, 5, 6, 7]),
        availability: yup.number().required().oneOf([0, 15, 30, 45, 60]),
        travel: yup.number().required().oneOf([0, 25, 50, 75, 100]),
        work_authorization: yup.boolean(),
        willing_to_relocate: yup.boolean().required(),
        remote_only: yup.boolean().required(),
        end_to_end_implementation: yup.number().min(0),
        privacy_protection: yup.object().shape({
            photo: yup.boolean().default(true),
            phone: yup.boolean().default(true),
            email: yup.boolean().default(true),
            current_employer: yup.boolean().default(true),
            available_for_opportunity: yup.boolean().default(true),
        }),
    });
    await schema.validate(post_request_data, { abortEarly: false }).then(async value => {
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
		if(value.phone){
			await phoneEncryptor.encrypt(value.phone, function(encrypted_text) {
				value.phone = encrypted_text;
			});
		}else{
			value.phone =null;
		}
        value.status = 1;
		var arr1= value.skills;
		var arr2= value.hands_on_experience;
		if ( arr2 && Array.isArray(arr2)) {
			arr2 = arr2.filter(function(a,b){ return a.skill_id!=null && a.skill_id!='' });
			value.hands_on_skills = arr2.map(function(a,b){ return a.skill_id });
		}else{
			value.hands_on_skills =[];
		}
		var arr3= value.language_known;
		if (arr3 &&  Array.isArray(arr3) ) {
			arr3 = arr3.filter(function(a,b){ return a.language!=null && a.language!='' });
			value.language_id = arr3.map(function(a,b){ return a.language });
			
		}else{
			value.language_id = [];
		}
		var arr4= value.education_qualification;
		if (arr4 &&  Array.isArray(arr4) ) {
			arr4 = arr4.filter(function(a,b){ return a.degree!=null && a.degree!='' });
			value.education_degree = arr4.map(function(a,b){ return a.degree });
		}else{
			value.education_degree = [];
		}
		var arr5= value.preferred_locations;
		if (arr5 &&  Array.isArray(arr5) ) {
			arr5 = arr5.filter(function(a,b){ return a.country!=null && a.country!='' });
			value.other_countries = arr5.map(function(a,b){ return a.country });
			value.other_cities = arr5.map(function(a,b){ return a.city });
		}else{
			value.other_countries = [];
			value.other_cities = [];
		}
		//console.log(value);
		//Update the user profile details
        UserProfiles.update(logged_in_user.user_profile.id, value, async function(err, profile) {
            if (err) {
                await errorBuilder.build(err, function(error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            } else {
                var status = value.available_for_opportunity == false ? 7 : logged_in_user.status;
                Users.update(logged_in_user.id, { status: status }, function(err, profile) {});
                if (profile[0].email) {
                    delete profile[0].email;
                }
                if (profile[0].phone) {
                    delete profile[0].phone;
                }
                _response_object.message = 'Profile has been updated successfully.';
                _response_object.details = profile;
                return response.status(200).json(_response_object);
            }
        });
    }).catch(err => {
        _response_object.errors = err.inner;
        _response_object.count = err.inner.length;
        return response.status(400).json(err.inner);
    });

};