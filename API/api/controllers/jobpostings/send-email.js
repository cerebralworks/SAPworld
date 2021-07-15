/**
 *
 * @author Saravanan Karthikeyan <saravanan@studioq.co.in>
 *
 */

/* global _, JobPostings, sails */

module.exports = async function sendemail(request, response) {
    const request_query = request.allParams();
    const id = parseInt(request_query.id);
    const logged_in_user = request.user;
    var _response_object = {};
    let yup = sails.yup;
    var model = {};
	var jobTypeArray = [
		{id: 1000, text: 'Full Time'},
		{id: 1001, text: 'Part Time'},
		{id: 1002, text: 'Contract'},
		{id: 1003, text: 'Freelance'},
		{id: 1004, text: 'Internship'},
	  ];
	  
    let schema = yup.object().shape({
        job_id: yup.number().positive().test('job_id', 'cant get any job', async(value) => {
            let query = { id: value, company: logged_in_user.employer_profile.id };
            return await JobPostings.findOne(query).then(job => {
                if (job) {
                    model = job;
                    return true;
                }
                return false;
            }).catch(err => {
                return false
            });
        }),
        email_id: yup.string().required().email()
    }).validate(request_query, { abortEarly: false }).then(async value => {
        var exprience_map = model.hands_on_experience.map(function(value) {
            return value.skill_name.split('-')[0];
        });
        model.hands_on_experience = exprience_map;
        await SkillTags.find({ id: model.skills }).then(skill => {
            model.skills = skill.map(function(value) {
                return value.tag.split('-')[0];
            });
        });
        await Industries.find({ id: model.domain }).then(domain => {
            model.domain = domain.map(function(value) {
                return value.name;
            });
        });
		if(model.type){
			if(jobTypeArray.filter(function(a,b){ return a.id == model.type }).length!=0){
				 model.type =jobTypeArray.filter(function(a,b){ return a.id == model.type })[0]['text'];
			}else{
				 model.type = ['Full Time', 'Part Time', 'Freelance', 'Internship', 'Temporary', 'Remote', 'Contract', 'Day Job'];
			}
		}else{
			 model.type = ['Full Time', 'Part Time', 'Freelance', 'Internship', 'Temporary', 'Remote', 'Contract', 'Day Job'];
		}
       
        model.remote = model.remote == 1 ? 'Yes' : 'No';
        const mail_data = {
            template: 'jobpostings/jd',
            data: model,
            to: value.email_id,
            subject: 'Job description from SAP world'
        };
        await mailService.sendMail(mail_data);
        _response_object.message = 'Mail sent  successfully.';
        _response_object.details = {};
        return response.status(200).json(_response_object);
    }).catch(err => {
        _response_object.errors = err.inner;
        // _response_object.count = err.inner.length;
        return response.status(400).json(err.inner);
    });
}