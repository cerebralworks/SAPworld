module.exports = async function upload(request, response) {

	 var a= JSON.stringify(request.body);
	 var b = a.substring(169,a.length-68);
	 var c = b.split('\\r\\n');
 
   for(let i=0; i<=c.length-1;i++){
	   var d = c[i].split(',');
	   var data={};
	   data['created_at'] = d[0];
	   data['updated_at'] = d[1];
	   data['id'] = d[2];
	   data['name'] = d[3];
	   data['iso'] = d[4];
	   Language.create(data).then(function(data) {
		if(i===c.length-1){
        return response.status(201).json({"message" : "created"});
		}
    })
	   
   }
   
}