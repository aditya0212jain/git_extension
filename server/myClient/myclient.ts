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

interface LanguageServerProcess extends EventEmitter {
  stdin: stream.Writable;
  stdout: stream.Readable;
  stderr: stream.Readable;
  pid: number;

  kill(signal?: string): void;
  on(event: 'error', listener: (err: Error) => void): this;
  on(event: 'exit', listener: (code: number, signal: string) => void): this;
}

export function pathToUri(filePath: string): string {
  let newPath = filePath.replace(/\\/g, '/');
  if (newPath[0] !== '/') {
    newPath = `/${newPath}`;
  }
  return encodeURI(`file://${newPath}`).replace(/[?#]/g, encodeURIComponent);
}

// The necessary elements for a server that has started or is starting.

interface ActiveServer {
  projectPath: string;
  process: LanguageServerProcess;
  connection: ls.LanguageClientConnection;
  capabilities: ls.ServerCapabilities;
}

type ReportBusyWhile = <T>(
  title: string,
  f: () => Promise<T>,
) => Promise<T>;

export class myClient {
  public socket;
  protected logger!: Logger;
  public _connection;
  protected getInitializeParams(projectPath: string, process: LanguageServerProcess): ls.InitializeParams {
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

  public async startServer(projectPath: string): Promise<ActiveServer> {
    console.log("its in")
    //const process = this.spawnServerWithSocket().then((result) => result );
    const process = await this.spawnServerWithSocket().then((result) => { console.log("in resolve"); return result;});;
    console.log("loaded process");
    this.captureServerErrors(process,projectPath);
    //const process = this.spawnServer([`--tcp=127.0.0.1`]);
    let serverHome = path.join(__dirname,'server');
    //const process = await async f(){ return this.startServerProcess(projectPath); }

    const connection = new LanguageClientConnection(this.createRpcConnection());
    console.log("made connection");
    const initializeParams = this.getInitializeParams(projectPath, process);
    //console.log("y1");
    const initialization = connection.initialize(initializeParams);
    console.log("y2");
    const initializeResponse = await initialization;
    console.log("y3");
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
    process.on('exit', () =>{ console.log("process exit");});
    //newServer.process.kill();
    return newServer;
  }

  private createRpcConnection(): rpc.MessageConnection {
    let reader: rpc.MessageReader;
    let writer: rpc.MessageWriter;
    //console.log("RPC");
    //console.log(this.socket);
    //console.log(this);
    //console.log("r1");
        reader = new rpc.SocketMessageReader(this.socket);
        writer = new rpc.SocketMessageWriter(this.socket);
    //console.log("r2");
    return rpc.createMessageConnection(reader, writer);
  }

  spawnServerWithSocket () : Promise<LanguageServerProcess> {
    return new Promise((resolve, reject) => {
      console.log("inside spawn with socket");
      let childProcess;
      let server;
      //const pro1 = new Promise((resolve1,reject) => {
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
      //});
      const pro2 = new Promise((resolve2,reject) => {
        //server.listen(3000, '127.0.0.1', () => {
          console.log(server.address());
          // Once we have a port assigned spawn the Language Server with the port
          childProcess = this.spawnServer([``]);//--tcp=127.0.0.1:${server.address().port}
          console.log("childProcess started");
          childProcess.on('exit', exitCode => {
          if (!childProcess.killed) {
              console.log("childProcess exit but not killed");
          }
          console.log("childProcess exited");
        });
        //});
      });
      //console.log("why did it stuck :O");

    })
  }

  spawnServer (extraArgs) {
    console.log("inside spawnserver");
    const command = "java";
    const serverHome = path.join(__dirname,'server');
    var platform = os.platform();
    var variable;
    console.log("platform: " + platform);
    if(platform=="linux"){
      variable= "linux"
    }else if(platform=="win32"){
      variable = "win";
    }else if(platform=="darwin"){
      variable = "mac";
    }
    variable = "config_" + variable;
    console.log("variable platform: " + variable);
    const args = ['-jar','plugins/org.eclipse.equinox.launcher_1.5.0.v20180119-0753.jar','-configuration',variable,'-data'];
    if (extraArgs) {
      args.push(extraArgs);
    }
    //this.logger.debug(`starting "${command} ${args.join(' ')}"`)
    //console.log("about to start childprocess");
    const childProcess = cp.spawn(command, args, { cwd: serverHome });
    //console.log("returning from spawnServer");
    return childProcess;
  }


  protected reportBusyWhile: ReportBusyWhile = async (title, f) => {
    this.logger.info(`[Started] ${title}`);
    let res;
    try {
      res = await f();
    } finally {
      this.logger.info(`[Finished] ${title}`);
    }
    return res;
  }

  public async getDefinition(params: ls.TextDocumentPositionParams){
    const definitionLocation = this._connection.gotoDefinition(params);
    return definitionLocation;
  }

  private captureServerErrors(childProcess: LanguageServerProcess, projectPath: string): void {
    childProcess.on('error', (err) => console.log("o1"));
    childProcess.on('exit', (code, signal) => console.log("o2"));
    childProcess.stderr.setEncoding('utf8');
    childProcess.stderr.on('data', (chunk: Buffer) => {
    const errorString = chunk.toString();
    console.log("o3");
    });
  }


}
