module.exports = async function update(request,response){
    var id = request.params.id;
    var reqData = request.body;
    var inputs = ['name'];
    var filter = _.pick(reqData,inputs)
    var reqFields = [
     { name: 'id', number: true },
     { name: 'name', required: true }
     ];
     validateModel.validate(Language,reqFields,filter,(valid,error)=>{
         if(valid){
            Language.update(request.params.id,filter).then(data=>{
             return response.status(200).json(data);
            })
         }
         else return response.status(400).send(error)
     })
}