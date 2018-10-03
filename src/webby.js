// webby.js
const path = require('path');

const HTTP_STATUS_CODES = {
  200: 'OK',
  404: 'NOT FOUND',
  500: 'INTERNAL SERVER ERROR'
}

const MIME_TYPES = {
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'html': 'text/html',
  'css': 'text/css',
  'txt': 'text/plain'
}

function getExtension(fileName) {
  // use path module to get extension and return string after the '.'
  return path.extname(fileName).substring(1);
}

function getMIMEType(fileName) {
  const mime = getExtension(fileName);
  // return empty string if mime is undefined
  if (!mime) {
    return '';
  }
  // return mime type from MIME_TYPES object
  return MIME_TYPES[mime];
}

class Request {
  // set constructor (taken from class 7 notes)
  constructor(httpRequest) {
    const [method, path, ...notUsed] = httpRequest.split(' ');
    this.method = method;
    this.path = path;
  }
}

module.exports = {
  HTTP_STATUS_CODES: HTTP_STATUS_CODES,
  MIME_TYPES: MIME_TYPES,
  getExtension: getExtension,
  getMIMEType: getMIMEType,
  Request: Request
};
