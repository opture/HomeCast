const Caster = require('./lib/Caster');
const localfile = require('./CasterPlugins/localfile');
const transcode = require('./CasterPlugins/transcode')
const serverui = require('./CasterPlugins/api')
const caster = new Caster('192.168.1.159');


// Add middleware to the Caster.
caster.use(localfile);
caster.use(transcode);
//caster.use(serverui)
//caster.connectClient();
//caster.launch('//LS220D9C3/Film/Bigfoot Junior (2017)/trailer.mp4');
//caster.launch('http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4')
//caster.launch('//LS220D9C3/Film/Final\ Score\ (2018)/Final\ Score(\ 2018).mkv');
//caster.launch('//LS220D9C3/Film/Wonder Woman (2017)/Wonder Woman( 2017)-trailer.mov')
//caster.launch('//LS220D9C3/Film/Vaiana (2016)/Vaiana( 2016).mp4')
serverui(caster);

