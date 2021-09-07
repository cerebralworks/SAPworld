/* global _, Country,validateModel, sails */

module.exports = async function update(request,response){
    var id = request.params.id;
    var reqData = request.body;
    var inputs = ['iso','name','nicename'];
    var filter = _.pick(reqData,inputs)
    var reqFields = [
     { name: 'id', number: true },
     { name: 'iso', required: true },
     { name: 'name', required: true},
     { name: 'nicename', required: true},
     ];
     validateModel.validate(Country,reqFields,filter,(valid,error)=>{
         if(valid){
         Country.update(request.params.id,filter).then(data=>{
             return response.status(200).json(data);
            })
         }
         else return response.status(400).send(error)
     })
}