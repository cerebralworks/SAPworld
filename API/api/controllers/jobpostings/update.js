/**
 *
 * @author Saravanan Karthikeyan <saravanan@studioq.co.in>
 *
 */

/* global _, JobPostings, sails */

module.exports = async function create(request, response) {
    const post_request_data = request.body;
    const request_query = request.allParams();
    const logged_in_user = request.user;
    var _response_object = {};
    let yup = sails.yup;
    let schema = yup.object().shape({
        id: yup.number().positive().test('id', 'cant find any record', async(value) => {
            let query = { id: value, company: logged_in_user.employer_profile.id };
            return await JobPostings.findOne(query).then(job => {
                console.log(job)
                return true;
            }).catch(err => {
                console.log(err)
                return false
            });
        }),
        title: yup.string().required().lowercase().min(3),
        type: yup.string().required(),
        description: yup.string().min(100),
        salary_type: yup.number().required().oneOf([0, 1, 2]),
        salary_currency: yup.string().required().min(3).max(10).lowercase().required(),
        salary: yup.number().required().positive(),
        country: yup.string().required().lowercase(),
        state: yup.string().required().lowercase(),
        city: yup.string().required().lowercase(),
        zipcode: yup.number().required().positive().moreThan(1000),
        availability: yup.number().required().oneOf([0, 15, 30, 45, 60]),
        latlng: yup.object().shape({
            lat: yup.number().min(-90).max(90),
            lng: yup.number().min(-180).max(180),
        }).required(),
        experience: yup.number().positive().default(1).required(),
        sap_experience: yup.number().positive().default(1).required(),
        domain: yup.array().of(yup.number().positive()).required(),
        hands_on_experience: yup.array().of(yup.object().shape({
            skill_id: yup.number().required().positive(),
            skill_name: yup.string().required().lowercase(),
            experience: yup.number().required().positive(),
            exp_type: yup.string().required().lowercase().oneOf(['years', 'months']),
        })).required(),
        skills: yup.array().of(yup.number().positive()).required(),
        programming_skills: yup.array().of(yup.string()).required(),
        optinal_skills: yup.array().of(yup.string()),
        certification: yup.array().of(yup.string()),
        travel_opportunity: yup.number().required().oneOf([0, 25, 50, 75, 100]),
        //work_authorization: yup.number(),
        visa_sponsorship: yup.boolean(),
        must_match: yup.object().nullable(),
        end_to_end_implementation: yup.number().min(0),
        extra_criteria: yup.array().of(yup.object().shape({
            title: yup.string().required().lowercase(),
            value: yup.string().required().lowercase()
        })).nullable(),
        number_of_positions: yup.number().required().positive(),
        contract_duration: yup.number().min(0).when("type", {
            is: (val) => { val == 5 ? true : false },
            then: yup.string().required()
        }),
    });
    //Update the JobPostings record to db.
    const updateRecord = (post_data, callback) => {
        JobPostings.update(post_data.id, post_data, async function(err, job) {
            if (err) {
                await errorBuilder.build(err, function(error_obj) {
                    _response_object.errors = error_obj;
                    _response_object.count = error_obj.length;
                    return response.status(500).json(_response_object);
                });
            } else {
                return callback(job[0]);
            }
        });
    };
	//Validating the request and pass on the appriopriate response.
    await schema.validate(post_request_data, { abortEarly: false }).then(async value => {
            value.company = logged_in_user.employer_profile.id;
            var point = value.latlng['lng'] + ' ' + value.latlng['lat'];
            value.latlng_text = value.latlng.lat + ',' + value.latlng.lng;
            value.latlng = 'SRID=4326;POINT(' + point + ')';
            updateRecord(value, function(updated_job) {
                _response_object.message = 'Job has been update successfully.';
                _response_object.details = updated_job;
                return response.status(200).json(_response_object);
            });

        })
        .catch(err => {
            console.log(err)
            _response_object.errors = err.inner;
            // _response_object.count = err.inner.length;
            return response.status(400).json(err.inner);
        });

};