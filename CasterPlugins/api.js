var http = require('http');
var internalIp = require('internal-ip');
var router = require('router');
var path = require('path');
var fs = require('fs');
var findFilesWithExtension = require('../utils/findFilesWithExtension')
var Transcoder = require('stream-transcoder');
var serveMp4 = require('../utils/serve-mp4');
const getDirectories = require('../utils/getDirectories')


function isMp4File(filePath) {
  const noProtocol = (filePath.indexOf('http') !== 0);
  const isMp4 = (filePath.slice(-3).toLowerCase() === 'mp4');
  return noProtocol && isMp4 && fs.existsSync(filePath) && fs.statSync(filePath).isFile();
};

function fileNeedEncoding(filePath) {
  try {
    const noProtocol = (filePath.indexOf('http') !== 0);
    const isMp4 = (filePath.slice(-3).toLowerCase() === 'mp4');
    return noProtocol && !isMp4 && fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  }catch(err){
    return false;
  }
};


function transcode(req, res, filePath){
  
  console.log('incoming request for path %s', filePath);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('Access-Control-Allow-Origin', '*');

  var trans = new Transcoder(filePath)
    .videoCodec('h264')
    .videoBitrate(800 * 1000)
    .fps(30)
    .maxSize(1280,720)
    .audioCodec('aac')
    .channels(2)
    .sampleRate(44100)
    .format('mp4')
    .custom('strict', 'experimental')
    .on('finish', function() {
      console.log('finished transcoding');
    })
    .on('error', function(err) {
      console.log('transcoding error: %o', err);
    });

  var args = trans._compileArguments();
  args = [ '-i', '-' ].concat(args);
  args = [ '-vsync', '2' ].concat(args);
  
  args.push('pipe:1');
  console.log('spawning ffmpeg %s', args.join(' '));

  trans.stream().pipe(res);
}

function serverui(caster){
  const route = router();
  const ip = internalIp.v4.sync();
  const port = 8080;

  route.get('/stream/{path}', function(req, res){
    console.log('stream')
    console.log(decodeURIComponent(req.params.path));
    const filePath = decodeURIComponent(req.params.path)
    if (isMp4File(filePath)){
      serveMp4(req, res, filePath);
    } else if (fileNeedEncoding(filePath)){
      transcode(req, res, filePath);
    }
  
    
  })

  route.get('/cast/{path}', function(req, res) {
    res.statusCode = 200;
    caster.launch(req.params.path)
    console.log(req.params.path)
    res.end();
  });
  route.get('/image/{movie}/{filename}', function(req, res){

    const image = fs.readFileSync(`//LS220D9C3/Film/${decodeURIComponent(req.params.movie.replace("%27", "'"))}/${decodeURIComponent(req.params.filename)}`)
    if (!image){
      console.log('unable to fetch: ' + `//LS220D9C3/Film/${decodeURIComponent(req.params.movie.replace("%27", "'"))}/${decodeURIComponent(req.params.filename)}`)
    }
    res.statusCode = 200;
    res.writeHead(200, {'Content-Type': 'image/' + path.extname(req.params.filename) });
    res.end(image, 'binary');
  })
  route.get('/moviedata', function(req, res){
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    const movieExtensions = [
      'mp4',
      'mkv',
      'avi',
      'mov',
      'mpg',
      'mpeg',
    ]
    const imageExtensions = [
      'jpg',
      'png',
      'jpeg',
      'gif'
    ] 
    let movies = getDirectories('//LS220D9C3/Film/','mp4');
    movies = movies.filter( (folderName) => { return folderName.split('\\')[folderName.split('\\').length - 1].indexOf('.') !== 0 });
    let movieList = movies.map( movie => {

      let name = movie.split('\\')[movie.split('\\').length - 1]
      let movieFiles = findFilesWithExtension(movie, movieExtensions);
      let imageFiles = findFilesWithExtension(movie, imageExtensions);
      let poster =  imageFiles.find( file => (file.toLowerCase() === "poster.jpg" || file.toLowerCase() === "poster.png") )

      let movieToPlay = movieFiles.find( file => { return file.indexOf("-trailer.") < 0})
      let trailerToPlay = movieFiles.find( file => { return file.indexOf("-trailer.") > 0})

      return {
        name,
        movieFiles,
        imageFiles,
        poster,
        playPath: movie,
        movieToPlay,
        trailerToPlay,
      }      
    })
    //remove series or other strange movies... 
    
    movieList = movieList.filter( (movie) => {
      return (movie.movieFiles.length < 5 
                && movie.movieToPlay 
                && movie.name.toLowerCase() !== 'trashbox'
                && movie.poster !== 'undefined'
              )
      })
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/json; charset=utf-8')
    res.write(JSON.stringify(movieList)) ;
    res.end();
  })

  route.get('/', function (req, res) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    
    const index = fs.readFileSync(path.resolve(__dirname, '../html/index.html'), 'UTF-8');
     
    res.statusCode = 200;
    res.writeHead(200, {'Content-Type': 'text/html'});
    console.log('send index')
    res.end(index);
  });


  
  http.createServer(route).listen(port);
  
}

module.exports = serverui;