/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/**
 * Return a unique identifier with the given `len`.
 *
 *     utils.uid(10);
 *     // => "FDaS435D2z"
 *
 * @param {Number} len
 * @return {String}
 * @api private
 */

exports.uid = function(len) {
  var buf = []
    , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    , charlen = chars.length;

  for (var i = 0; i < len; ++i) {
    buf.push(chars[getRandomInt(0, charlen - 1)]);
  }

  return buf.join('');
};

exports.uidLight = function(len) {
  var buf = []
    , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    , charlen = chars.length;

  for (var i = 0; i < len; ++i) {
    buf.push(chars[getRandomInt(0, charlen - 1)]);
  }

  return buf.join('');
};

/**
 * Throw error back to client`
 *
 * @param {Object} error
 * @param {Object} response
 * @return {Response}
 * @api private
 */
exports.throwIfErrorElseCallback = function(error, response, status = 500, callback=()=>{}) {
  if(!_.isEmpty(error)){
    const _response_object = {};
    errorBuilder.build(error, function (error_obj) {
      _response_object.errors = error_obj;
      _response_object.count = error_obj.length;
      return response.status(status).json(_response_object);
    });
  }else{
    callback();
  }
}

/**
 * Return the image URL`
 *
 * @param {String} folder
 * @param {String} size
 * @return {String}
 * @api private
 */
exports.S3Images=function(foldername, filename, size= 'small'){
  /**
   * available folders
   * Categories, Common, Companies, Employers, Industry, Users
   * 
   * available image sizes
   * small - 256, medium - 512
   */
  const meta = {
    path: 'https://s3.' + sails.config.conf.aws.region + '.amazonaws.com/' + sails.config.conf.aws.bucket_name,
    folder: `public/images/${foldername}`,
    sizes: {
      small: 256,
      medium: 512
    }
  };

  return `${_.get(meta, 'path')}/${_.get(meta, 'folder')}/${_.get(meta, `sizes.${size}`)}/${filename}`;

}

/**
 * Return Application base URL`
 *
 * @param {Object} request
 * @return {String}
 * @api private
 */
exports.baseUrl=function(request){

const protocol = _.get(request, 'connection.encrypted')?'https':'http';
const baseUrl = protocol + '://' + _.get(request, 'headers.host');
console.log(baseUrl);
return baseUrl;
}

/**
 * Return a random int, used by `utils.uid()`
 *
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 * @api private
 */

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
