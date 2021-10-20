/* global _, Program */
module.exports = async function deletemultiple(request,response){
    var id = request.params.id
   Program.destroy(id).then(()=>{
       return response.status(200).json({meesage : "deleted succesfully"})
   }).catch(Error=>{
       return response.status(400).send(error)
   })
               
}