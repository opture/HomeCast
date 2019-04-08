var path = require('path')
var fs = require('fs')

function findFilesWithExtension(folder, fileExtensions) 
{
    const movieExtensions = [
      'mp4',
      'mkv',
      'avi',
      'mov',
      'mpg',
      'mpeg',
    ]
    let files =  fs.readdirSync(folder) 
    let result =  [] 

    files.forEach( 
        function (file) {
          splittedFileName = file.split('.');
          extension = splittedFileName[splittedFileName.length - 1];
          if (fileExtensions.find( ext => ext === extension)){
            result.push(file);
          }
        }
    )
    return result
}
module.exports = findFilesWithExtension