// webby.js
const path = require('path');
const net = require('net');
const fs = require('fs');

const HTTP_STATUS_CODES = {
  200: 'OK',
  301: 'Redirect',
  404: 'Not Found',
  500: 'Internal Server Error'
};

const MIME_TYPES = {
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'html': 'text/html',
  'css': 'text/css',
  'txt': 'text/plain'
};

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
    const [method, path] = httpRequest.split(' ');
    this.method = method;
    this.path = path;
  }
}

class Response {

  constructor(socket, statusCode, version) {
    // set properties
    this.sock = socket;
    // check if statusCode and version are set, and if they're not, use default values
    if (statusCode !== undefined) {
      this.statusCode = statusCode;
    }
    else {
      this.statusCode = 200;
    }
    if (version !== undefined) {
      this.version = version;
    }
    else {
      this.version = 'HTTP/1.1';
    }

    this.headers = {};
    this.body = '';
  }

  set(name, value) {
    // add header and header values
    this.headers[name] = value;
  }

  end() {
    // call end on socket
    this.sock.end();
  }

  statusLineToString() {
    // return HTTP version, status code, and status code message
    return this.version + ' ' + this.statusCode + ' ' + HTTP_STATUS_CODES[this.statusCode] + '\r\n';
  }

  headersToString() {
    let s = '';
    // add headers and values follwed by line and feed return to string
    for (const h in this.headers) {
      s += h;
      s += ': ' + this.headers[h];
      s += '\r\n';
    }

    // return string
    return s;
  }

  send(body) {
    // write status
    this.sock.write(this.statusLineToString());
    // check if header has been set or else set Content-Type to text/html
    if (this.headersToString() === {}) {
      this.set('Content-Type', 'text/html');
    }
    // write headers and add carriage return and new line
    this.sock.write(this.headersToString());
    this.sock.write('\r\n');
    // write body and end connection
    this.sock.write(body);
    this.sock.end();
  }

  status(statusCode) {
    // set status code and return Response object
    this.statusCode = statusCode;
    return this;
  }
}

class App {
  // set constructor with default properties
  constructor() {
    /* server code from https://cs.nyu.edu/courses/fall18/CSCI-UA.0480-003/_site/homework/03.html */
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
    sock.on('data', (binaryData) => this.handleRequest(sock, binaryData));
  }

  handleRequest(sock, binaryData) {
    // create new request and response objects, using binaryData string and sock, respectively
    const newRequest = new Request('' + binaryData);
    const newResponse = new Response(sock, 200, 'HTTP/1.1');
    // if middleware is set, use it with the new request and
    // response objects and use processRoutes as the next function
    if (this.middleware !== null) {
      // bind app class to processRoutes with appropriate parameters
      this.middleware(newRequest, newResponse, this.processRoutes.bind(this, newRequest, newResponse));
    }
    else {
      // if middleware is not set, just call processRoutes
      this.processRoutes(newRequest, newResponse);
    }
  }

  processRoutes(req, res) {
    // get function stored in routes, based on request's method and path
      const f = this.routes[this.createRouteKey(req.method, req.path)];

      // if there is the function exists, call it, or else send 404 page
      if (f) {
        f(req, res);
      }
      else {
        res.status(404).send("Page not found");
      }
  }
}

function serveStatic(basePath) {
  // return middleware
  return (req, res, next) => {
    // concatenate base path with the path of the request object
    const fullPath = path.join(basePath, req.path);
    // read file and check for error
    fs.readFile(fullPath, (err, data) => {
      if (!err) {
        // if no error, set content type based on mime type of path and send data to response object
        res.set('Content-Type', getMIMEType(fullPath));
        res.status(200).send(data);
      }
      else {
        // invoke callback function if error
        next();
      }
    });
  };
}

// export modules
module.exports = {
  HTTP_STATUS_CODES: HTTP_STATUS_CODES,
  MIME_TYPES: MIME_TYPES,
  getExtension: getExtension,
  getMIMEType: getMIMEType,
  Request: Request,
  App: App,
  Response: Response,
  static: serveStatic
};
