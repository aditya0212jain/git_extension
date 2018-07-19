"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cp = require("child_process");
const rpc = require("vscode-jsonrpc");
const path = require("path");
// import * as Convert from '../utils';
const net = require("net");
const languageclient_1 = require("../languageclient");
const os = require("os");
const shell = require('shelljs');
/**
*Function to convert the filePath into fileUri used by the language server to start
*/
function pathToUri(filePath) {
    let newPath = filePath.replace(/\\/g, '/');
    if (newPath[0] !== '/') {
        newPath = `/${newPath}`;
    }
    return encodeURI(`file://${newPath}`).replace(/[?#]/g, encodeURIComponent);
}
exports.pathToUri = pathToUri;
/**
*Class implementing the languageclient using the languageclient.ts file
*Responsible for setting up the language server and the process of initiliazing it
*/
class myClient {
    constructor() {
        //The below function is never used
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
    //function to get the initiliazing parameters for the server
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
                    workspaceFolders: true,
                    configuration: false,
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
                    },
                    implementation: {
                        dynamicRegistration: false,
                    },
                    typeDefinition: {
                        dynamicRegistration: false,
                    },
                    colorProvider: {
                        dynamicRegistration: false,
                    }
                },
                experimental: {},
            },
            workspaceFolders: null,
        };
    }
    /**
    *Function called to start the language server
    *@async
    *@function
    *@param {string} ProjectPath the path in which the server will be initiated
    */
    async startServer(projectPath) {
        //The below command starts the server using childProcess
        const process = await this.spawnServerWithSocket().then((result) => { return result; });
        ;
        this.captureServerErrors(process, projectPath);
        //the Directory where the server repos are
        let serverHome = path.join(__dirname, 'server');
        //creating a connection using sockets (part of lsp)
        const connection = new languageclient_1.LanguageClientConnection(this.createRpcConnection());
        //getting the initiliazing params for the project path
        const initializeParams = this.getInitializeParams(projectPath, process);
        //initializing the server with the params
        const initialization = connection.initialize(initializeParams);
        //waiting for the server to initialize
        const initializeResponse = await initialization;
        this._connection = connection;
        //below is a implementation of the ActiveServer defined above
        const newServer = {
            projectPath,
            process,
            connection,
            capabilities: initializeResponse.capabilities,
        };
        connection.initialized();
        process.on('exit', () => { console.log("process exit"); });
        console.log("server started");
        //returning the ActiveServer interface object
        return newServer;
    }
    //Function to create a socket connection
    //Following the language server protocol
    createRpcConnection() {
        let reader;
        let writer;
        reader = new rpc.SocketMessageReader(this.socket);
        writer = new rpc.SocketMessageWriter(this.socket);
        return rpc.createMessageConnection(reader, writer);
    }
    /**
    *creates a local server at 3000 and calls the function to spawn the language server
    *@function spawnServerWithSocket
    */
    spawnServerWithSocket() {
        return new Promise((resolve, reject) => {
            let childProcess;
            let server;
            //below server is started at port 3000
            server = net.createServer(socket => {
                // When the language server connects, grab socket, stop listening and resolve
                this.socket = socket;
                server.close();
                //resolving the process
                resolve(childProcess);
            }).listen(3000);
            const pro2 = new Promise((resolve2, reject) => {
                // Once we have a port assigned spawn the Language Server with the port
                childProcess = this.spawnServer([``]); //--tcp=127.0.0.1:${server.address().port}
                //if the childProcess exits with a crash then delete the server temp files and try again
                childProcess.on('exit', exitCode => {
                    if (!childProcess.killed) {
                        console.log("childProcess exit but not killed");
                    }
                    console.log(exitCode);
                    //Deleting the temp files to fix the crash
                    shell.exec("rm -r -f ./server_0.9/.metadata");
                    shell.exec("rm -r -f ./server_0.9/jdt.ls-java-project");
                    //Spawning the server again after the removal of temp files
                    childProcess = this.spawnServer([``]);
                    console.log("again childprocess started after the crash");
                });
                //});
            });
        });
    }
    /**
    *starting the language server using the childProcess
    *@function spawnServer
    */
    spawnServer(extraArgs) {
        const command = "java";
        //const serverHome = path.join(__dirname,'server');
        const serverHome = path.join(__dirname, 'server_0.9');
        //getting the platform on which the program is running
        var platform = os.platform();
        //variabel for the argument to start the server
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
        //putting all the arg for the starting of the language server
        //if using different server then change the launcher argument
        const args = ['-jar', 'plugins/org.eclipse.equinox.launcher_1.5.0.v20180512-1130.jar', '-configuration', variable, '-data']; //launcher_1.5.0.v20180119-0753.jar for old server
        if (extraArgs) {
            args.push(extraArgs);
        }
        //using cp.spawn to start server
        const childProcess = cp.spawn(command, args, { cwd: serverHome });
        return childProcess;
    }
    /**
    *Gets the definition result from the server connection using function defined in languageclient.ts
    *@function getDefinitions
    */
    async getDefinition(params) {
        const definitionLocation = this._connection.gotoDefinition(params);
        return definitionLocation;
    }
    /**
    *capturing server errors
    *@function captureServerErrors
    */
    captureServerErrors(childProcess, projectPath) {
        childProcess.on('error', (err) => console.log("o1"));
        childProcess.on('exit', (code, signal) => console.log("o2"));
        childProcess.stderr.setEncoding('utf8');
        childProcess.stderr.on('data', (chunk) => {
            const errorString = chunk.toString();
        });
    }
}
exports.myClient = myClient;
