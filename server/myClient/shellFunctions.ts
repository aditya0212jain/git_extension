import * as start from './start';
import * as os from 'os';
const shell = require('shelljs');

export function runShellBlob(repo,branch){
  var platform = os.platform();
  if(platform=="linux" || platform =="darwin"){
    var text = '\'console.log("'+start.workingDirectory+'");console.log("'+start.serverDirectory+'");console.log("'+repo+'");console.log("'+branch+'");\'';
    var command = "echo "+text+" > "+"argShellBlob.js";
    shell.exec(command);
    shell.exec('chmod +x runShellBlobLinux.sh');
    shell.exec('./runShellBlobLinux.sh');
  }else if(platform=="win32"){
    var text = 'console.log("'+start.workingDirectory+'");console.log("'+start.serverDirectory+'");console.log("'+repo+'");console.log("'+branch+'");';
    var command = "echo "+text+" > "+"argShellBlob.js";
    //console.log(command);
    shell.exec(command);
    shell.exec('chmod +x runShellBlob.sh');
    shell.exec('sh runShellBlob.sh');
  }

}

export function runShellPull(repo,branch1,branch2){
  var platform = os.platform();
  if(platform=="linux" || platform =="darwin"){
    var text = '\'console.log("'+start.workingDirectory+'");console.log("'+start.serverDirectory+'");console.log("'+repo+'");console.log("'+branch1+'");'+'console.log("'+branch2+'");\'';
    var command = "echo "+text+" > "+"argShellPull.js";
    shell.exec(command);
    shell.exec('chmod +x runShellPullLinux.sh');
    shell.exec('./runShellPullLinux.sh');
  }else if(platform=="win32"){
    var text = 'console.log("'+start.workingDirectory+'");console.log("'+start.serverDirectory+'");console.log("'+repo+'");console.log("'+branch1+'");'+'console.log("'+branch2+'");';
    var command = "echo "+text+" > "+"argShellPull.js";
    shell.exec(command);
    shell.exec('chmod +x runShellPull.sh');
    shell.exec('sh runShellPull.sh');
  }
}