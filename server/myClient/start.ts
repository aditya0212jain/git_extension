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
import {myClient,globalFilePath,pathToUri} from './myclient'

const shell = require('shelljs');
const clientTest = new myClient();
var t;
// const textidentifier = {uri : "file:///G:/lsp/myServerSide/myClient/repodriller/src/main/java/org/repodriller/RepositoryMining.java"};
// const positionTest = {line :13,character:10};
//console.log(textidentifier);
//console.log(positionTest);
//const testTextPosition = {textDocument: textidentifier,position:positionTest};
//console.log(testTextPosition);

 async function handleRequest(obj){
   return new Promise(async (resolve,reject)=>{
    if(obj.method == "blob"){
      console.log("blob request");
      runShellBlob(obj.repo,obj.branch);
      t = await clientTest.startServer(globalFilePath);
      resolve();
    }else if(obj.method == "pull"){
      console.log("pull request");
      runShellPull(obj.repo,obj.branchBase,obj.branchHead);
      t = await clientTest.startServer(globalFilePath);
      resolve();
    }else if(obj.method =="query"){
      console.log("query request");
      var resultForQuery = await handleQuery(obj.query);
      console.log("the returning value of result:")
      console.log(resultForQuery);
      resolve(resultForQuery);
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
    console.log(obj);
    var test = {textDocument: {uri : pathToUri(globalFilePath)+"/"+obj.textDocument},position : obj.position};//{textDocument: textidentifier,position : obj}
    const def = await t.connection.gotoDefinition(test);
    console.log("ANSWER BELOW");
    //console.log(test)
    console.log(def[0]);
    return JSON.stringify(def[0]);
  }
  catch(e){
    console.log(e);
  }
}

async function p(){
var startServerPath = globalFilePath;
//t= await clientTest.startServer(startServerPath); //F:\semester 3\COL106 Data structure\p1\assign1   G:\lsp\myServerSide\myClient
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
  var answer =await handleRequest(obj);
  console.log("obj below");
  console.log(obj);
  response.statusCode = 200;
  response.setHeader('Content-Type', 'application/json');
  if(obj.method=="query"){
    response.write(answer);
  }else{
    response.write(obj.method);
  }
  response.end();

});
}).listen(8080); //the server object listens on port 8080






console.log("trying another language server")
//var chp = clientTest.spawnServer(['']);
console.log("successful");

}

function runShellBlob(repo,branch){
  var workingDir;
  var serverDir;
  var platform = os.platform();
  if(platform=="linux" || platform =="darwin"){
    shell.exec('./runShellBlob.sh');
  }else if(platform=="win32"){
    var text = 'console.log("G:/Repos/working");console.log("G:/Repos/server");console.log("'+repo+'");console.log("'+branch+'");';
    var command = "echo "+text+" > "+"argShellBlob.js";
    console.log(command);
    shell.exec(command);
    shell.exec('sh runShellBlob.sh');
  }

}

function runShellPull(repo,branch1,branch2){
  var workingDir;
  var serverDir;
  var platform = os.platform();
  var text = 'console.log("G:/Repos/working");console.log("G:/Repos/server");console.log("'+repo+'");console.log("'+branch1+'");'+'console.log("'+branch2+'");';
  var command = "echo "+text+" > "+"argShellPull.js";
  console.log(command);
  shell.exec(command);
  if(platform=="linux" || platform =="darwin"){
    shell.exec('./runShellPull.sh');
  }else if(platform=="win32"){
    shell.exec('sh runShellPull.sh');
  }
}

p();
