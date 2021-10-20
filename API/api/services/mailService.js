

/* global _ */

exports.sendMail = function(mail_data, callback = (err)=>{
    console.log(err || 'Mail Sent!');
}) {
    sails.hooks.email.send(mail_data.template, mail_data.data, {to: mail_data.to, subject: mail_data.subject, cc: _.get(sails, 'config.conf.default_cc_email_id')}, callback);
};
