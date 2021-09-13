/**
 *
 * @author Saravanan Karthikeyan <saravanan@studioq.co.in>
 *
 */

/* global _, Program, validateModel, sails */

//var squel = require("squel");
module.exports = function create(request, response) {


    var _response_object = {};
    var request_data = request.body;
    Program.find().then(data=>{
        var isData = data.filter((a)=>{
        if(_.toLower(a.name)===_.toLower(request.body.name)){
            return a;
        }
              
    })
    if(isData.length !=0){
       return response.status(400).json({meesage : "already exist"});
    }else{
        Program.create(request_data).then(function(wa) {
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





/*
    const post_request_data = request.body;
    var _response_object = {};
    pick_input = [
        'name'
    ];
    var filtered_post_data = _.pick(post_request_data, pick_input);
    const filtered_post_keys = Object.keys(filtered_post_data); 
    var input_attributes = [ 
        {name: 'name', required: true}
    ]; 

    // Create a Program Tag in db.
    function createProgram(data, successCallBack){
        Program.create(data, async function(err, program_name){
            UtilsService.throwIfErrorElseCallback(err, response, 500, ()=>{
                successCallBack(program_name);
            });
        });
    } 

    // Check whether the name of skill name is unique in db.
    function isProgramNameIsUnique(criteria, successCallBack){
        Program.find(criteria, async function(err, program_name){ 
            UtilsService.throwIfErrorElseCallback(err, response, 500, ()=>{
                if(_.isEmpty(program_name)){
                    successCallBack();
                }else{
                    _response_object = {};
                    _response_object.details = {};
                    _response_object.details.field = 'name';
                    _response_object.details.rule = 'unique';
                    _response_object.message = 'The value that you given for the attribute name has already exist.';
                    return response.status(400).json(_response_object);
                }
            });
        });
    }

    // Build and send response.
    function sendResponse(details){
        _response_object = {};
        _response_object.message = 'Program name has been created successfully.';
        _response_object.details = details;
        return response.status(200).json(_response_object);
    };
	//Validating the request and pass on the appriopriate response.
    validateModel.validate(Program, input_attributes, filtered_post_data, async function(valid, errors){
        if(valid){ 
            if(filtered_post_keys.includes('name')){ 
                filtered_post_data.name = _.toLower(filtered_post_data.name);
            
            isProgramNameIsUnique(_.pick(filtered_post_data, ['name']), function(){ 
                createProgram(filtered_post_data, function(program_name){
                    sendResponse(program_name);
                });
            });
        }
        else{
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    });
    */
};
