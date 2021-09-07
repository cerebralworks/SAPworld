/* global _, Industries, sails */
module.exports = async function findone(request,response){
        var id = request.params.id;
        Industries.findOne(id).then(data=>{
            return response.status(200).json(data)
        }).catch(Error=>{
            return response.status(400).send(Error)
        })
}