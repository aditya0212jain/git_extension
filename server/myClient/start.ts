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
const { performance } = require('perf_hooks');
import {runShellBlob,runShellPull} from './shellFunctions';
//import {handleRequestPull,handleRequestBlob,handleRequestQuery} from './localRequestHandlers';

const shell = require('shelljs');
var clientTest;
clientTest =  new myClient();
export declare var t;
export declare var globalRepo;
export declare var globalBranch;
export declare var globalBranchBase;
export declare var globalBranchHead;
export declare var serverDirectory;
serverDirectory = path.join(__dirname,'serverRepos');
export declare var serverBusy ;
serverBusy = false;
export declare var forReference;
forReference = false;
serverDirectory = serverDirectory.replace(/\\/g,'/');
export declare var workingDirectory;
workingDirectory= path.join(__dirname,'serverWorking');
workingDirectory = workingDirectory.replace(/\\/g,'/');
export declare var globalCurrentWorkspace;
export declare var ReposInServer ;
ReposInServer = [];
var localServerExtensionPort = 8080;
const fs = require('fs');


export async function handleRequestBlob(obj){
  var forReferenceObj= false;
  forReferenceObj= forReference;
  globalRepo = obj.repo;
  globalBranch = obj.branch;
  if(globalCurrentWorkspace!=globalRepo+"_"+globalBranch){
    if(globalCurrentWorkspace){
      await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders',{event:{added:[{uri:pathToUri(serverDirectory)+"/"+globalRepo+"_"+globalBranch,name:globalRepo+"_"+globalBranch}],removed:[{uri:pathToUri(serverDirectory)+"/"+globalCurrentWorkspace,name:globalCurrentWorkspace}]}});
    }else{
      await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders',{event:{added:[{uri:pathToUri(serverDirectory)+"/"+globalRepo+"_"+globalBranch,name:globalRepo+"_"+globalBranch}],removed:[]}});
    }
    globalCurrentWorkspace=globalRepo+"_"+globalBranch;
    console.log("setting gcW as: "+globalCurrentWorkspace);
  }
  //start the server again if the repo is not in the serverRepos directory
  if(ReposInServer.indexOf(obj.repo+"_"+obj.branch)==-1){
    if (!fs.existsSync(workingDirectory+"/"+obj.repo)) {
      console.log("directory does not exists");
      console.log("first clone it using the extension");
      return {method:"repoNotInServerWorking"};
    }else{
      var t0 = performance.now();
      runShellBlob(obj.repo,obj.branch);
      var t1 = performance.now();
      console.log("time in running the script is: "+(t1-t0));
      //console.log("time in running blob script is: "+(Date.getTime()-t0) );
      //console.log("before the if serverBusy: "+serverBusy);
      //console.log("serverBusy: "+serverBusy);
      if(!serverBusy){
        serverBusy = true;
        //console.log("forReference: "+forReference);
          t0 = performance.now();
          t = await clientTest.startServer(serverDirectory);
          console.log("time in starting the server : "+(performance.now()-t0));
        serverBusy = false;
      }
      if (fs.existsSync(serverDirectory+"/"+obj.repo+"_"+obj.branch)) {
        console.log("directory now exists");
        ReposInServer.push(obj.repo+"_"+obj.branch);
      }
    }
  }
  forReference = false;
  var t0 = performance.now();
  var testR = {textDocument: {uri : pathToUri(serverDirectory)+"/"+obj.repo+"_"+obj.branch},position : {line:0,character:0}};//{textDocument: textidentifier,position : obj}
  const defR = await t.connection.gotoDefinition(testR);
  console.log("time in checking empty def: "+(performance.now()-t0));
  return {method:"serverStarted",forReference:forReferenceObj};
}

export async function handleRequestPull(obj){
  globalRepo = obj.repo;
  globalBranchHead = obj.branchHead;
  globalBranchBase = obj.branchBase;
  if(ReposInServer.indexOf(globalRepo+"_"+globalBranchBase)==-1||ReposInServer.indexOf(globalRepo+"_"+globalBranchHead)==-1){
    if (!fs.existsSync(workingDirectory+"/"+obj.repo)) {
      console.log("directory does not exists");
      console.log("first clone it using the extension");
      return {method:"repoNotInServerWorking"};
    }
    else{
      if (!fs.existsSync(serverDirectory+"/"+obj.repo+"_"+obj.branchHead)) {
        //console.log("directory now exists");
        ReposInServer.push(obj.repo+"_"+obj.branchHead);
      }
      if (!fs.existsSync(serverDirectory+"/"+obj.repo+"_"+obj.branchBase)) {
        //console.log("directory now exists");
        ReposInServer.push(obj.repo+"_"+obj.branchBase);
      }
      runShellPull(obj.repo,obj.branchBase,obj.branchHead);
      if(!serverBusy){
        serverBusy = true;
        if(!forReference){
          t = await clientTest.startServer(serverDirectory);
        }
        serverBusy = false;
      }
    }
  }
  if(globalCurrentWorkspace){
    await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders',{event:{added:[{uri:pathToUri(serverDirectory)+"/"+globalRepo+"_"+globalBranchHead,name:globalRepo+"_"+globalBranchHead}],removed:[{uri:pathToUri(serverDirectory)+"/"+globalCurrentWorkspace,name:globalCurrentWorkspace}]}});
  }
  else{
    await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders',{event:{added:[{uri:pathToUri(serverDirectory)+"/"+globalRepo+"_"+globalBranchHead,name:globalRepo+"_"+globalBranchHead}],removed:[]}});
  }
  forReference = false;
  globalCurrentWorkspace = globalRepo+"_"+globalBranchHead;
  console.log("setting gcW as: "+globalCurrentWorkspace);
  //await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders',{event:{removed:[],added:[{uri:pathToUri(serverDirectory)+"/"+globalRepo+"_"+globalBranchBase,name:globalBranchBase},{uri:pathToUri(serverDirectory)+"/"+globalRepo+"_"+globalBranchHead,name:globalBranchHead}]}});
  var t0 = performance.now();
  var testR = {textDocument: {uri : pathToUri(serverDirectory)+"/"+obj.repo+"_"+obj.branchHead},position : {line:0,character:0}};//{textDocument: textidentifier,position : obj}
  //console.log(testR);
  const defR = await t.connection.gotoDefinition(testR);
  console.log("time in check: "+(performance.now()-t0));
  return {method:"serverStarted"};
}

export async function handleRequestQuery(obj){
  if(ReposInServer.indexOf(obj.repo+"_"+obj.branch)!=-1){
    try{
      if(globalCurrentWorkspace!=obj.repo+'_'+obj.branch){
        if(globalCurrentWorkspace){
          await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders',{event:{added:[{uri:pathToUri(serverDirectory)+"/"+obj.repo+"_"+obj.branch,name:obj.repo+"_"+obj.branch}],removed:[{uri:pathToUri(serverDirectory)+"/"+globalCurrentWorkspace,name:globalCurrentWorkspace}]}});
        }else{
          await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders',{event:{added:[{uri:pathToUri(serverDirectory)+"/"+obj.repo+"_"+obj.branch,name:obj.repo+"_"+obj.branch}],removed:[]}});
        }
        var point = new Promise((resolve,reject)=>{setTimeout(function(){resolve()},2500);});
        await point.then(()=>{});

        globalCurrentWorkspace=obj.repo+'_'+obj.branch;
        console.log("setting gcW as: "+globalCurrentWorkspace);
      }
      // }
    }catch(e){
      console.log(e);
    }
    var resultForQuery = await solveQuery(obj.query);
    // console.log("the result is: ");
    // console.log(resultForQuery);
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
      returningObject = {method:obj.type,query:obj.query,definition:resultForQuery,same:same,repo:obj.repo,branch:obj.branch}
    }
    else if (obj.type=="pull"){
      returningObject = {method:obj.type,query:obj.query,definition:resultForQuery,branchType:obj.branchType,same:same,repo:obj.repo};
    }
    return returningObject;
  }else if(!fs.existsSync(workingDirectory+"/"+obj.repo)){
    return {method:"repoNotInServerWorkingQuery"};
  }else{
    return {method:"reloadToStart"};
  }
}

export async function handleRequestGitClone(obj){
  if(!fs.existsSync(workingDirectory)){
    shell.exec("mkdir "+'serverWorking');
  }
  if (fs.existsSync(workingDirectory+"/"+obj.repo)) {
    shell.exec("rm -r -f "+workingDirectory+"/"+obj.repo);
    shell.exec("echo 'removed the older repo ,now cloning new'");
    shell.exec("cd "+workingDirectory+" && "+"git clone "+obj.url+" && echo 'done cloning'");
    //console.log("checking sync");
    return {method:"gitCloneResponse",type:"updated"};
  }else{
    shell.exec("cd "+workingDirectory+" && "+"git clone "+obj.url+" && echo 'done cloning'");
    //console.log("checking sync");
    return {method:"gitCloneResponse",type:"new"};
  }
}

async function handleRequest(obj){
   return new Promise(async (resolve,reject)=>{
    if(obj.method == "blob"){
      var ansblob = await handleRequestBlob(obj);
      resolve(JSON.stringify(ansblob));
    }else if(obj.method == "pull"){
      var ansPull = await handleRequestPull(obj);
      resolve(JSON.stringify(ansPull));
    }else if(obj.method =="query"){
      var returningObject = await handleRequestQuery(obj);
      //console.log("the returningObject is :");
      //console.log(returningObject);
      resolve(JSON.stringify(returningObject));
    }else if(obj.method =="startServer"){
      console.log("startServer request");
      resolve();
    }else if(obj.method=="closeServer"){
      console.log("closeServer request");
      resolve();
    }else if(obj.method=="gitClone"){
      var ans = await handleRequestGitClone(obj);
      //console.log("answer for gitCloneRequest:");
      //console.log(ans);
      resolve(JSON.stringify(ans));
    }
  })
}

export async function solveQuery(obj){
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

async function consoleCommands(){
  console.log("c to clear temp files");
  console.log("r to start server");
  var rl = readline.createInterface(process.stdin, process.stdout);
  var prefix = '>';
  rl.on('line',async function(line) {
    switch(line.trim()){
      case 'c'://command to clean the temp file(serverRepos and other temp files of server)
      shell.exec("rm -r -f "+serverDirectory+"/*");
      shell.exec("rm -r -f ./server_0.9/.metadata");
      shell.exec("rm -r -f ./server_0.9/jdt.ls-java-project");
      ReposInServer = [];
      console.log("done");
      break;
      case 'r'://command to run the server
      t = await clientTest.startServer(serverDirectory);
      fs.readdirSync(serverDirectory).forEach(file => {
        ReposInServer.push(file);//reading the repos already in the serverRepos directory
      });
      //this.close();//closing the prompt after starting the server
      break;
      default:
        console.log("wrong input");

    }
    this.setPrompt(prefix);
   this.prompt();
  }).on('close', function() {

  });
  rl.setPrompt(prefix);
  rl.prompt();
}

async function localServerStart(){
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
    if(obj.method=="query"||obj.method=="pull"||obj.method=="blob"||obj.method=="gitClone"){
      response.write(answer);
    }else{
      response.write(obj.method);
    }
    response.end();
    });
  }).listen(localServerExtensionPort); //the server object listens on port 8080
}

async function p(){
  localServerStart();
  consoleCommands();
}

p();
