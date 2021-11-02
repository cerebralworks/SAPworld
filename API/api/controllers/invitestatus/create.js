/* global _, invite_status, sails */
module.exports = async function create(request, response) {

    var _response_object = {};
    var request_data = request.body.payload;
	request_data['name'] = request.body.event;
	var dataCheck = request.body.payload['questions_and_answers'];
	if(dataCheck && dataCheck.length && dataCheck.length !=0){
		request_data['job_applications'] = dataCheck[0]['answer'];
	}
	if(request_data['name']=='invitee.canceled'){
		request_data['canceled'] = true;
	}
	
	console.log(request_data);
        InviteStatus.create(request_data).then(function(data) {
           if(data['job_applications']){
			  
				JobApplications.findOne({where :{id : data['job_applications']}}).then(datas=>{
					if(datas){
						if(datas['application_status'].length && datas['application_status'].length !=0){
							if(data['canceled'] == true && (data['rescheduled'] != true && data['rescheduled'] != 'true') ){
								datas['application_status'][datas['application_status'].length-1]['canceled']= new Date();
							}else if(data['rescheduled'] != true && data['rescheduled'] != 'true' && data['canceled'] == false ){
								datas['application_status'][datas['application_status'].length-1]['created']= new Date();
							}else if(data['rescheduled'] == true || data['rescheduled'] == 'true' ){
								datas['application_status'][datas['application_status'].length-1]['rescheduled']= new Date();
							}
							
						}
						var _response_objects = {'invite_status': false,'application_status': datas['application_status'],'reschedule_url': data['reschedule_url'],'cancel_url': data['cancel_url'],'canceled': data['canceled'],'rescheduled': data['rescheduled']};
						
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
       