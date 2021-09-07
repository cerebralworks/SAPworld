/* global _, Country, validateModel, sails */
module.exports = async function deletes(request,response){
    var id = request.body.id;
    var ids = parseInt(id)            
        try {
            if(!id){
                return response.status(400).json({message : "Must pass the ID value"})
                }
                Country.findOne(ids).then((data)=>{
                if(!data){
                 response.status(400).json({message : "ID doesnt Exist"})}
                })
                Country.destroy(ids).then((succes,Error)=>{
                if(succes){
                    return response.status(200).json({meesage : "deleted succesfully"})
                }
                else return response.status(400).send(Error)
                })
        } catch (error) {
            return response.status(400).send(error)
        }
            
        
}