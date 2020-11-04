module.exports = function ok(data){
    const request = this.req;
    const response = this.res;
    var _response_object = {};
    if(!data){
        _response_object.message = 'Something wrong with encrypting the data.';
        return response.status(500).json(_response_object);
    }else{
        var data_string = JSON.stringify(data);
        _response_object.data = data_string;
        _response_object.message = 'Data retrieved successfully.';
        _response_object.encrypted = true;
        return response.status(200).json(_response_object);
    }
}
