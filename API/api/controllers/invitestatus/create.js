/* global _, invite_status, sails */
module.exports = async function create(request, response) {
	
	const requests = require('request');
    var _response_object = {};
    var request_data = request.body.payload;
	var reason = request.body.payload['cancellation'];
	request_data['name'] = request.body.event;
	var dataCheck = request.body.payload['questions_and_answers'];
	if(dataCheck && dataCheck.length && dataCheck.length !=0){
		request_data['job_applications'] = dataCheck[0]['answer'];
	}
	if(request_data['name']=='invitee.canceled'){
		request_data['canceled'] = true;
	}
	const options = {
	  method: 'GET',
	  url: request_data['event'],
	  headers: {
		'Content-Type': 'application/json',
		Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNjM3MzE5MTcxLCJqdGkiOiIxNjk5MGFiZi1kYzQxLTQ0MGQtOTJmNy1iZjcyOWE4ZjZmOWMiLCJ1c2VyX3V1aWQiOiIyMGMzYjIyMi03NzNkLTQ5MzctOGQwYi05MmM0YWI0MDViYWYifQ.tR-IOMTAoniqaJuTiHWdS2chcFSoch44YpF5xj9qobc'
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
							
							var postDetailss = {};
							
							/**
							**	To validate the application events and push the values
							**/
							if(datas['application_status'] && datas['application_status'].length && datas['application_status'].length !=0){
								
								var arrId =datas['application_status']['length']-1;
								var titleName = datas['application_status'][arrId]['status'];
								
								if(data['canceled'] == true && (data['rescheduled'] != true && data['rescheduled'] != 'true') ){
									postDetailss.message= postDetails.name+' is Canceled ';
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
									postDetailss.message= postDetails.name+' is Scheduled ';
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
									postDetailss.message= postDetails.name+' is Canceled ';
									
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
									postDetailss.message= postDetails.name+' is Rescheduled ';
									
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

							Notification.create(postDetailss, function(err, job) {

							});
							
							JobApplications.update(datas.id,_response_objects).then(da=>{
								return response.status(200).json(da);
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
