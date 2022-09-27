

/* global _, SkillTags, validateModel, sails */

var squel = require("squel");
module.exports = function upload(request, response) {
   var a= JSON.stringify(request.body);
   var b = a.substring(166,a.length-68);
   var c = b.split('\\r\\n');
 
   for(let i=0; i<=c.length-1;i++){
	   var d = c[i].split(',');
	   var data={};
	   data['created_at'] = d[0];
	   data['updated_at'] = d[1];
	   data['id'] = d[2];
	   data['tag'] = d[3];
	   data['status'] = d[4];
		data['status_glossary'] = null;
	   data['long_tag'] = d[6];
	   SkillTags.create(data).then(function(data) {
		if(i===c.length-1){
        return response.status(201).json({"message" : "created"});
		}
    })
	   
   }
};
