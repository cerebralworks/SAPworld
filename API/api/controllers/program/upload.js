

/* global _, Program, validateModel, sails */

//var squel = require("squel");
module.exports = function update(request, response) {

	 var a= JSON.stringify(request.body);
	 var b = a.substring(168,a.length-68);
	 var c = b.split('\\r\\n');
  for(let i=0; i<=c.length-1;i++){
	   var d = c[i].split(',');
	   var data={};
	   data['created_at'] = d[0];
	   data['updated_at'] = d[1];
	   data['id'] = d[2];
	   data['name'] = d[3];
	   data['status'] = d[4];
	   if(d[5] === ''){
		   data['status_glossary'] = null;
	   }else{
		   data['status_glossary'] = d[5];
	   }
	   Program.create(data).then(function(data) {
		if(i===c.length-1){
        return response.status(201).json({"message" : "created"});
		}
    })
	   
   }
   
};
