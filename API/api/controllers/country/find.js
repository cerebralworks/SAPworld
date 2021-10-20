/* global _, Country, sails */

module.exports =async function find(request,response){
    var page = request.body;
    Country.find().then(data=>{
        return response.status(200).json(data)
    }).catch(Error=>{
        return response.status(400).send(Error)
    })
}