/* global _, invite_status, sails */
module.exports = async function cancel(request, response) {
	
	const requests = require('request');
    var _response_object = {};
    var request_data = request.body.payload;
	var reason = request.body.payload['cancellation'];
	request_data['name'] = request.body.event;
	var dataCheck = request.body.payload['questions_and_answers'];
	var appID = request.body.payload['tracking']['utm_source'];
	if(appID && appID.length && appID.length !=0){
		request_data['job_applications'] = appID;
	}
	if(request_data['name']=='invitee.canceled'){
		request_data['canceled'] = true;
	}
	const options = {
	  method: 'GET',
	  url: request_data['event'],
	  headers: {
		'Content-Type': 'application/json',
		Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNjQwMTY0NjE1LCJqdGkiOiIxN2E4OTBhMC1jYWY0LTRiZmEtODljYy0xYjE2NTcyODcwODAiLCJ1c2VyX3V1aWQiOiJjYzhlMTVmZS00YjlmLTQ1NTMtYTI0NC1jMWNlZTNhMTljYWYifQ.m9JFSIUyLxnn_F2eKZ2uY71WVyURAvW56KeUui7zh1g'
	  }
	};
	
	/**
	**	To get the scheduled events
	**/
	requests(options,async function (error, responses, body) {
		
		if (error) throw new Error(error);

		if(body){
		  
			request_data['events']={'data':body};
			
			/**
			**	To create a InviteStatus 
			**/
			InviteStatus.create(request_data).then(async function(data) {
				
				if(data['job_applications']){
					
					/**
					**	To get the job application
					**/
					JobApplications.findOne({where :{id : data['job_applications']}}).then(datas=>{
						
						if(datas){
							
							/**
							**	To validate the application events and push the values
							**/
							if(datas['application_status'] && datas['application_status'].length && datas['application_status'].length !=0){
								
								var postDetailss = {};
								var arrId =datas['application_status']['length']-1;
								var titleName = datas['application_status'][arrId]['status'];
								
								if(data['canceled'] == true && (data['rescheduled'] != true && data['rescheduled'] != 'true') ){
									postDetailss.message= titleName +'Scheduled interview is Canceled ';
									postDetailss.title=titleName +'  is Canceled ';
									datas['application_status'][datas['application_status'].length-1]['canceled']= new Date();

									if(datas['events'] && datas['events'].length && datas['events'].length !=0){
										var arrayVal = data['events'];
										arrayVal['status']=datas['status'];
										arrayVal['canceled']= new Date();
										arrayVal['canceledreason']= reason;
										datas['events'].push(arrayVal);
										
									}else{
										var arrayVal = data['events'];
										arrayVal['status']=datas['status'];
										arrayVal['canceled']= new Date();
										arrayVal['canceledreason']= reason;
										datas['events']=[arrayVal]
									}
							
								}else if(data['rescheduled'] != true && data['rescheduled'] != 'true' && data['canceled'] == false  && datas['rescheduled'] != true && datas['rescheduled'] != 'true'){
									postDetailss.message= titleName+' interview is Scheduled ';
									postDetailss.title=titleName +'  is Scheduled ';
									datas['application_status'][datas['application_status'].length-1]['created']= new Date();
									
									if(datas['events'] && datas['events'].length && datas['events'].length !=0){
										var arrayVal = data['events'];
										arrayVal['status']=datas['status'];
										arrayVal['created']= new Date();
										datas['events'].push(arrayVal);
										
									}else{
										var arrayVal = data['events'];
										arrayVal['status']=datas['status'];
										arrayVal['created']= new Date();
										datas['events']=[arrayVal]
									}
									
								}else if(data['rescheduled'] == true || data['rescheduled'] == 'true' ){
									datas['application_status'][datas['application_status'].length-1]['rescheduled']= new Date();
									postDetailss.title=titleName +'  is Canceled ';
									postDetailss.message= titleName+' Scheduled interview is Canceled ';
									
									if(datas['events'] && datas['events'].length && datas['events'].length !=0){
										var arrayVal = data['events'];
										arrayVal['status']=datas['status'];
										arrayVal['rescheduled_canceled']= new Date();
										arrayVal['reason'] = reason;
										datas['events'].push(arrayVal);
										
									}else{
										var arrayVal = data['events'];
										arrayVal['status']=datas['status'];
										arrayVal['rescheduled_canceled']= new Date();
										arrayVal['reason'] = reason;
										datas['events']=[arrayVal]
									}
									
								}else{
									postDetailss.message= titleName+' interview is Rescheduled ';
									postDetailss.title=titleName +'  is Rescheduled ';
									datas['application_status'][datas['application_status'].length-1]['created']= new Date();
									
									if(datas['events'] && datas['events'].length && datas['events'].length !=0){
										var arrayVal = data['events'];
										arrayVal['status']=datas['status'];
										arrayVal['rescheduled']= new Date();
										datas['events'].push(arrayVal);
										
									}else{
										var arrayVal = data['events'];
										arrayVal['status']=datas['status'];
										arrayVal['rescheduled']= new Date();
										datas['events']=[arrayVal]
									}
								}
								
							}
							
							
							var _response_objects = {'events': datas['events'],'invite_status': false,'application_status': datas['application_status'],'reschedule_url': data['reschedule_url'],'cancel_url': data['cancel_url'],'canceled': data['canceled'],'rescheduled': data['rescheduled']};
							
							postDetailss.name=titleName;
							postDetailss.title=titleName;
							postDetailss.account=datas['employer'];	
							postDetailss.user_id=datas['user'];
							postDetailss.job_id=datas['job_posting'];
							postDetailss.employer=datas['employer'];		
							postDetailss.view=0;	
							JobApplications.update(datas.id,_response_objects).then(async function(da){
								
								var Query =`select user_profile.account,user_profile.first_name,user_profile.last_name,user_employment.title from job_applications
LEFT JOIN user_profiles "user_profile" ON (user_profile.id=job_applications.user) 
LEFT JOIN user_employments "user_employment" ON (user_employment.id = job_applications.job_posting) where  job_applications.id = ${parseInt(datas.id)} `;

								sails.sendNativeQuery(Query, async function(err, details) {
									//console.log(details);
									if(details && details['rows'] && details['rows'].length && details['rows'].length !=0){
										postDetailss.account=details['rows'][0]['account'];	
										postDetailss.name=details['rows'][0]['title'];	
										postDetailss.message='Your application for the '+postDetailss.name +' status is '+postDetailss.message+ ' from '+ details['rows'][0]['first_name'] +' '+details['rows'][0]['last_name'];	
										//console.log(postDetailss);
										Notification.create(postDetailss,async function(err, job) {
											//console.log(job);
											return response.status(200).json(job);
										}); 
									}
								});
							});
							
						}
						
					})
				}
			   
			}).catch(async function(err) {
				await errorBuilder.build(err, function(error_obj) {
					_response_object.errors = error_obj;
					_response_object.count = error_obj.length;
					return response.status(500).json(_response_object);
				});
			});
		}
	});
		
}
