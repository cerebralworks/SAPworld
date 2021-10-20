/* global _, Program, validateModel, sails */
module.exports = async function update(request,response){
    var id = request.params.id;
    var reqData = request.body;
    var inputs = ['name','description','status'];
    var filter = _.pick(reqData,inputs)
    var reqFields = [
     { name: 'id', number: true },
     { name: 'name', required: true },
     { name: 'description'},
     { name: 'status',number : true},
     ];
     Program.find().then(data=>{
        var isdata = data.filter((a)=>{
             if(_.toLower(a.name)===_.toLower(request.body.name)){
                 return a;
             }  
         })
        if(isdata.length !=0){

            if(parseInt(isdata[0]['id'])==parseInt(request.params.id)){
                validateModel.validate(Program,reqFields,filter,(valid,error)=>{
                    if(valid){
                        Program.update(request.params.id,filter).then(data=>{
                        return response.status(200).json(data);
                       })
                    }
                    else return response.status(400).send(error)
                })
            }else{
                return response.status(400).json({meesage : "already exist"});
            }
        }else{
            validateModel.validate(Program,reqFields,filter,(valid,error)=>{
                if(valid){
                    Program.update(request.params.id,filter).then(data=>{
                    return response.status(200).json(data);
                   })
                }
                else return response.status(400).send(error)
            })
        }
        
             
     })

}