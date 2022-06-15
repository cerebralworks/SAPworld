/* global _, Country, sails */

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
	   data['iso'] = d[3];
	   data['name'] = d[4];
	   data['nicename'] = d[5];
	   if(d[6] ===''){
		data['iso3'] = null;
	   }else{
	   data['iso3'] = d[6];
	   }if(d[7] ===''){
		   data['numcode'] = null;
	   }else{
	   data['numcode'] = d[7];
	   }
	   if(d[8] ===''){
		data['phonecode'] = null;
	   }else{
	   data['phonecode'] = d[8];
	   }
	   Country.create(data).then(function(data) {
		if(i===c.length-1){
        return response.status(201).json({"message" : "created"});
		}
    })
	   
   }
 
}