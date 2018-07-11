"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const readline = require("readline");
const myclient_1 = require("./myclient");
const { performance } = require('perf_hooks');
const shellFunctions_1 = require("./shellFunctions");
//import {handleRequestPull,handleRequestBlob,handleRequestQuery} from './localRequestHandlers';
const shell = require('shelljs');
var clientTest;
clientTest = new myclient_1.myClient();
exports.serverDirectory = path.join(__dirname, 'serverRepos');
1;
exports.serverBusy = false;
exports.forReference = false;
exports.serverDirectory = exports.serverDirectory.replace(/\\/g, '/');
exports.workingDirectory = "G:/Repos/working";
exports.ReposInServer = [];
var localServerExtensionPort = 8080;
const fs = require('fs');
async function handleRequestBlob(obj) {
    exports.globalRepo = obj.repo;
    exports.globalBranch = obj.branch;
    if (exports.globalCurrentWorkspace != exports.globalRepo + "_" + exports.globalBranch) {
        if (exports.globalCurrentWorkspace) {
            await exports.t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders', { event: { added: [{ uri: myclient_1.pathToUri(exports.serverDirectory) + "/" + exports.globalRepo + "_" + exports.globalBranch, name: exports.globalRepo + "_" + exports.globalBranch }], removed: [{ uri: myclient_1.pathToUri(exports.serverDirectory) + "/" + exports.globalCurrentWorkspace, name: exports.globalCurrentWorkspace }] } });
        }
        else {
            await exports.t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders', { event: { added: [{ uri: myclient_1.pathToUri(exports.serverDirectory) + "/" + exports.globalRepo + "_" + exports.globalBranch, name: exports.globalRepo + "_" + exports.globalBranch }], removed: [] } });
        }
        exports.globalCurrentWorkspace = exports.globalRepo + "_" + exports.globalBranch;
        console.log("setting gcW as: " + exports.globalCurrentWorkspace);
    }
    //start the server again if the repo is not in the serverRepos directory
    if (exports.ReposInServer.indexOf(obj.repo + "_" + obj.branch) == -1) {
        var t0 = performance.now();
        shellFunctions_1.runShellBlob(obj.repo, obj.branch);
        var t1 = performance.now();
        console.log("time in running the script is: " + (t1 - t0));
        //console.log("time in running blob script is: "+(Date.getTime()-t0) );
        //console.log("before the if serverBusy: "+serverBusy);
        if (!exports.serverBusy) {
            exports.serverBusy = true;
            if (!exports.forReference) {
                t0 = performance.now();
                exports.t = await clientTest.startServer(exports.serverDirectory);
                console.log("time in starting the server : " + (performance.now() - t0));
            }
            exports.forReference = false;
            exports.serverBusy = false;
        }
    }
    var t0 = performance.now();
    var testR = { textDocument: { uri: myclient_1.pathToUri(exports.serverDirectory) + "/" + obj.repo + "_" + obj.branch }, position: { line: 0, character: 0 } }; //{textDocument: textidentifier,position : obj}
    const defR = await exports.t.connection.gotoDefinition(testR);
    console.log("time in checking empty def: " + (performance.now() - t0));
    exports.ReposInServer.push(obj.repo + "_" + obj.branch);
}
exports.handleRequestBlob = handleRequestBlob;
async function handleRequestPull(obj) {
    shellFunctions_1.runShellPull(obj.repo, obj.branchBase, obj.branchHead);
    exports.globalRepo = obj.repo;
    exports.globalBranchHead = obj.branchHead;
    exports.globalBranchBase = obj.branchBase;
    if (!exports.serverBusy) {
        exports.serverBusy = true;
        if (!exports.forReference) {
            exports.t = await clientTest.startServer(exports.serverDirectory);
        }
        exports.forReference = false;
        exports.serverBusy = false;
    }
    if (exports.globalCurrentWorkspace) {
        await exports.t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders', { event: { added: [{ uri: myclient_1.pathToUri(exports.serverDirectory) + "/" + exports.globalRepo + "_" + exports.globalBranchHead, name: exports.globalRepo + "_" + exports.globalBranchHead }], removed: [{ uri: myclient_1.pathToUri(exports.serverDirectory) + "/" + exports.globalCurrentWorkspace, name: exports.globalCurrentWorkspace }] } });
    }
    else {
        await exports.t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders', { event: { added: [{ uri: myclient_1.pathToUri(exports.serverDirectory) + "/" + exports.globalRepo + "_" + exports.globalBranchHead, name: exports.globalRepo + "_" + exports.globalBranchHead }], removed: [] } });
    }
    exports.globalCurrentWorkspace = exports.globalRepo + "_" + exports.globalBranchHead;
    console.log("setting gcW as: " + exports.globalCurrentWorkspace);
    //await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders',{event:{removed:[],added:[{uri:pathToUri(serverDirectory)+"/"+globalRepo+"_"+globalBranchBase,name:globalBranchBase},{uri:pathToUri(serverDirectory)+"/"+globalRepo+"_"+globalBranchHead,name:globalBranchHead}]}});
    var testR = { textDocument: { uri: myclient_1.pathToUri(exports.serverDirectory) + "/" + obj.repo + "_" + obj.branchHead }, position: { line: 0, character: 0 } }; //{textDocument: textidentifier,position : obj}
    //console.log(testR);
    const defR = await exports.t.connection.gotoDefinition(testR);
}
exports.handleRequestPull = handleRequestPull;
async function handleRequestQuery(obj) {
    try {
        if (obj.type == "pull") {
            if (obj.branchType == "head") {
                if (exports.globalCurrentWorkspace != exports.globalRepo + "_" + exports.globalBranchHead) {
                    await exports.t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders', { event: { added: [{ uri: myclient_1.pathToUri(exports.serverDirectory) + "/" + exports.globalRepo + "_" + exports.globalBranchHead, name: exports.globalRepo + "_" + exports.globalBranchHead }], removed: [{ uri: myclient_1.pathToUri(exports.serverDirectory) + "/" + exports.globalRepo + "_" + exports.globalBranchBase, name: exports.globalRepo + "_" + exports.globalBranchBase }] } });
                    exports.globalCurrentWorkspace = exports.globalRepo + "_" + exports.globalBranchHead;
                    console.log("setting gcW as: " + exports.globalCurrentWorkspace);
                }
            }
            else {
                if (exports.globalCurrentWorkspace != exports.globalRepo + "_" + exports.globalBranchBase) {
                    await exports.t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders', { event: { removed: [{ uri: myclient_1.pathToUri(exports.serverDirectory) + "/" + exports.globalRepo + "_" + exports.globalBranchHead, name: exports.globalRepo + "_" + exports.globalBranchHead }], added: [{ uri: myclient_1.pathToUri(exports.serverDirectory) + "/" + exports.globalRepo + "_" + exports.globalBranchBase, name: exports.globalRepo + "_" + exports.globalBranchBase }] } });
                    exports.globalCurrentWorkspace = exports.globalRepo + "_" + exports.globalBranchBase;
                    console.log("setting gcW as: " + exports.globalCurrentWorkspace);
                }
            }
        }
        else if (obj.type == "blob") {
            if (exports.globalCurrentWorkspace != obj.repo + '_' + obj.branch) {
                if (exports.globalCurrentWorkspace) {
                    await exports.t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders', { event: { added: [{ uri: myclient_1.pathToUri(exports.serverDirectory) + "/" + obj.repo + "_" + obj.branch, name: obj.repo + "_" + obj.branch }], removed: [{ uri: myclient_1.pathToUri(exports.serverDirectory) + "/" + exports.globalCurrentWorkspace, name: exports.globalCurrentWorkspace }] } });
                }
                else {
                    await exports.t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders', { event: { added: [{ uri: myclient_1.pathToUri(exports.serverDirectory) + "/" + obj.repo + "_" + obj.branch, name: obj.repo + "_" + obj.branch }], removed: [] } });
                }
                exports.globalCurrentWorkspace = obj.repo + '_' + obj.branch;
                console.log("setting gcW as: " + exports.globalCurrentWorkspace);
            }
        }
    }
    catch (e) {
        console.log(e);
    }
    var resultForQuery = await solveQuery(obj.query);
    // console.log("the result is: ");
    // console.log(resultForQuery);
    var returningObject;
    var same = false;
    if (resultForQuery != undefined || resultForQuery != null) {
        if (resultForQuery.uri == myclient_1.pathToUri(exports.serverDirectory) + "/" + obj.query.textDocument) {
            same = true;
        }
        else {
            exports.forReference = true;
        }
    }
    if (obj.type == "blob") {
        returningObject = { method: obj.type, query: obj.query, definition: resultForQuery, same: same, repo: obj.repo, branch: obj.branch };
    }
    else if (obj.type == "pull") {
        returningObject = { method: obj.type, query: obj.query, definition: resultForQuery, branchType: obj.branchType, same: same, repo: obj.repo };
    }
    return returningObject;
}
exports.handleRequestQuery = handleRequestQuery;
async function handleRequest(obj) {
    return new Promise(async (resolve, reject) => {
        if (obj.method == "blob") {
            await handleRequestBlob(obj);
            resolve(JSON.stringify({ method: "serverStarted" }));
        }
        else if (obj.method == "pull") {
            await handleRequestPull(obj);
            resolve(JSON.stringify({ method: "serverStarted" }));
        }
        else if (obj.method == "query") {
            var returningObject = await handleRequestQuery(obj);
            //console.log("the returningObject is :");
            //console.log(returningObject);
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
async function solveQuery(obj) {
    try {
        var test = { textDocument: { uri: myclient_1.pathToUri(exports.serverDirectory) + "/" + obj.textDocument }, position: obj.position }; //{textDocument: textidentifier,position : obj}
        const def = await exports.t.connection.gotoDefinition(test);
        if (def != null || def != undefined) {
            return def[0];
        }
    }
    catch (e) {
        console.log(e);
    }
}
exports.solveQuery = solveQuery;
async function consoleCommands() {
    console.log("w to set workingDirectory");
    console.log("c to clear temp files");
    console.log("r to start server");
    var rl = readline.createInterface(process.stdin, process.stdout);
    var whichDir = 0; // 1 for w and 2 for s
    var prefix = '>';
    rl.on('line', async function (line) {
        switch (line.trim()) {
            case 'w':
                whichDir = 1;
                prefix = "Enter working directory";
                break;
            case 'c': //command to clean the temp file(serverRepos and other temp files of server)
                whichDir = 0;
                shell.exec("rm -r -f " + exports.serverDirectory + "/*");
                shell.exec("rm -r -f ./server_0.9/.metadata");
                shell.exec("rm -r -f ./server_0.9/jdt.ls-java-project");
                exports.ReposInServer = [];
                console.log("done");
                break;
            case 'r': //command to run the server
                exports.t = await clientTest.startServer(exports.serverDirectory);
                fs.readdirSync(exports.serverDirectory).forEach(file => {
                    exports.ReposInServer.push(file); //reading the repos already in the serverRepos directory
                });
                //this.close();//closing the prompt after starting the server
                break;
            default:
                if (whichDir == 1) {
                    exports.workingDirectory = line;
                    console.log('workingDirectory set as ' + exports.workingDirectory);
                    exports.workingDirectory = exports.workingDirectory.replace(/\\/g, '/');
                    prefix = ">";
                    break;
                }
                else {
                    console.log("wrong input");
                    break;
                }
        }
        this.setPrompt(prefix);
        this.prompt();
    }).on('close', function () {
    });
    rl.setPrompt(prefix);
    rl.prompt();
}
async function localServerStart() {
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
            console.log("obj below");
            console.log(obj);
            var answer = await handleRequest(obj);
            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            if (obj.method == "query" || obj.method == "pull" || obj.method == "blob") {
                response.write(answer);
            }
            else {
                response.write(obj.method);
            }
            response.end();
        });
    }).listen(localServerExtensionPort); //the server object listens on port 8080
}
async function p() {
    localServerStart();
    consoleCommands();
}
p();
