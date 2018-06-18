"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cp = require("child_process");
const rpc = require("vscode-jsonrpc");
const path = require("path");
// import * as Convert from '../utils';
const net = require("net");
const languageclient_1 = require("../languageclient");
class myClient {
    constructor() {
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
            rootUri: this.pathToUri(projectPath),
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
                        willSave: true,
                        willSaveWaitUntil: true,
                        didSave: true,
                    }
                },
                experimental: {},
            },
        };
    }
    async startServer(projectPath) {
        console.log("its in");
        //const process = this.spawnServerWithSocket().then((result) => result );
        const process = await this.spawnServerWithSocket().then((result) => { console.log("in resolve"); return result; });
        ;
        console.log("loaded process");
        //const process = this.spawnServer([`--tcp=127.0.0.1`]);
        let serverHome = path.join(__dirname, 'server');
        //const process = await async f(){ return this.startServerProcess(projectPath); }
        const connection = new languageclient_1.LanguageClientConnection(this.createRpcConnection());
        console.log("made connection");
        const initializeParams = this.getInitializeParams(projectPath, process);
        console.log("y1");
        const initialization = connection.initialize(initializeParams);
        console.log("y2");
        const initializeResponse = await initialization;
        console.log("y3");
        this._connection = connection;
        console.log(initializeResponse);
        const newServer = {
            projectPath,
            process,
            connection,
            capabilities: initializeResponse.capabilities,
        };
        console.log("y4");
        connection.initialized();
        console.log("definition inside the server start process");
        const def = await connection.gotoDefinition(testTextPosition);
        console.log(testTextPosition);
        console.log(def);
        console.log("document Highlight");
        const dochigh = await connection.documentHighlight(testTextPosition);
        console.log(dochigh);
        return newServer;
    }
    createRpcConnection() {
        let reader;
        let writer;
        //console.log(this.socket);
        console.log("r1");
        reader = new rpc.SocketMessageReader(this.socket);
        writer = new rpc.SocketMessageWriter(this.socket);
        console.log("r2");
        return rpc.createMessageConnection(reader, writer);
    }
    spawnServerWithSocket() {
        return new Promise((resolve, reject) => {
            console.log("inside spawn with socket");
            let childProcess;
            let server;
            const pro1 = new Promise((resolve1, reject) => {
                server = net.createServer(socket => {
                    // When the language server connects, grab socket, stop listening and resolve
                    console.log("inside net.createServer");
                    this.socket = socket;
                    server.close();
                    console.log("about to resolve childProcess");
                    // console.log(this.socket);
                    resolve(childProcess);
                    //console.log("after resolve command");
                }).listen(3000);
            });
            const pro2 = new Promise((resolve2, reject) => {
                //server.listen(3000, '127.0.0.1', () => {
                console.log(server.address());
                // Once we have a port assigned spawn the Language Server with the port
                childProcess = this.spawnServer([``]); //--tcp=127.0.0.1:${server.address().port}
                console.log("childProcess started");
                //});
            });
        });
    }
    spawnServer(extraArgs) {
        console.log("inside spawnserver");
        const command = "java";
        const serverHome = path.join(__dirname, 'server');
        const args = ['-jar', 'plugins/org.eclipse.equinox.launcher_1.5.0.v20180119-0753.jar', '-configuration', 'config_win', '-data'];
        if (extraArgs) {
            args.push(extraArgs);
        }
        //this.logger.debug(`starting "${command} ${args.join(' ')}"`)
        console.log("about to start childprocess");
        const childProcess = cp.spawn(command, args, { cwd: serverHome });
        console.log("returning from spawnServer");
        return childProcess;
    }
    pathToUri(filePath) {
        let newPath = filePath.replace(/\\/g, '/');
        if (newPath[0] !== '/') {
            newPath = `/${newPath}`;
        }
        return encodeURI(`file://${newPath}`).replace(/[?#]/g, encodeURIComponent);
    }
    async getDefinition(params) {
        const definitionLocation = this._connection.gotoDefinition(params);
        return definitionLocation;
    }
}
console.log("Starting");
const clientTest = new myClient();
console.log("instance created successfully");
const textidentifier = { uri: "file:///F:/semester%203/COL106%20Data%20structure/p1/assign1/assign1.java" };
const positionTest = { line: 79, character: 8 };
console.log(textidentifier);
console.log(positionTest);
const testTextPosition = { textDocument: textidentifier, position: positionTest };
console.log(testTextPosition);
async function p() {
    //  console.log(clientTest.pathToUri('F:\semester 3\COL106 Data structure\p1\assign1'));
    // const param = { textDocument://F:\semester 3\COL106 Data structure\p1\assign1,
    //                 position:}
    var t = await clientTest.startServer('F:\semester 3\COL106 Data structure\p1\assign1'); //F:\semester 3\COL106 Data structure\p1\assign1
    console.log("server started successfully");
    //console.log("Now trying definition request");
    //const definitionAnswer = await clientTest.getDefinition(testTextPosition);
    //console.log("definiton request processed , the answer is below");
    //console.log(definitionAnswer);
}
p();
