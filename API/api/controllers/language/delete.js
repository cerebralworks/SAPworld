/* global _, Language, sails */
module.exports = async function deletemultiple(request,response){

    var id = request.body.id
    var ids = parseInt(id)
    try {
       if(!id){
           return response.status(400).json({message : "Must pass the ID value"})
       }
      Language.findOne(ids).then((data)=>{
      if(!data){
          return response.status(400).json({message : "ID doesnt exist"})}
      })
      Language.destroy(ids).then((succes,Error)=>{

          if(succes){
              return response.status(200).json({meesage : "deleted succesfully"})
          }
          else return response.status(400).send(Error)
          })                 
    } catch (error) {
        return response.status(400).send(error)
    }
               
}