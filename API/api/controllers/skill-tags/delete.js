/* global _, SkillTags, sails */
module.exports = async function deletes(request,response){
       /* var id = request.body.id;
        var ids = parseInt(id)            
            try {
                    if(!id){   
                    return response.status(400).json({message : "Must pass the ID value"})
                    }
                    SkillTags.findOne(ids).then(data=>{
                    if(!data){
                     response.setHeader('Content-Type', 'application/json'); 
                    return response.status(400).json({message : "ID doesnt Exist"})
                    }
                    })
                    SkillTags.destroy(ids).then((succes,Error)=>{
                    if(succes){
                    return response.status(200).json({meesage : "deleted succesfully"})
                    }
                    else  response.status(400).send(Error)
                    })
            
            } catch (error) {
                return response.status(400).send(error)
            }*/
 
            var id = request.params.id
            SkillTags.destroy(id).then(()=>{
                return response.status(200).json({meesage : "deleted succesfully"})
            }).catch(Error=>{
                return response.status(400).send(error)
            })
            
}