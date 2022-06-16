/**
 *
 * @author Saravanan Karthikeyan <saravanan@studioq.co.in>
 *
 */

/* global _, ScoreMaster, sails */


module.exports = function upload(request, response) {

	  var data={
		  'created_at' :'2021-07-27 10:34:38.82' ,
		  'updated_at' : '2021-07-27 10:34:38.82',
		  'id' :1 ,
		  'required': 1,
		  'desired' : 0.5,
		  'optional' :0.25
	  }
	   ScoreMaster.create(data).then(function(data) {
		
        return response.status(201).json({"message" : "created"});
		
    })
	   
  
};
