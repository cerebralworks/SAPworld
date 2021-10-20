module.exports = function declineAgreement(err, extraInfo){
    const req = this.req;
    const res = this.res;

    const newError = new Error('User need to accept the terms and condition');
    var errors=[];
    var error = 
        {
            field:"accept_terms_condition",
            message: 'User need to accept the terms and condition'
        };
        errors.push(error);
     return res.badRequest({errors:errors});

}