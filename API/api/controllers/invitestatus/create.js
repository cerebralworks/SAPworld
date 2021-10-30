/* global _, invite_status, sails */
module.exports = async function create(request, response) {

    var _response_object = {};
    var request_data = request.body.payload;
	request_data['name'] = request.body.event;
	var dataCheck = request.body.payload['questions_and_answers'];
	if(dataCheck && dataCheck.length && dataCheck.length !=0){
		request_data['job_applications'] = dataCheck[0]['answer'];
	}
	
	
	console.log(request_data);
        InviteStatus.create(request_data).then(function(data) {
           if(data['job_applications']){
				JobApplications.findOne({where :{id : data['job_applications']}}).then(datas=>{
					if(datas){
						datas['invite_status'] = false;
						JobApplications.update(data.id,data).then(da=>{
							return response.status(200).json(da);
						});

					}
					
				})
			}
           return response.status(201).json(_response_object);
           }).catch(async function(err) {
               await errorBuilder.build(err, function(error_obj) {
                   _response_object.errors = error_obj;
                   _response_object.count = error_obj.length;
                   return response.status(500).json(_response_object);
               });
               });
       }
       
 