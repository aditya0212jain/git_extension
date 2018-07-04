"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const myclient_1 = require("./myclient");
const shell = require('shelljs');
const clientTest = new myclient_1.myClient();
var t;
var globalRepo;
var globalBranch;
var globalBranchBase;
var globalBranchHead;
var serverDirectory = "G:/Repos/server";
var workingDirectory = "G:/Repos/working";
var globalCurrentWorkspace;
// const textidentifier = {uri : "file:///G:/lsp/myServerSide/myClient/repodriller/src/main/java/org/repodriller/RepositoryMining.java"};
// const positionTest = {line :13,character:10};
//console.log(textidentifier);
//console.log(positionTest);
//const testTextPosition = {textDocument: textidentifier,position:positionTest};
//console.log(testTextPosition);
async function handleRequest(obj) {
    return new Promise(async (resolve, reject) => {
        if (obj.method == "blob") {
            console.log("blob request");
            runShellBlob(obj.repo, obj.branch);
            globalRepo = obj.repo;
            globalBranch = obj.branch;
            t = await clientTest.startServer(serverDirectory);
            resolve();
        }
        else if (obj.method == "pull") {
            console.log("pull request");
            runShellPull(obj.repo, obj.branchBase, obj.branchHead);
            globalRepo = obj.repo;
            globalBranchHead = obj.branchHead;
            globalBranchBase = obj.branchBase;
            t = await clientTest.startServer(serverDirectory);
            console.log("Check if it works now");
            //t.connection._rpc.onRequest('workspace/workspaceFolders',(value)=>{console.log("on request of server");console.log(value)});
            resolve();
        }
        else if (obj.method == "query") {
            //console.log("query request");
            try {
                if (obj.type == "pull") {
                    if (obj.branchType == "head") {
                        if (globalCurrentWorkspace != globalRepo + "_" + globalBranchHead) {
                            t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders', { event: { added: [{ uri: myclient_1.pathToUri(serverDirectory) + "/" + globalRepo + "_" + globalBranchHead, name: globalBranchHead }], removed: [{ uri: myclient_1.pathToUri(serverDirectory) + "/" + globalRepo + "_" + globalBranchBase, name: globalBranchBase }] } });
                            console.log("inside the head part");
                            globalCurrentWorkspace = globalRepo + "_" + globalBranchHead;
                        }
                    }
                    else {
                        if (globalCurrentWorkspace != globalRepo + "_" + globalBranchBase) {
                            t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders', { event: { removed: [{ uri: myclient_1.pathToUri(serverDirectory) + "/" + globalRepo + "_" + globalBranchHead, name: globalBranchHead }], added: [{ uri: myclient_1.pathToUri(serverDirectory) + "/" + globalRepo + "_" + globalBranchBase, name: globalBranchBase }] } });
                            globalCurrentWorkspace == globalRepo + "_" + globalBranchBase;
                        }
                    }
                }
            }
            catch (e) {
                console.log(e);
            }
            var resultForQuery = await handleQuery(obj.query);
            // console.log("the query is");
            // console.log(obj);
            console.log("result of query:");
            console.log(resultForQuery);
            var returningObject;
            var same = false;
            if (resultForQuery != undefined || resultForQuery != null) {
                if (resultForQuery.uri == myclient_1.pathToUri(serverDirectory) + "/" + obj.query.textDocument) {
                    same = true;
                }
            }
            if (obj.type == "blob") {
                returningObject = { method: obj.type, query: obj.query, definition: resultForQuery, same: same, repo: globalRepo, branch: globalBranch };
            }
            else if (obj.type == "pull") {
                returningObject = { method: obj.type, query: obj.query, definition: resultForQuery, branchType: obj.branchType, same: same, repo: globalRepo };
            }
            resolve(JSON.stringify(returningObject));
        }
        else if (obj.method == "startServer") {
            console.log("startServer request");
            resolve();
        }
        else if (obj.method == "closeServer") {
            console.log("closeServer request");
            resolve();
        }
    });
}
async function handleQuery(obj) {
    try {
        //console.log(obj);
        var test = { textDocument: { uri: myclient_1.pathToUri(serverDirectory) + "/" + obj.textDocument }, position: obj.position }; //{textDocument: textidentifier,position : obj}
        const def = await t.connection.gotoDefinition(test);
        //console.log("ANSWER BELOW");
        //console.log(test)
        //console.log(def);
        if (def != null || def != undefined) {
            return def[0];
        }
    }
    catch (e) {
        console.log(e);
    }
}
async function p() {
    var startServerPath = serverDirectory;
    //t= await clientTest.startServer(startServerPath); //F:\semester 3\COL106 Data structure\p1\assign1   G:\lsp\myServerSide\myClient
    var http = require('http');
    http.createServer(async function (request, response) {
        var body = [];
        request.on('error', (err) => {
            console.error(err);
        }).on('data', (chunk) => {
            body.push(chunk);
        }).on('end', async () => {
            var result = Buffer.concat(body).toString();
            // BEGINNING OF NEW STUFF
            response.on('error', (err) => {
                console.error(err);
            });
            var obj = JSON.parse(result);
            var answer = await handleRequest(obj);
            console.log("obj below");
            console.log(obj);
            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            if (obj.method == "query") {
                response.write(answer);
            }
            else {
                response.write(obj.method);
            }
            response.end();
        });
    }).listen(8080); //the server object listens on port 8080
    console.log("trying another language server");
    //var chp = clientTest.spawnServer(['']);
    console.log("successful");
    // var rl = readline.createInterface(process.stdin, process.stdout);
    // var whichDir=0;// 1 for w and 2 for s
    // var prefix = 'Enter w for working and s for server> ';
    // var afterPrefix ='>';
    // rl.on('line', function(line) {
    //   switch(line.trim()) {
    //     case 'hello':
    //     console.log('world!');
    //     break;
    //     case 'w':
    //     afterPrefix ='Enter working Directory or b for back>';
    //     whichDir = 1;
    //     break;
    //     case 's':
    //     afterPrefix ='Enter server Directory or b for back>';
    //     whichDir = 2;
    //     break;
    //     case 'b':
    //     afterPrefix = "Enter w for working and s for server>";
    //     whichDir = 0;
    //     break;
    //     default:
    //     afterPrefix = "Enter w for working and s for server>";
    //     if(whichDir==1){
    //       workingDirectory = line;
    //       whichDir = 0;
    //     }
    //     else if(whichDir==2) {
    //       serverDirectory = line;
    //       whichDir =0;
    //     }else{
    //       console.log('Say what? I might have heard `' + line.trim() + '`');
    //     }
    //     break;
    //   }
    //   rl.setPrompt(afterPrefix);
    //   rl.prompt();
    // }).on('close', function() {
    //   console.log('Have a great day!');
    //   process.exit(0);
    // });
    // console.log(prefix + 'Good to see you. Try typing stuff.');
    // rl.setPrompt(prefix);
    // rl.prompt();
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
    //     test = {textDocument: {uri : "file:///G:/Repos/server/repodriller_master/src/main/java/org/repodriller/filter/range/Commits.java"},position :{line: parseInt(po[0]), character: parseInt(po[1])} };//{textDocument: textidentifier,position : obj}
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
}
function runShellBlob(repo, branch) {
    var platform = os.platform();
    if (platform == "linux" || platform == "darwin") {
        var text = '\'console.log("' + workingDirectory + '");console.log("' + serverDirectory + '");console.log("' + repo + '");console.log("' + branch + '");\'';
        var command = "echo " + text + " > " + "argShellBlob.js";
        shell.exec(command);
        shell.exec('chmod +x runShellBlobLinux.sh');
        shell.exec('./runShellBlobLinux.sh');
    }
    else if (platform == "win32") {
        var text = 'console.log("' + workingDirectory + '");console.log("' + serverDirectory + '");console.log("' + repo + '");console.log("' + branch + '");';
        var command = "echo " + text + " > " + "argShellBlob.js";
        shell.exec(command);
        shell.exec('chmod +x runShellBlob.sh');
        shell.exec('sh runShellBlob.sh');
    }
}
function runShellPull(repo, branch1, branch2) {
    var platform = os.platform();
    if (platform == "linux" || platform == "darwin") {
        var text = '\'console.log("' + workingDirectory + '");console.log("' + serverDirectory + '");console.log("' + repo + '");console.log("' + branch1 + '");' + 'console.log("' + branch2 + '");\'';
        var command = "echo " + text + " > " + "argShellPull.js";
        shell.exec(command);
        shell.exec('chmod +x runShellPullLinux.sh');
        shell.exec('./runShellPullLinux.sh');
    }
    else if (platform == "win32") {
        var text = 'console.log("' + workingDirectory + '");console.log("' + serverDirectory + '");console.log("' + repo + '");console.log("' + branch1 + '");' + 'console.log("' + branch2 + '");';
        var command = "echo " + text + " > " + "argShellPull.js";
        shell.exec(command);
        shell.exec('chmod +x runShellPull.sh');
        shell.exec('sh runShellPull.sh');
    }
}
p();
