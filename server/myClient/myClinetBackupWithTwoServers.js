"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cp = require("child_process");
const rpc = require("vscode-jsonrpc");
const path = require("path");
// import * as Convert from '../utils';
const net = require("net");
const languageclient_1 = require("../languageclient");
const readline = require("readline");
const os = require("os");
var globalFilePath = "G:/lsp/myServerSide/myClient";
function pathToUri(filePath) {
    let newPath = filePath.replace(/\\/g, '/');
    if (newPath[0] !== '/') {
        newPath = `/${newPath}`;
    }
    return encodeURI(`file://${newPath}`).replace(/[?#]/g, encodeURIComponent);
}
class myClient {
    constructor() {
        this.cplist = [];
        this.socketlist = [];
        this.serverlist = [];
        this.reportBusyWhile = async (title, f) => {
            this.logger.info(`[Started] ${title}`);
            let res;
            try {
                res = await f();
            }
            finally {
                this.logger.info(`[Finished] ${title}`);
            }
            return res;
        };
    }
    getInitializeParams(projectPath, process) {
        return {
            processId: process.pid,
            rootPath: projectPath,
            rootUri: pathToUri(projectPath),
            capabilities: {
                workspace: {
                    applyEdit: true,
                    workspaceEdit: {
                        documentChanges: true,
                    },
                    didChangeConfiguration: {
                        dynamicRegistration: false,
                    },
                    didChangeWatchedFiles: {
                        dynamicRegistration: false,
                    },
                    symbol: {
                        dynamicRegistration: false,
                    },
                    executeCommand: {
                        dynamicRegistration: false,
                    },
                },
                textDocument: {
                    synchronization: {
                        dynamicRegistration: false,
                        willSave: false,
                        willSaveWaitUntil: false,
                        didSave: false,
                    },
                    completion: {
                        dynamicRegistration: false,
                        completionItem: {
                            snippetSupport: false,
                            commitCharactersSupport: false,
                        },
                        contextSupport: false,
                    },
                    hover: {
                        dynamicRegistration: true,
                    },
                    signatureHelp: {
                        dynamicRegistration: false,
                    },
                    references: {
                        dynamicRegistration: false,
                    },
                    documentHighlight: {
                        dynamicRegistration: true,
                    },
                    documentSymbol: {
                        dynamicRegistration: false,
                    },
                    formatting: {
                        dynamicRegistration: false,
                    },
                    rangeFormatting: {
                        dynamicRegistration: false,
                    },
                    onTypeFormatting: {
                        dynamicRegistration: false,
                    },
                    definition: {
                        dynamicRegistration: true,
                    },
                    codeAction: {
                        dynamicRegistration: false,
                    },
                    codeLens: {
                        dynamicRegistration: false,
                    },
                    documentLink: {
                        dynamicRegistration: false,
                    },
                    rename: {
                        dynamicRegistration: false,
                    }
                },
                experimental: {},
            },
        };
    }
    tempPromise(index) {
        return new Promise((resolve, reject) => {
            resolve(this.cplist[index]);
        });
    }
    async activate() {
        //await this.spawnServerWithSocket();
        //var t = await this.startServer(globalFilePath,0);
        return new Promise(async (resolve, reject) => {
            await this.spawnServerWithSocket(1);
            //console.log(this.server.getConnections());
            resolve();
            console.log("Activate Ended");
            //this.childProcessCreator = await this.spawnServer([``]);
            //console.log("Ended for sure");
            //return t;
        });
    }
    async startServer(projectPath, indexOfServer) {
        console.log("its in");
        //await this.spawnServerWithSocket();
        //console.log("Now hajime");
        //const process = this.spawnServerWithSocket().then((result) => result );
        const process = await this.tempPromise(indexOfServer); //await this.spawnServerWithSocket();//.then((result) => { return result;});
        console.log("loaded process");
        this.captureServerErrors(process, projectPath);
        let serverHome = path.join(__dirname, 'server');
        const connection = new languageclient_1.LanguageClientConnection(this.createRpcConnection(indexOfServer));
        //console.log("made connection");
        const initializeParams = this.getInitializeParams(projectPath, process);
        //console.log("y1");
        const initialization = connection.initialize(initializeParams);
        //console.log("y2");
        const initializeResponse = await initialization;
        //console.log("y3");
        this._connection = connection;
        console.log(initializeResponse);
        //console.log(process);
        const newServer = {
            projectPath,
            process,
            connection,
            capabilities: initializeResponse.capabilities,
        };
        //console.log("y4");
        connection.initialized();
        //console.log("About to shut down");
        // var a = await newServer.connection.shutdown();
        // console.log(a);
        // connection.on('exit',() => console.log("exiting works"));
        // console.log("About to exit and dispose");
        // newServer.connection.exit();
        // newServer.connection.dispose();
        process.on('exit', () => { console.log("process exit"); });
        //newServer.process.kill();
        return newServer;
    }
    createRpcConnection(indexOfServer) {
        let reader;
        let writer;
        //console.log("r1");
        reader = new rpc.SocketMessageReader(this.socketlist[indexOfServer]);
        writer = new rpc.SocketMessageWriter(this.socketlist[indexOfServer]);
        //console.log("r2");
        return rpc.createMessageConnection(reader, writer);
    }
    async spawnServerWithSocket(index) {
        return new Promise((resolve, reject) => {
            console.log("inside spawn with socket");
            let childProcess;
            let cp2;
            this.server = net.createServer(async (socket) => {
                console.log("in server listen");
                this.socket = socket;
                //server.close();
                this.socketlist.push(socket);
                var ser = await this.startServer(globalFilePath, this.serverlist.length);
                console.log("ser complete");
                this.serverlist.push(ser);
                if (this.serverlist.length == index) {
                    resolve();
                }
            }).listen(3000);
            //childProcess = this.spawnServer([``]);
            //this.cplist.push(childProcess);
            this.childProcessCreator = this.spawnServer([``]);
            this.cplist.push(this.childProcessCreator);
            this.childProcessCreator.on('exit', exitCode => {
                if (!this.childProcessCreator.killed) {
                    console.log("childProcess exit but not killed");
                }
                //console.log("childProcess exited");
            });
            //});
            //});
            //console.log("why did it stuck :O");
        });
    }
    spawnServer(extraArgs) {
        console.log("inside spawnserver");
        const command = "java";
        const serverHome = path.join(__dirname, 'server');
        var platform = os.platform();
        var variable;
        console.log("platform: " + platform);
        if (platform == "linux") {
            variable = "linux";
        }
        else if (platform == "win32") {
            variable = "win";
        }
        else if (platform == "darwin") {
            variable = "mac";
        }
        variable = "config_" + variable;
        console.log("variable platform: " + variable);
        const args = ['-jar', 'plugins/org.eclipse.equinox.launcher_1.5.0.v20180119-0753.jar', '-configuration', variable, '-data'];
        if (extraArgs) {
            args.push(extraArgs);
        }
        //this.logger.debug(`starting "${command} ${args.join(' ')}"`)
        //console.log("about to start childprocess");
        const childProcess = cp.spawn(command, args, { cwd: serverHome });
        //console.log("returning from spawnServer");
        return childProcess;
    }
    async getDefinition(params) {
        const definitionLocation = this._connection.gotoDefinition(params);
        return definitionLocation;
    }
    captureServerErrors(childProcess, projectPath) {
        childProcess.on('error', (err) => console.log("o1"));
        childProcess.on('exit', (code, signal) => console.log("o2"));
        childProcess.stderr.setEncoding('utf8');
        childProcess.stderr.on('data', (chunk) => {
            const errorString = chunk.toString();
            console.log("o3");
        });
    }
}
console.log("Starting");
const clientTest = new myClient();
const textidentifier = { uri: "file:///G:/lsp/myServerSide/myClient/repodriller/src/main/java/org/repodriller/RepositoryMining.java" };
const positionTest = { line: 13, character: 10 };
//console.log(textidentifier);
//console.log(positionTest);
const testTextPosition = { textDocument: textidentifier, position: positionTest };
//console.log(testTextPosition);
async function p() {
    var startServerPath = globalFilePath;
    //var t = await clientTest.startServer(startServerPath,0); //F:\semester 3\COL106 Data structure\p1\assign1   G:\lsp\myServerSide\myClient
    //await clientTest.spawnServerWithSocket(1);
    await clientTest.activate();
    var t = clientTest.serverlist[0];
    var http = require('http');
    console.log("the cplist length is: " + clientTest.cplist.length);
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
            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            var resultToBrowser;
            try {
                var test = { textDocument: { uri: pathToUri(globalFilePath) + "/" + obj.textDocument }, position: obj.position }; //{textDocument: textidentifier,position : obj}
                const def = await t.connection.gotoDefinition(test);
                console.log("ANSWER BELOW");
                //console.log(test)
                console.log(def[0]);
                resultToBrowser = def;
                result = JSON.stringify(def[0]);
            }
            catch (e) {
                console.log(e);
            }
            response.write(result);
            response.end();
        });
    }).listen(8080); //the server object listens on port 8080
    console.log("trying another language server");
    //var chp = clientTest.spawnServer(['']);
    console.log("successful");
    console.log("write the line and character no. with space: ");
    var rl = readline.createInterface(process.stdin, process.stdout);
    rl.prompt();
    rl.on('line', async function (line) {
        var num = line.split(" ");
        var pos = { line: parseInt(num[0]), character: parseInt(num[1]) };
        var test = { textDocument: textidentifier, position: pos };
        try {
            console.log("Definition");
            const def = await t.connection.gotoDefinition(test);
            console.log(def[0]);
            console.log("Hover tip");
            const hoverinfo = await t.connection.hover(test);
            console.log(hoverinfo);
        }
        catch (e) {
            console.log(e);
        }
    });
}
p();