var Client                = require('castv2-client').Client;
var DefaultMediaReceiver  = require('castv2-client').DefaultMediaReceiver;


var Caster = function(host) {
  this.host = host;
  this.isHttpServerStarted = false;
  this.localStreams = [];
  this.client = new Client();
  this.playerState = '0';
  this.player = null;
  this.connected = false;
  this.options = {
    toMp4: false,
    disableTimeline: false,
    disableSeek: false,
    'transcode-port': 4103,
    //myip: '127.0.0.1',
  }
  this.DefaultMediaReceiver = DefaultMediaReceiver;
};

Caster.prototype.use = function(fn) {
  var self = this;

  this.go = (function(stack) {
    return function(next) {
      stack.call(self, function() {
        fn.call(self, next.bind(self));
      });
    }.bind(this);
  })(this.go);
};

Caster.prototype.go = function(next) {
  next();
};

Caster.prototype.clientLaunch = function(){
  var self = this;
  this.connected = true;
  const {client, DefaultMediaReceiver} = self; 
  client.launch(DefaultMediaReceiver, function(err, player) {
    var media = {
      contentId: self.pathOrUrl,
      contentType: 'video/mp4',
      streamType: 'BUFFERED', // or LIVE
      metadata: {
        type: 0,
        metadataType: 0,
        title: "The Roundturn", 
        images: [
          { url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg' }
        ]
      }        
    };
    self.player = player;

    player.on('status', function(status) {
      console.log('status broadcast playerState=%s', status.playerState);
      self.playerState = status.playerState;
    });

    console.log('app "%s" launched, loading media %s ...', player.session.displayName, media.contentId);

    player.load(media, { autoplay: true }, function(err, status) {
      if (!status) return;
      console.log('media loaded playerState=%s', status.playerState);
      self.playerState = status.playerState;
      mediaIsLoaded = true;
    });

  });
}

Caster.prototype.clientError = function(err){
  console.log('Error: %s', err.message);
  client.close();
}

Caster.prototype.comnectClient = function(pathOrUrl){
  var self = this;
  const {client, host} = self; 
  
  client.connect(host, self.clientLaunch.bind(self));

  client.on('error', self.clientError);
}

Caster.prototype.launch = function(pathOrUrl) {
  const self = this;
  this.pathOrUrl = pathOrUrl;
  console.log('launch: ' + pathOrUrl)
  if (self.connected){
    if (self.playerState !== 'IDLE'){
      console.log('stop')
      //self.player.stop();
    }else{
      //self.player.play();
    }

    self.go(self.clientLaunch.bind(self));
  }else{
    self.go(self.comnectClient);
  }
  
}

module.exports = Caster;