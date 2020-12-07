/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/* global _, UserProfiles, UserInformation, Users, sails */
module.exports = async function update(request, response) {
    const post_request_data = request.body;
    const logged_in_user = request.user;
    var _response_object = {};
    let yup = sails.yup;
    let schema = yup.object().shape({
        id: yup.number().required().test().test('user_profile', 'Cant find record', async(value) => {
            return await userprofiles.findOne({ where: { user: value } }).then(result => {
                console.log(result);
                return result == 0 ? true : false;
            })
        }),
        first_name: yup.string().required().lowercase().min(3),
        last_name: yup.string().required().lowercase(),
        bio: yup.string().required().min(50),
        country: yup.string().required().lowercase(),
        state: yup.string().required().lowercase(),
        city: yup.string().required().lowercase(),
        zipcode: yup.number().required().positive().moreThan(1000),
        latlng: yup.object().shape({
            lat: yup.number().min(-90).max(90),
            lng: yup.number().min(-180).max(180),
        }).required(),
        social_media_link: yup.array().of(
            yup.object().shape({
                media: yup.string().required().lowercase(),
                url: yup.url().required(),
                visibility: yup.boolean().default(true)
            })
        ).default([]),
        education_qualification: yup.array().of(
            yup.object().shape({
                degree: yup.string().required().lowercase(),
                field_of_study: yup.string().required().lowercase(),
            })
        ).default([]),
        experience: yup.number().positive().default(1).required(),
        sap_experience: yup.number().positive().default(1).required(),
        current_employer: yup.string().required().lowercase(),
        current_employer_role: yup.string().required().lowercase(),
        domains_worked: yup.array().of(yup.number().positive()).required(),
        clients_worked: yup.array().of(yup.string()).required(),
        hands_on_experience: yup.array().of(yup.object().shape({
            skill_id: yup.number().required().positive(),
            skill_name: yup.string().required().lowercase(),
            experience: yup.number().required().positive(),
            exp_type: yup.string().required().lowercase().oneOf(['years', 'months']),
        })).required(),
        skills: yup.array().of(yup.number().positive()).required(),
        programming_skills: yup.array().of(yup.string()).required(),
        other_skills: yup.array().of(yup.string()).required(),
        certification: yup.array().of(yup.string()).required(),
        job_type: yup.number().required().positive().oneOf([0, 1, 2, 3, 4, 5, 6, 7, 8]),
        preferred_location: yup.number().required().positive().oneOf([0, 1, 2, 3, 4, 5, 6, 7]),
        availability: yup.number().required().positive().oneOf([0, 15, 30, 45, 60]),
        travel: yup.number().required().positive().oneOf([0, 25, 50, 75, 100]),
        work_authorization: yup.boolean().required(),
        willing_to_relocate: yup.boolean().required(),
        remote_only: yup.boolean().required(),
        end_to_end_implementation: yup.number().required().positive(),
    });

    //Check only admin not user
    if (_.indexOf(_.get(logged_in_user, 'types', []), 2) > -1 && _.indexOf(_.get(logged_in_user, 'types', []), 0) < 0) {
        input_attributes.push({ name: 'id', required: true, number: true, min: 1 });
        pick_input.push('id');
    } else if (_.indexOf(_.get(logged_in_user, 'types', []), 2) > -1) {
        input_attributes.push({ name: 'id', number: true, min: 1 });
        pick_input.push('id');
    }
    return await schema.validate(post_request_data, { abortEarly: false }).then(value => {
        var point = latlng['lng'] + ',' + latlng['lat'];
        value.latlng = 'SRID=4326;POINT(' + point + ')';
        value.latlng_point = latlng;
        UserProfiles.update(id, value, async function(err, profile) {
            if (err) {
                await errorBuilder.build(err, function(error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            } else {
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