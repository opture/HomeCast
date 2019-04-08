var http = require('http');
var internalIp = require('internal-ip');
var router = require('router');
var path = require('path');
var serveMp4 = require('../utils/serve-mp4');
var fs = require('fs');
var mime = require('mime')


function isFile(filePath) {
  const noProtocol = (filePath.indexOf('http') !== 0);
  const isMp4 = (filePath.slice(-3).toLowerCase() === 'mp4');
  return noProtocol && isMp4 && fs.existsSync(filePath) && fs.statSync(filePath).isFile();
};



function localfile(next){
  const self = this;
  self.streamPath = self.pathOrUrl;
  if (!isFile(self.pathOrUrl)) return next();
  
  const route = router();
  const ip = internalIp.v4.sync();
  const port = 8080;
  const mimeType = mime.lookup(self.streamPath);
  const type = mimeType.split('/')[0];

  if (type !== 'audio' && type !== 'video') mimeType = 'video/mp4';
  self.localStreams.push(self.streamPath)
  const streamRoute  = {
    path: 'http://' + ip + ':' + port + '/stream/' + encodeURIComponent(self.pathOrUrl),
    type: mimeType,
    media: {
      metadata: {
        filePath: self.streamPath,
        title: path.basename(self.streamPath)
      }
    }
  };

  self.pathOrUrl = streamRoute.path;
  
  next();
}

module.exports = localfile