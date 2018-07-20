import * as cp from 'child_process';
import * as ls from '../languageclient';
import * as rpc from 'vscode-jsonrpc';
import * as path from 'path';
// import * as Convert from '../utils';
import * as net from 'net';
import { Socket } from 'net';
import { LanguageClientConnection } from '../languageclient';
import {EventEmitter} from 'events';
import * as stream from 'stream';
import * as readline from 'readline';
import * as os from 'os';
import {myClient,pathToUri} from './myclient'
const { performance } = require('perf_hooks');
import {runShellBlob,runShellPull} from './shellFunctions';
const fs = require('fs');

/**
*@file Manages all the connections between local server and language server
*@author Aditya Jain
*/
/**
*@module start
*/

const shell = require('shelljs');
var clientTest;
clientTest =  new myClient();
/**
* the connection
*@member t the language server connection
*/
var t;
export declare var globalRepo;
export declare var globalBranch;
export declare var globalBranchBase;
export declare var globalBranchHead;
/**
*the directory for the server repos where server will start
*@member serverDirectory
*/
export declare var serverDirectory;
serverDirectory = path.join(__dirname,'serverRepos');
serverDirectory = serverDirectory.replace(/\\/g,'/');
/**
*variable for checking if server is busy
*@member serverBusy
*/
export declare var serverBusy ;
serverBusy = false;
export declare var forReference;
forReference = false;

export declare var workingDirectory;
workingDirectory= path.join(__dirname,'serverWorking');
workingDirectory = workingDirectory.replace(/\\/g,'/');
/**
*the workspace on which the server is currently running
*@member globalCurrentWorkspace
*/
export declare var globalCurrentWorkspace;
/**
*the repos which are in serverRepos directory
*@member ReposInServer
*/
export declare var ReposInServer ;
ReposInServer = [];
var localServerExtensionPort = 8080;

/**
*Handler function for blob page load request
*@function
*@async
*@param {Object} obj the request object
*@return serverStarted or repoNotInServerWorking objects
*/
async function handleRequestBlob(obj){
  var forReferenceObj= false;
  forReferenceObj= forReference;
  globalRepo = obj.repo;
  globalBranch = obj.branch;
  //Check the current workspace and update it if needed
  if(globalCurrentWorkspace!=obj.author+"@"+globalRepo+"_"+globalBranch){
    if(globalCurrentWorkspace){
      await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders',{event:{added:[{uri:pathToUri(serverDirectory)+"/"+obj.author+"@"+globalRepo+"_"+globalBranch,name:obj.author+"@"+globalRepo+"_"+globalBranch}],removed:[{uri:pathToUri(serverDirectory)+"/"+globalCurrentWorkspace,name:globalCurrentWorkspace}]}});
      var point = new Promise((resolve,reject)=>{setTimeout(function(){resolve()},2500);});
      await point.then(()=>{});
    }else{
      await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders',{event:{added:[{uri:pathToUri(serverDirectory)+"/"+obj.author+"@"+globalRepo+"_"+globalBranch,name:obj.author+"@"+globalRepo+"_"+globalBranch}],removed:[]}});
    }
    globalCurrentWorkspace=obj.author+"@"+globalRepo+"_"+globalBranch;
    console.log("setting gcW as: "+globalCurrentWorkspace);
  }
  //start the server again if the repo is not in the serverRepos directory
  if(ReposInServer.indexOf(obj.author+"@"+obj.repo+"_"+obj.branch)==-1){
    if (!fs.existsSync(workingDirectory+"/"+obj.author+"@"+obj.repo)) {
      console.log("directory does not exists");
      console.log("first clone it using the extension");
      return {method:"repoNotInServerWorking"};
    }else{
      runShellBlob(obj.repo,obj.branch,obj.author);
      if(!serverBusy){
        serverBusy = true;
        //console.log("forReference: "+forReference);
          t = await clientTest.startServer(serverDirectory);
        serverBusy = false;
      }
      if (fs.existsSync(serverDirectory+"/"+obj.author+"@"+obj.repo+"_"+obj.branch)) {
        console.log("directory now exists");
        ReposInServer.push(obj.author+"@"+obj.repo+"_"+obj.branch);
      }
    }
  }
  forReference = false;
  var t0 = performance.now();
  var testR = {textDocument: {uri : pathToUri(serverDirectory)+"/"+obj.author+"@"+obj.repo+"_"+obj.branch},position : {line:0,character:0}};//{textDocument: textidentifier,position : obj}
  const defR = await t.connection.gotoDefinition(testR);
  console.log("time in checking empty def: "+(performance.now()-t0));
  return {method:"serverStarted",forReference:forReferenceObj};
}

/**
*Handler function for pull page load request
*@function
*@async
*@param {Object} obj the request object
*@return serverStarted or repoNotInServerWorking objects
*/
async function handleRequestPull(obj){
  globalRepo = obj.repo;
  globalBranchHead = obj.branchHead;
  globalBranchBase = obj.branchBase;
  if(ReposInServer.indexOf(obj.author+"@"+globalRepo+"_"+globalBranchBase)==-1||ReposInServer.indexOf(obj.author2+"@"+globalRepo+"_"+globalBranchHead)==-1){
    if ((!fs.existsSync(workingDirectory+"/"+obj.author+"@"+obj.repo))||(!fs.existsSync(workingDirectory+"/"+obj.author2+"@"+obj.repo))) {
      console.log("directory does not exists");
      console.log("first clone it using the extension");
      return {method:"repoNotInServerWorking"};
    }
    else{
      if (!fs.existsSync(serverDirectory+"/"+obj.author2+"@"+obj.repo+"_"+obj.branchHead)) {
        ReposInServer.push(obj.author2+"@"+obj.repo+"_"+obj.branchHead);
      }
      if (!fs.existsSync(serverDirectory+"/"+obj.author+"@"+obj.repo+"_"+obj.branchBase)) {
        ReposInServer.push(obj.author+"@"+obj.repo+"_"+obj.branchBase);
      }
      runShellPull(obj.repo,obj.branchBase,obj.branchHead,obj.author);
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
    await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders',{event:{added:[{uri:pathToUri(serverDirectory)+"/"+obj.author2+"@"+globalRepo+"_"+globalBranchHead,name:obj.author2+"@"+globalRepo+"_"+globalBranchHead}],removed:[{uri:pathToUri(serverDirectory)+"/"+globalCurrentWorkspace,name:globalCurrentWorkspace}]}});
  }
  else{
    await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders',{event:{added:[{uri:pathToUri(serverDirectory)+"/"+obj.author2+"@"+globalRepo+"_"+globalBranchHead,name:obj.author2+"@"+globalRepo+"_"+globalBranchHead}],removed:[]}});
  }
  forReference = false;
  globalCurrentWorkspace = obj.author2+"@"+globalRepo+"_"+globalBranchHead;
  console.log("setting gcW as: "+globalCurrentWorkspace);
  //await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders',{event:{removed:[],added:[{uri:pathToUri(serverDirectory)+"/"+globalRepo+"_"+globalBranchBase,name:globalBranchBase},{uri:pathToUri(serverDirectory)+"/"+globalRepo+"_"+globalBranchHead,name:globalBranchHead}]}});
  var t0 = performance.now();
  var testR = {textDocument: {uri : pathToUri(serverDirectory)+"/"+obj.author2+"@"+obj.repo+"_"+obj.branchHead},position : {line:0,character:0}};//{textDocument: textidentifier,position : obj}
  const defR = await t.connection.gotoDefinition(testR);
  console.log("time in check: "+(performance.now()-t0));
  return {method:"serverStarted"};
}

/**
*Handler function for query from the local server
*@function
*@async
*@param {Object} obj the request object
*@return the result of required notification objects
*/
async function handleRequestQuery(obj){
  console.log(obj);
  if(ReposInServer.indexOf(obj.author+"@"+obj.repo+"_"+obj.branch)!=-1){
    try{
      if(globalCurrentWorkspace!=obj.author+"@"+obj.repo+'_'+obj.branch){
        if(globalCurrentWorkspace){
          await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders',{event:{added:[{uri:pathToUri(serverDirectory)+"/"+obj.author+"@"+obj.repo+"_"+obj.branch,name:obj.author+"@"+obj.repo+"_"+obj.branch}],removed:[{uri:pathToUri(serverDirectory)+"/"+globalCurrentWorkspace,name:globalCurrentWorkspace}]}});
        }else{
          await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders',{event:{added:[{uri:pathToUri(serverDirectory)+"/"+obj.author+"@"+obj.repo+"_"+obj.branch,name:obj.author+"@"+obj.repo+"_"+obj.branch}],removed:[]}});
        }
        var point = new Promise((resolve,reject)=>{setTimeout(function(){resolve()},2500);});
        await point.then(()=>{});

        globalCurrentWorkspace=obj.author+"@"+obj.repo+'_'+obj.branch;
        console.log("setting gcW as: "+globalCurrentWorkspace);
      }
      // }
    }catch(e){
      console.log(e);
    }
    var resultForQuery = await solveQuery(obj.query);
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
      returningObject = {method:obj.type,query:obj.query,definition:resultForQuery,same:same,repo:obj.repo,branch:obj.branch,author:obj.author}
    }
    else if (obj.type=="pull"){
      returningObject = {method:obj.type,query:obj.query,definition:resultForQuery,branchType:obj.branchType,same:same,repo:obj.repo,author:obj.author};
    }
    return returningObject;
  }else if(!fs.existsSync(workingDirectory+"/"+obj.author+"@"+obj.repo)){
    return {method:"repoNotInServerWorkingQuery"};
  }else{
    return {method:"reloadToStart"};
  }
}

/**
*Handler function for gitClone requests
*@function
*@async
*@param {Object} obj the request object
*@return {Object} after cloning sends the gitCloneResponse object
*/
async function handleRequestGitClone(obj){
  if(!fs.existsSync(workingDirectory)){
    shell.exec("mkdir "+'serverWorking');
  }
  if (fs.existsSync(workingDirectory+"/"+obj.author+"@"+obj.repo)) {
    shell.exec("rm -r -f "+workingDirectory+"/"+obj.author+"@"+obj.repo);
    shell.exec("echo 'removed the older repo ,now cloning new'");
    shell.exec("cd "+workingDirectory+" && "+"git clone "+obj.url+" && echo 'done cloning'");
    shell.exec("mv "+workingDirectory+"/"+obj.repo+" "+workingDirectory+"/"+obj.author+"@"+obj.repo);
    //console.log("checking sync");
    return {method:"gitCloneResponse",type:"updated"};
  }else{
    shell.exec("cd "+workingDirectory+" && "+"git clone "+obj.url+" && echo 'done cloning'");
    shell.exec("mv "+workingDirectory+"/"+obj.repo+" "+workingDirectory+"/"+obj.author+"@"+obj.repo);
    //console.log("checking sync");
    return {method:"gitCloneResponse",type:"new"};
  }
}

/**
*The request handler function for the local server
*@function
*@async
*@param {Object} obj the request from the extension
*@return the answer objects for different requests
*/
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

/**
*The function for sending the query to the language server and getting the definition
*@function
*@async
*@param {Object} obj the query object
*@return {Object} the definition object
*/
async function solveQuery(obj){
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

/**
*The function managing the console commands
*@function
*@async
*/
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

/**
*Starts the local server and listens to it at port 8080
*@function
*@async
*/
async function localServerStart(){
  var http = require('http');
  //creating server
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
    //getting the request as an JSON obj
    var obj = JSON.parse(result);
    // console.log("obj below");
    // console.log(obj);
    /**
    *sending the request to the handler and waiting for result
    */
    var answer =await handleRequest(obj);
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/json');

    //writing the response for the request
    if(obj.method=="query"||obj.method=="pull"||obj.method=="blob"||obj.method=="gitClone"){
      response.write(answer);
    }else{
      response.write(obj.method);
    }
    response.end();
    });
  }).listen(localServerExtensionPort); //the server object listens on port 8080
}

/**
*The entering function of the start file
*@function
*@async
*/
async function p(){
  localServerStart();
  consoleCommands();
}

p();
