/* global _, SkillTags, validateModel, sails */

module.exports = async function update(request,response){
       var id = request.params.id;
       var reqData = request.body;
       var inputs = ['tag','status','long_tag'];
       var filter = _.pick(reqData,inputs)
       var reqFields = [
        { name: 'id', number: true },
        { name: 'tag', required: true },
        { name: 'status', number: true},
        { name: 'long_tag', required: true},
        ];
        validateModel.validate(SkillTags,reqFields,filter,(valid,error)=>{
            if(valid){
            SkillTags.update(request.params.id,filter).then(data=>{
                return response.status(200).json(data);
               })
            }
            else return response.status(400).send(error)
        })
}