import * as cp from 'child_process';
import * as ls from '../languageclient';
import * as rpc from 'vscode-jsonrpc';
import * as path from 'path';
// import * as Convert from '../utils';
import * as net from 'net';
import { Socket } from 'net';
import { LanguageClientConnection } from '../languageclient';
import {NullLogger,ConsoleLogger,Logger} from '../logger';
import {EventEmitter} from 'events';
import * as stream from 'stream';
import * as readline from 'readline';
import * as os from 'os';
import {myClient,pathToUri} from './myclient'

const shell = require('shelljs');
const clientTest = new myClient();
var t;
var globalRepo;
var globalBranch;
var globalBranchBase;
var globalBranchHead;
var serverDirectory= path.join(__dirname,'serverRepos');
var serverBusy = false;
var forReference = false;
serverDirectory = serverDirectory.replace(/\\/g,'/');
var workingDirectory= "G:/Repos/working";
var globalCurrentWorkspace;

 async function handleRequest(obj){
   return new Promise(async (resolve,reject)=>{
    if(obj.method == "blob"){
      runShellBlob(obj.repo,obj.branch);
      globalRepo = obj.repo;
      globalBranch = obj.branch;
      console.log("before the if serverBusy: "+serverBusy);
      if(!serverBusy){
        serverBusy = true;
        if(!forReference){
          t = await clientTest.startServer(serverDirectory);
        }
        forReference = false;
        serverBusy = false;
      }
      console.log("After the if serverBusy: "+serverBusy);
      if(globalCurrentWorkspace!=globalRepo+"_"+globalBranch){
        if(globalCurrentWorkspace){
          await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders',{event:{added:[{uri:pathToUri(serverDirectory)+"/"+globalRepo+"_"+globalBranch,name:globalRepo+"_"+globalBranch}],removed:[{uri:pathToUri(serverDirectory)+"/"+globalCurrentWorkspace,name:globalCurrentWorkspace}]}});
        }else{
          await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders',{event:{added:[{uri:pathToUri(serverDirectory)+"/"+globalRepo+"_"+globalBranch,name:globalRepo+"_"+globalBranch}],removed:[]}});
        }
        globalCurrentWorkspace=globalRepo+"_"+globalBranch;
        console.log("setting gcW as: "+globalCurrentWorkspace);
      }
      var testR = {textDocument: {uri : pathToUri(serverDirectory)+"/"+obj.repo+"_"+obj.branch},position : {line:0,character:0}};//{textDocument: textidentifier,position : obj}
      //console.log(testR);
      const defR = await t.connection.gotoDefinition(testR);
      //console.log(defR);
      //console.log("The above are for instant initialization");
      resolve(JSON.stringify({method:"serverStarted"}));
    }else if(obj.method == "pull"){
      runShellPull(obj.repo,obj.branchBase,obj.branchHead);
      globalRepo = obj.repo;
      globalBranchHead = obj.branchHead;
      globalBranchBase = obj.branchBase;
      if(!serverBusy){
        serverBusy = true;
        if(!forReference){
          t = await clientTest.startServer(serverDirectory);
        }
        forReference = false;
        serverBusy = false;
      }
      if(globalCurrentWorkspace){
        await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders',{event:{added:[{uri:pathToUri(serverDirectory)+"/"+globalRepo+"_"+globalBranchHead,name:globalRepo+"_"+globalBranchHead}],removed:[{uri:pathToUri(serverDirectory)+"/"+globalCurrentWorkspace,name:globalCurrentWorkspace}]}});
      }else{
        await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders',{event:{added:[{uri:pathToUri(serverDirectory)+"/"+globalRepo+"_"+globalBranchHead,name:globalRepo+"_"+globalBranchHead}],removed:[]}});
      }
      globalCurrentWorkspace = globalRepo+"_"+globalBranchHead;
      console.log("setting gcW as: "+globalCurrentWorkspace);
      //await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders',{event:{removed:[],added:[{uri:pathToUri(serverDirectory)+"/"+globalRepo+"_"+globalBranchBase,name:globalBranchBase},{uri:pathToUri(serverDirectory)+"/"+globalRepo+"_"+globalBranchHead,name:globalBranchHead}]}});
      var testR = {textDocument: {uri : pathToUri(serverDirectory)+"/"+obj.repo+"_"+obj.branchHead},position : {line:0,character:0}};//{textDocument: textidentifier,position : obj}
      //console.log(testR);
      const defR = await t.connection.gotoDefinition(testR);
      //console.log(defR);
      //console.log("The above are for instant initialization");
      resolve(JSON.stringify({method:"serverStarted"}));
    }else if(obj.method =="query"){
      try{
        if(obj.type=="pull"){
          if(obj.branchType=="head"){
            if(globalCurrentWorkspace!=globalRepo+"_"+globalBranchHead){
                await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders',{event:{added:[{uri:pathToUri(serverDirectory)+"/"+globalRepo+"_"+globalBranchHead,name:globalRepo+"_"+globalBranchHead}],removed:[{uri:pathToUri(serverDirectory)+"/"+globalRepo+"_"+globalBranchBase,name:globalRepo+"_"+globalBranchBase}]}});
              globalCurrentWorkspace = globalRepo+"_"+globalBranchHead;
              console.log("setting gcW as: "+globalCurrentWorkspace);
            }
          }
          else{
            if(globalCurrentWorkspace!=globalRepo+"_"+globalBranchBase){
              await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders',{event:{removed:[{uri:pathToUri(serverDirectory)+"/"+globalRepo+"_"+globalBranchHead,name:globalRepo+"_"+globalBranchHead}],added:[{uri:pathToUri(serverDirectory)+"/"+globalRepo+"_"+globalBranchBase,name:globalRepo+"_"+globalBranchBase}]}});
              globalCurrentWorkspace=globalRepo+"_"+globalBranchBase;
              console.log("setting gcW as: "+globalCurrentWorkspace);
            }
          }
        }else if(obj.type=="blob"){
          if(globalCurrentWorkspace!=obj.repo+'_'+obj.branch){
            if(globalCurrentWorkspace){
              await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders',{event:{added:[{uri:pathToUri(serverDirectory)+"/"+globalRepo+"_"+globalBranch,name:globalRepo+"_"+globalBranch}],removed:[{uri:pathToUri(serverDirectory)+"/"+globalCurrentWorkspace,name:globalCurrentWorkspace}]}});
            }else{
              await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders',{event:{added:[{uri:pathToUri(serverDirectory)+"/"+globalRepo+"_"+globalBranch,name:globalRepo+"_"+globalBranch}],removed:[]}});
            }
            globalCurrentWorkspace=obj.repo+'_'+obj.branch;
            console.log("setting gcW as: "+globalCurrentWorkspace);
          }
        }
      }catch(e){
        console.log(e);
      }
      var resultForQuery = await handleQuery(obj.query);
      console.log("the result is: ");
      console.log(resultForQuery);
      var returningObject;
      var same=false;
      if(resultForQuery!=undefined||resultForQuery!=null){
        if(resultForQuery.uri==pathToUri(serverDirectory)+"/"+obj.query.textDocument){
          same=true;
        }else{
          forReference = true;
        }
      }
      if(obj.type=="blob"){
        returningObject = {method:obj.type,query:obj.query,definition:resultForQuery,same:same,repo:globalRepo,branch:globalBranch}
      }
      else if (obj.type=="pull"){
        returningObject = {method:obj.type,query:obj.query,definition:resultForQuery,branchType:obj.branchType,same:same,repo:globalRepo};
      }
      resolve(JSON.stringify(returningObject));
    }else if(obj.method =="startServer"){
      console.log("startServer request");
      resolve();
    }else if(obj.method=="closeServer"){
      console.log("closeServer request");
      resolve();
    }
  })
}

async function handleQuery(obj){
  try{
    var test = {textDocument: {uri : pathToUri(serverDirectory)+"/"+obj.textDocument},position : obj.position};//{textDocument: textidentifier,position : obj}
    const def = await t.connection.gotoDefinition(test);
    if(def!=null||def!=undefined){
      return def[0];
    }
  }
  catch(e){
    console.log(e);
  }
}

async function p(){
  var startServerPath = serverDirectory;
  var http = require('http');
  http.createServer(async function (request, response) {
    var body = [];
    request.on('error', (err) => {
      console.error(err);
    }).on('data', (chunk) => {
      body.push(chunk);
    }).on('end',async () => {
      var result = Buffer.concat(body).toString();
      // BEGINNING OF NEW STUFF
      response.on('error', (err) => {
      console.error(err);
    });
    var obj = JSON.parse(result);
    console.log("obj below");
    console.log(obj);
    var answer =await handleRequest(obj);
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/json');
    if(obj.method=="query"||obj.method=="pull"||obj.method=="blob"){
      response.write(answer);
    }else{
      response.write(obj.method);
    }
    response.end();

    });
  }).listen(8080); //the server object listens on port 8080
  console.log("w to set workingDirectory");
  console.log("c to clear temp files");
  var rl = readline.createInterface(process.stdin, process.stdout);
  var whichDir=0;// 1 for w and 2 for s
  var prefix = '>';
  var afterPrefix ='>';
  rl.on('line', function(line) {
    switch(line.trim()){
      case 'w':
      whichDir=1;
      prefix="Enter working directory";
      break;
      case 'c':
      whichDir=0;
      //console.log("rm -r -f "+serverDirectory+"/*");
      shell.exec("rm -r -f "+serverDirectory+"/*");
      shell.exec("rm -r -f ./server_0.9/.metadata");
      shell.exec("rm -r -f ./server_0.9/jdt.ls-java-project");
      console.log("done");
      break;
      default:
      if(whichDir==1){
        workingDirectory=line;
        console.log('workingDirectory set as '+workingDirectory);
        workingDirectory=workingDirectory.replace(/\\/g,'/');
        prefix = ">"
        break
      }else{
        console.log("wrong input");
        break;
      }
    }
    this.setPrompt(prefix);
   this.prompt();
  }).on('close', function() {
  });
  rl.setPrompt(prefix);
  rl.prompt();

  // t = await clientTest.startServer(serverDirectory);
  //
  // var r2 = readline.createInterface(process.stdin, process.stdout);
  // r2.on('line',async function(line){
  //   var po = line.split(' ');
  //   var test;
  //   switch(parseInt(po[2])){
  //     case 1:
  //     test = {textDocument: {uri : "file:///G:/Repos/server/repodriller_num_commits/src/main/java/org/repodriller/filter/range/Commits.java"},position :{line: parseInt(po[0]), character: parseInt(po[1])} };//{textDocument: textidentifier,position : obj}
  //     await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders',{event:{added:[{uri:"file:///G:/Repos/server/repodriller_num_commits",name:"num_commits"}],removed:[{uri:"file:///G:/Repos/server/repodriller_master",name:"master"}]}});
  //     break;
  //     case 2:
  //     test = {textDocument: {uri : "file:///G:/Repos/server/repodriller_master/src/main/java/org/repodriller/RepositoryMining.java"},position :{line: parseInt(po[0]), character: parseInt(po[1])} };//{textDocument: textidentifier,position : obj}
  //     await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders',{event:{removed:[{uri:"file:///G:/Repos/server/repodriller_num_commits",name:"num_commits"}],added:[{uri:"file:///G:/Repos/server/repodriller_master",name:"master"}]}});
  //     break;
  //   }
  //   const def = await t.connection.gotoDefinition(test);
  //   console.log("test is: ");
  //   console.log(test);
  //   console.log("result is ");
  //   console.log(def);
  //   r2.setPrompt("Enter line and char>");
  //   r2.prompt();
  // });
  // r2.setPrompt("Enter line and char>");
  // r2.prompt();
  //console.log(os.tmpdir());
  //console.log(__dirname);

}

function runShellBlob(repo,branch){
  var platform = os.platform();
  if(platform=="linux" || platform =="darwin"){
    var text = '\'console.log("'+workingDirectory+'");console.log("'+serverDirectory+'");console.log("'+repo+'");console.log("'+branch+'");\'';
    var command = "echo "+text+" > "+"argShellBlob.js";
    shell.exec(command);
    shell.exec('chmod +x runShellBlobLinux.sh');
    shell.exec('./runShellBlobLinux.sh');
  }else if(platform=="win32"){
    var text = 'console.log("'+workingDirectory+'");console.log("'+serverDirectory+'");console.log("'+repo+'");console.log("'+branch+'");';
    var command = "echo "+text+" > "+"argShellBlob.js";
    //console.log(command);
    shell.exec(command);
    shell.exec('chmod +x runShellBlob.sh');
    shell.exec('sh runShellBlob.sh');
  }

}

function runShellPull(repo,branch1,branch2){
  var platform = os.platform();
  if(platform=="linux" || platform =="darwin"){
    var text = '\'console.log("'+workingDirectory+'");console.log("'+serverDirectory+'");console.log("'+repo+'");console.log("'+branch1+'");'+'console.log("'+branch2+'");\'';
    var command = "echo "+text+" > "+"argShellPull.js";
    shell.exec(command);
    shell.exec('chmod +x runShellPullLinux.sh');
    shell.exec('./runShellPullLinux.sh');
  }else if(platform=="win32"){
    var text = 'console.log("'+workingDirectory+'");console.log("'+serverDirectory+'");console.log("'+repo+'");console.log("'+branch1+'");'+'console.log("'+branch2+'");';
    var command = "echo "+text+" > "+"argShellPull.js";
    shell.exec(command);
    shell.exec('chmod +x runShellPull.sh');
    shell.exec('sh runShellPull.sh');
  }
}

p();
