/* global _, workauthorization, sails */

module.exports = async function create(request, response) {

    var _response_object = {};
    var request_data = request.body;
         WorkAuthorization.find().then(data=>{
             var isData = data.filter((a)=>{
             if(a.name===request.body.name && _.toLower(a.visa)===_.toLower(request.body.visa)){
                 return a;
             }      
         })
         if(isData.length !=0){
            return response.status(400).json({meesage : "already exist"});
         }else{
            WorkAuthorization.create(request_data).then(function(wa) {
               // console.log(_.toUpper(wa))
                _response_object.details = wa;
               
                return response.status(201).json(_response_object);
                }).catch(async function(err) {
                    await errorBuilder.build(err, function(error_obj) {
                        _response_object.errors = error_obj;
                        _response_object.count = error_obj.length;
                        return response.status(500).json(_response_object);
                    });
                    });
            }
            
         
    })

  

}