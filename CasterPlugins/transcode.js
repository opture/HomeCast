var http = require('http');
var internalIp = require('internal-ip');
var Transcoder = require('stream-transcoder');
var fs = require('fs');

function fileNeedEncoding(filePath) {
  try {
    const noProtocol = (filePath.indexOf('http') !== 0);
    const isMp4 = (filePath.slice(-3).toLowerCase() === 'mp4');
    return noProtocol && !isMp4 && fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  }catch(err){
    return false;
  }
};

function transcode(next) {
  const self = this;
  self.streamPath = self.pathOrUrl;
  if (!fileNeedEncoding(self.streamPath)) return next();
  console.log('Kör på transcode...')
  var port = 8080;
  var ip = self.options.myip || internalIp.v4.sync();

  self.options.disableTimeline = true;
  self.options.disableSeek = true;

  // http.createServer(function(req, res) {
    
  //   console.log('incoming request for path %s', self.streamPath);

  //   res.statusCode = 200;
  //   res.setHeader('Content-Type', 'video/mp4');
  //   res.setHeader('Access-Control-Allow-Origin', '*');
  //   //var s = fs.createReadStream(self.streamPath);
  //   // s.on('error', function(err) {
  //   //   console.log('got error: %o', err);
  //   // });

  //   var trans = new Transcoder(self.streamPath)
  //     .videoCodec('h264')
  //     .videoBitrate(800 * 1000)
  //     .fps(30)
  //     .maxSize(1280,720)
  //     .audioCodec('aac')
  //     .channels(2)
	//     .sampleRate(44100)
  //     .format('mp4')
  //     .custom('strict', 'experimental')
  //     .on('finish', function() {
  //       console.log('finished transcoding');
  //     })
  //     .on('error', function(err) {
  //       console.log('transcoding error: %o', err);
  //     });

  //   var args = trans._compileArguments();
  //   args = [ '-i', '-' ].concat(args);
  //   args = [ '-vsync', '2' ].concat(args);
    
  //   args.push('pipe:1');
  //   console.log('spawning ffmpeg %s', args.join(' '));

  //   trans.stream().pipe(res);
  // }).listen(port);
  
  self.pathOrUrl = 'http://' + ip + ':' + port + '/stream/' + encodeURIComponent(self.pathOrUrl);
  console.log(self.pathOrUrl)
  next();
};

module.exports = transcode;
