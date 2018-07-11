"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const readline = require("readline");
const myclient_1 = require("./myclient");
const { performance } = require('perf_hooks');
const shellFunctions_1 = require("./shellFunctions");
const shell = require('shelljs');
const clientTest = new myclient_1.myClient();
var t;
var globalRepo;
var globalBranch;
var globalBranchBase;
var globalBranchHead;
exports.serverDirectory = path.join(__dirname, 'serverRepos');
var serverBusy = false;
var forReference = false;
exports.serverDirectory = exports.serverDirectory.replace(/\\/g, '/');
exports.workingDirectory = "G:/Repos/working";
var globalCurrentWorkspace;
var ReposInServer = [];
const fs = require('fs');
async function handleRequestBlob(obj) {
    globalRepo = obj.repo;
    globalBranch = obj.branch;
    if (globalCurrentWorkspace != globalRepo + "_" + globalBranch) {
        if (globalCurrentWorkspace) {
            await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders', { event: { added: [{ uri: myclient_1.pathToUri(exports.serverDirectory) + "/" + globalRepo + "_" + globalBranch, name: globalRepo + "_" + globalBranch }], removed: [{ uri: myclient_1.pathToUri(exports.serverDirectory) + "/" + globalCurrentWorkspace, name: globalCurrentWorkspace }] } });
        }
        else {
            await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders', { event: { added: [{ uri: myclient_1.pathToUri(exports.serverDirectory) + "/" + globalRepo + "_" + globalBranch, name: globalRepo + "_" + globalBranch }], removed: [] } });
        }
        globalCurrentWorkspace = globalRepo + "_" + globalBranch;
        console.log("setting gcW as: " + globalCurrentWorkspace);
    }
    if (ReposInServer.indexOf(obj.repo + "_" + obj.branch) == -1) {
        var t0 = performance.now();
        shellFunctions_1.runShellBlob(obj.repo, obj.branch);
        var t1 = performance.now();
        console.log("time in running the script is: " + (t1 - t0));
        //console.log("time in running blob script is: "+(Date.getTime()-t0) );
        globalRepo = obj.repo;
        globalBranch = obj.branch;
        //console.log("before the if serverBusy: "+serverBusy);
        if (!serverBusy) {
            serverBusy = true;
            if (!forReference) {
                t0 = performance.now();
                t = await clientTest.startServer(exports.serverDirectory);
                console.log("time in starting the server : " + (performance.now() - t0));
            }
            forReference = false;
            serverBusy = false;
        }
        //console.log("After the if serverBusy: "+serverBusy);
        if (globalCurrentWorkspace != globalRepo + "_" + globalBranch) {
            if (globalCurrentWorkspace) {
                await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders', { event: { added: [{ uri: myclient_1.pathToUri(exports.serverDirectory) + "/" + globalRepo + "_" + globalBranch, name: globalRepo + "_" + globalBranch }], removed: [{ uri: myclient_1.pathToUri(exports.serverDirectory) + "/" + globalCurrentWorkspace, name: globalCurrentWorkspace }] } });
            }
            else {
                await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders', { event: { added: [{ uri: myclient_1.pathToUri(exports.serverDirectory) + "/" + globalRepo + "_" + globalBranch, name: globalRepo + "_" + globalBranch }], removed: [] } });
            }
            globalCurrentWorkspace = globalRepo + "_" + globalBranch;
            console.log("setting gcW as: " + globalCurrentWorkspace);
        }
        t0 = performance.now();
        var testR = { textDocument: { uri: myclient_1.pathToUri(exports.serverDirectory) + "/" + obj.repo + "_" + obj.branch }, position: { line: 0, character: 0 } }; //{textDocument: textidentifier,position : obj}
        const defR = await t.connection.gotoDefinition(testR);
        console.log("time in checking empty def: " + (performance.now() - t0));
        ReposInServer.push(obj.repo + "_" + obj.branch);
    }
}
async function handleRequestPull(obj) {
    shellFunctions_1.runShellPull(obj.repo, obj.branchBase, obj.branchHead);
    globalRepo = obj.repo;
    globalBranchHead = obj.branchHead;
    globalBranchBase = obj.branchBase;
    if (!serverBusy) {
        serverBusy = true;
        if (!forReference) {
            t = await clientTest.startServer(exports.serverDirectory);
        }
        forReference = false;
        serverBusy = false;
    }
    if (globalCurrentWorkspace) {
        await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders', { event: { added: [{ uri: myclient_1.pathToUri(exports.serverDirectory) + "/" + globalRepo + "_" + globalBranchHead, name: globalRepo + "_" + globalBranchHead }], removed: [{ uri: myclient_1.pathToUri(exports.serverDirectory) + "/" + globalCurrentWorkspace, name: globalCurrentWorkspace }] } });
    }
    else {
        await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders', { event: { added: [{ uri: myclient_1.pathToUri(exports.serverDirectory) + "/" + globalRepo + "_" + globalBranchHead, name: globalRepo + "_" + globalBranchHead }], removed: [] } });
    }
    globalCurrentWorkspace = globalRepo + "_" + globalBranchHead;
    console.log("setting gcW as: " + globalCurrentWorkspace);
    //await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders',{event:{removed:[],added:[{uri:pathToUri(serverDirectory)+"/"+globalRepo+"_"+globalBranchBase,name:globalBranchBase},{uri:pathToUri(serverDirectory)+"/"+globalRepo+"_"+globalBranchHead,name:globalBranchHead}]}});
    var testR = { textDocument: { uri: myclient_1.pathToUri(exports.serverDirectory) + "/" + obj.repo + "_" + obj.branchHead }, position: { line: 0, character: 0 } }; //{textDocument: textidentifier,position : obj}
    //console.log(testR);
    const defR = await t.connection.gotoDefinition(testR);
}
async function handleRequestQuery(obj) {
    try {
        if (obj.type == "pull") {
            if (obj.branchType == "head") {
                if (globalCurrentWorkspace != globalRepo + "_" + globalBranchHead) {
                    await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders', { event: { added: [{ uri: myclient_1.pathToUri(exports.serverDirectory) + "/" + globalRepo + "_" + globalBranchHead, name: globalRepo + "_" + globalBranchHead }], removed: [{ uri: myclient_1.pathToUri(exports.serverDirectory) + "/" + globalRepo + "_" + globalBranchBase, name: globalRepo + "_" + globalBranchBase }] } });
                    globalCurrentWorkspace = globalRepo + "_" + globalBranchHead;
                    console.log("setting gcW as: " + globalCurrentWorkspace);
                }
            }
            else {
                if (globalCurrentWorkspace != globalRepo + "_" + globalBranchBase) {
                    await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders', { event: { removed: [{ uri: myclient_1.pathToUri(exports.serverDirectory) + "/" + globalRepo + "_" + globalBranchHead, name: globalRepo + "_" + globalBranchHead }], added: [{ uri: myclient_1.pathToUri(exports.serverDirectory) + "/" + globalRepo + "_" + globalBranchBase, name: globalRepo + "_" + globalBranchBase }] } });
                    globalCurrentWorkspace = globalRepo + "_" + globalBranchBase;
                    console.log("setting gcW as: " + globalCurrentWorkspace);
                }
            }
        }
        else if (obj.type == "blob") {
            if (globalCurrentWorkspace != obj.repo + '_' + obj.branch) {
                if (globalCurrentWorkspace) {
                    await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders', { event: { added: [{ uri: myclient_1.pathToUri(exports.serverDirectory) + "/" + globalRepo + "_" + globalBranch, name: globalRepo + "_" + globalBranch }], removed: [{ uri: myclient_1.pathToUri(exports.serverDirectory) + "/" + globalCurrentWorkspace, name: globalCurrentWorkspace }] } });
                }
                else {
                    await t.connection._rpc.sendNotification('workspace/didChangeWorkspaceFolders', { event: { added: [{ uri: myclient_1.pathToUri(exports.serverDirectory) + "/" + globalRepo + "_" + globalBranch, name: globalRepo + "_" + globalBranch }], removed: [] } });
                }
                globalCurrentWorkspace = obj.repo + '_' + obj.branch;
                console.log("setting gcW as: " + globalCurrentWorkspace);
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
            forReference = true;
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
            console.log("the returningObject is :");
            console.log(returningObject);
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
        const def = await t.connection.gotoDefinition(test);
        if (def != null || def != undefined) {
            return def[0];
        }
    }
    catch (e) {
        console.log(e);
    }
}
async function p() {
    localServerStart();
    consoleCommands();
}
async function consoleCommands() {
    console.log("w to set workingDirectory");
    console.log("c to clear temp files");
    console.log("r to start server");
    var rl = readline.createInterface(process.stdin, process.stdout);
    var whichDir = 0; // 1 for w and 2 for s
    var prefix = '>';
    var afterPrefix = '>';
    rl.on('line', async function (line) {
        switch (line.trim()) {
            case 'w':
                whichDir = 1;
                prefix = "Enter working directory";
                break;
            case 'c':
                whichDir = 0;
                //console.log("rm -r -f "+serverDirectory+"/*");
                shell.exec("rm -r -f " + exports.serverDirectory + "/*");
                shell.exec("rm -r -f ./server_0.9/.metadata");
                shell.exec("rm -r -f ./server_0.9/jdt.ls-java-project");
                ReposInServer = [];
                console.log("done");
                break;
            case 'r':
                t = await clientTest.startServer(exports.serverDirectory);
                //console.log("started");
                fs.readdirSync(exports.serverDirectory).forEach(file => {
                    ReposInServer.push(file);
                });
                this.close();
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
    }).listen(8080); //the server object listens on port 8080
}
p();
