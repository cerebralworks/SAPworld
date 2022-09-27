

/* global _, JobPostings, sails */

module.exports = async function sendemail(request, response) {
    const request_query = request.allParams();
    const id = parseInt(request_query.id);
    const logged_in_user = request.user;
	//request_query.logged_in_user=logged_in_user;
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
	var log_user ={};
	/** To validate admin to sendmail to user
	    @params emp_id
	**/
	  if(request_query.emp_id !=undefined){
			await EmployerProfiles.find({id:request_query.emp_id}).then(data=>{
				 log_user.company = request_query.emp_id;
		         log_user.account = data[0].account;
		         log_user.first_name = data[0].first_name;
		         log_user.last_name = data[0].last_name;
				})
			}else{
				log_user.company = logged_in_user.employer_profile.id;
				log_user.first_name = logged_in_user.employer_profile.first_name;
				log_user.last_name = logged_in_user.employer_profile.last_name;
				log_user.account = logged_in_user.id;
			}
    let schema = yup.object().shape({
        job_id: yup.number().positive().test('job_id', 'cant get any job', async(value) => {
            let query = { id: value, company: log_user.company };
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
		for(let i=0;i<model.hands_on_experience.length;i++){
			var hands_on_experience_data = model.hands_on_experience[i].toLocaleUpperCase();
			var CheckData = model.skills.filter(function(a,b){ return a.toLocaleUpperCase() == hands_on_experience_data.toLocaleUpperCase()});
			if(CheckData.length !=0){
				model.skills = model.skills.filter(function(a,b){ return a.toLocaleUpperCase() != hands_on_experience_data.toLocaleUpperCase()});
			}
		}
        await Industries.find({ id: model.domain }).then(domain => {
            model.domain = domain.map(function(value) {
                return value.name;
            });
        });
        /* await JobLocation.find({ id: value.location_id }).then(locations => {
            model.locations = locations;
        });*/
		if(model.job_locations.length !=0){
			var tempData = model.job_locations[0];
			model.city = tempData['city'];
			model.state = tempData['state'];
			model.country = tempData['country'];
			model.zipcode = tempData['zipcode'];
		} 
		if(model.availability=="0"){
			model.availability = "Immediately"
		}else{
			model.availability = model.availability+' Days'
		}
		if(model.salary_type==0){
			model.salary_currency = model.salary_currency.toLocaleUpperCase();
			model.salary = model.salary_currency +' '+ model.salary+' / hr';
		}else if(model.salary_type==1){
			model.salary_currency = model.salary_currency.toLocaleUpperCase();
			model.salary = model.salary_currency +' '+ model.salary+' / Annual'
		}else if(model.salary_type==2){
			model.salary_currency = model.salary_currency.toLocaleUpperCase();
			model.salary = model.salary_currency +' '+ model.salary+' / Monthly'
		}
		if(model.certification ==null || model.certification ==undefined){
			model.certification = [];
		}
		if(model.type){
			if(jobTypeArray.filter(function(a,b){ return a.id == model.type }).length!=0){
				 model.type =jobTypeArray.filter(function(a,b){ return a.id == model.type })[0]['text'];
			}else{
				 model.type = ['Full Time', 'Part Time', 'Freelance', 'Internship', 'Temporary', 'Remote', 'Contract', 'Day Job'];
			}
		}else{
			 model.type = ['Full Time', 'Part Time', 'Freelance', 'Internship', 'Temporary', 'Remote', 'Contract', 'Day Job'];
		}
       if(model.optinal_skills ==null || model.optinal_skills == undefined || !model.optinal_skills.length || model.optinal_skills.length ==0){
		   model.optinal_skills =[];
	   }
        model.remote = model.remote == 1 ? 'Yes' : 'No';
        const mail_data = {
            template: 'jobpostings/jd',
            data: model,
            to: value.email_id,
            subject: 'An employer is interested in your profile'
        };
        await mailService.sendMail(mail_data);
		console.log(value);
		await Scoring.update({job_id:model.id,user_id:value.id}).set({mail:true});
		var postDetailss = {};
		postDetailss.name=model.title;
		postDetailss.title='Job Invitation';
		postDetailss.message=log_user.first_name +' '+log_user.last_name +' employer invited you to apply for //'+model.title+'// - ' +model.country;
		postDetailss.account=value.account;
		postDetailss.user_id=value.id;
		postDetailss.job_id=model.id;
		postDetailss.employer=log_user.company;		
		postDetailss.view=0;	
		Notification.create(postDetailss, function(err, job) {
			
		});
        _response_object.message = 'Mail sent  successfully.';
        _response_object.details = {};
        return response.status(200).json(_response_object);
    }).catch(err => {
        _response_object.errors = err.inner;
        // _response_object.count = err.inner.length;
        return response.status(400).json(err.inner);
    });
}