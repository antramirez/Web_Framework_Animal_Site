// webby.js
const path = require('path');
const net = require('net');

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

class App {
  // set constructor with default properties
  constructor() {
    this.server = net.createServer(sock => this.handleConnection(sock));
    this.routes = {};
    this.middleware = null;
  }

  normalizePath(path) {
    // get first character and make sure it is actually a forward slash
    let normPath = path.charAt(0);
    if (!normPath === '/') {
      return '';
    }
    // counter
    let i = 1;
    let pathToCheck = '';
    let stop = false;
    // iterate through string until ?, #, or = is encountered
    while (path.charAt(i) !== '?' && path.charAt(i) !== '#' && path.charAt(i) !== '=' && i < path.length) {
      // add to string until '/'
      if (path.charAt(i) !== '/') {
        normPath += path.charAt(i).toLowerCase();
      }
      // however, if there is more to the valid path after the '/', add it to normPath
      else {
        // counter for remainder of string
        let j = i + 1;
        // iterate through rest of string until ?, #, or = is encountered
          while (j < path.length - 1) {
            if (path.charAt(j) !== '?' && path.charAt(j) !== '#' && path.charAt(j) !== '=') {
              // add next letter assuming it is valid or else break out of while loop
              pathToCheck += path.charAt(j);
              j++;
            }
            else{
              break;
            }
          }
          // if the remainder of the valid string is not empty,
          // there is more to the path so add another '/' to normPath
          if (pathToCheck !== '') {
            normPath += '/';
          }
      }
      i++;
    }
    // return string
    return normPath;
  }

  createRouteKey(method, path) {
    // concatenate method and path strings
    const methodRet = method.toUpperCase();
    const pathRet = this.normalizePath(path);
    return methodRet + ' ' + pathRet;
  }

  get(path, cb) {
    // set a route's object's key to the return value of createRouteKey,
    // and the object's value to the callback function passed in as an argument
    this.routes[this.createRouteKey('GET', path)] = cb;
  }

  use(cb) {
    // set middleware
    this.middleware = cb;
  }

  listen(port, host) {
    // set port and host on net server
    this.server.listen(port, host);
  }

  handleConnection(sock) {
    // set the callback for the socket's on method
    sock.on('data', sock=> this.handleRequest(sock));
  }

  handleRequest(sock, binaryData) {
    // TODO
  }

  processRoutes(req, res) {
    // TODO
  }

}

class Response {

  constructor(socket, statusCode, version) {
    this.sock = socket;
    // check if statusCode and version are set, and if they're not, use default values
    if (statusCode) {
      this.statucCode = statusCode;
    }
    else {
      this.statusCode = 200;
    }
    if (version) {
      this.version = version;
    }
    else {
      this.version = 'HTTP/1.1';
    }
  }

}

module.exports = {
  HTTP_STATUS_CODES: HTTP_STATUS_CODES,
  MIME_TYPES: MIME_TYPES,
  getExtension: getExtension,
  getMIMEType: getMIMEType,
  Request: Request,
  App: App,
  Response: Response
};
