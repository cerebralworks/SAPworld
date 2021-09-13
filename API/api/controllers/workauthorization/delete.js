/* global _, Workauthorization, sails */
module.exports = async function deletes(request,response){
   
         var id = request.params.id
         WorkAuthorization.destroy(id).then(()=>{
             return response.status(200).json({meesage : "deleted succesfully"})
         }).catch(Error=>{
             return response.status(400).send(error)
         })
         
}