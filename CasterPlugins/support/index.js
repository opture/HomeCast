function createLocalHttpOptions(){
  if (type !== 'audio' && type !== 'video') mimeType = 'video/mp4';
  self.localStreams.push(self.streamPath)
  const streamRoute  = {
    path: 'http://' + ip + ':' + port + '/' + (self.localStreams.length - 1),
    type: mimeType,
    media: {
      metadata: {
        filePath: self.streamPath,
        title: path.basename(self.streamPath)
      }
    }
  };
}