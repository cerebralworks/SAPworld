/* global _, SkillTags, sails */

module.exports = async function create(request, response) {

    var _response_object = {};
    var request_data = request.body;
    SkillTags.find().then(data=>{
        var isData = data.filter((a)=>{
        if(_.toLower(a.tag)===_.toLower(request.body.tag) && _.toLower(a.long_tag)===_.toLower(request.body.long_tag)){
            return a;
        }
        else if(_.toLower(a.tag)===_.toLower(request.body.tag) || _.toLower(a.long_tag)===_.toLower(request.body.long_tag)){
            return a;
        }      
    })
    if(isData.length !=0){
       return response.status(400).json({meesage : "already exist"});
    }else{
        SkillTags.create(request_data).then(function(wa) {
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