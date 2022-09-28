
/* global _, SkillTags, validateModel, sails */

var squel = require("squel");
module.exports = function create(request, response) {
    const post_request_data = request.body;
    var _response_object = {};
    pick_input = [
        'tag'
    ];
    var filtered_post_data = _.pick(post_request_data, pick_input);
    const filtered_post_keys = Object.keys(filtered_post_data); 
    var input_attributes = [ 
        {name: 'tag', required: true}
    ]; 

    // Create a Skill Tag in db.
    function createSkillTag(data, successCallBack){
        SkillTags.create(data, async function(err, skill_tag){
            UtilsService.throwIfErrorElseCallback(err, response, 500, ()=>{
                successCallBack(skill_tag);
            });
        });
    } 

    // Check whether the name of skill tag is unique in db.
    function isSkillTagNameIsUnique(criteria, successCallBack){
        SkillTags.find(criteria, async function(err, skill_tag){ 
            UtilsService.throwIfErrorElseCallback(err, response, 500, ()=>{
                if(_.isEmpty(skill_tag)){
                    successCallBack();
                }else{
                    _response_object = {};
                    _response_object.details = {};
                    _response_object.details.field = 'tag';
                    _response_object.details.rule = 'unique';
                    _response_object.message = 'The value that you given for the attribute tag has already exist.';
                    return response.status(400).json(_response_object);
                }
            });
        });
    }

    // Build and send response.
    function sendResponse(details){
        _response_object = {};
        _response_object.message = 'Skill tag has been created successfully.';
        _response_object.details = details;
        return response.status(200).json(_response_object);
    };
	//Validating the request and pass on the appriopriate response.
    validateModel.validate(SkillTags, input_attributes, filtered_post_data, async function(valid, errors){
        if(valid){ 
            if(filtered_post_keys.includes('tag')){ 
                filtered_post_data.tag = _.toLower(filtered_post_data.tag);
            }
            isSkillTagNameIsUnique(_.pick(filtered_post_data, ['tag']), function(){ 
                createSkillTag(filtered_post_data, function(skill_tag){
                    sendResponse(skill_tag);
                });
            });
        }
        else{
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.status(400).json(_response_object);
        }
    }); 
};
