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

interface LanguageServerProcess extends EventEmitter {
  stdin: stream.Writable;
  stdout: stream.Readable;
  stderr: stream.Readable;
  pid: number;

  kill(signal?: string): void;
  on(event: 'error', listener: (err: Error) => void): this;
  on(event: 'exit', listener: (code: number, signal: string) => void): this;
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

class myClient {
  public socket;
  protected logger!: Logger;

  protected getInitializeParams(projectPath: string, process: LanguageServerProcess): ls.InitializeParams {
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

  public async startServer(projectPath: string): Promise<ActiveServer> {
    // const process = await this.reportBusyWhile(
    //   `Starting`,
    //   async () => this.startServerProcess(),
    // );
    console.log("its in")
    //const process = this.spawnServerWithSocket().then((result) => result );
    const process = await this.spawnServerWithSocket().then((result) => { console.log("in resolve"); return result;});;
    console.log("loaded process");
    //const process = this.spawnServer([`--tcp=127.0.0.1`]);
    let serverHome = path.join(__dirname,'server');
    //const process = await async f(){ return this.startServerProcess(projectPath); }

    const connection = new LanguageClientConnection(this.createRpcConnection());
    console.log("made connection");
    const initializeParams = this.getInitializeParams(projectPath, process);
    console.log("y1");
    const initialization = connection.initialize(initializeParams);
    console.log("y2");
    const initializeResponse = await initialization;
    console.log("y3");
    console.log(initializeResponse);
    const newServer = {
      projectPath,
      process,
      connection,
      capabilities: initializeResponse.capabilities,
    };
    console.log("y4");
    connection.initialized();
    console.log("y5");
    return newServer;
  }

  private createRpcConnection(): rpc.MessageConnection {
    let reader: rpc.MessageReader;
    let writer: rpc.MessageWriter;
    //console.log(this.socket);
    console.log("r1");
        reader = new rpc.SocketMessageReader(this.socket);
        writer = new rpc.SocketMessageWriter(this.socket);
    console.log("r2");
    return rpc.createMessageConnection(reader, writer);
  }

  spawnServerWithSocket () : Promise<LanguageServerProcess> {
    return new Promise((resolve, reject) => {
      console.log("inside spawn with socket");
      let childProcess;
      let server;
      const pro1 = new Promise((resolve1,reject) => {
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
      const pro2 = new Promise((resolve2,reject) => {
        //server.listen(3000, '127.0.0.1', () => {
          console.log(server.address());
          // Once we have a port assigned spawn the Language Server with the port
          childProcess = this.spawnServer([``]);//--tcp=127.0.0.1:${server.address().port}
          console.log("childProcess started");
        //});
      });

    })
  }

  spawnServer (extraArgs) {
    console.log("inside spawnserver");
  const command = "java";
  const serverHome = path.join(__dirname,'server');
    const args = ['-jar','plugins/org.eclipse.equinox.launcher_1.5.0.v20180119-0753.jar','-configuration','config_win','-data'];
    if (extraArgs) {
      args.push(extraArgs);
    }
    //this.logger.debug(`starting "${command} ${args.join(' ')}"`)
    console.log("about to start childprocess");
    const childProcess = cp.spawn(command, args, { cwd: serverHome });
    console.log("returning from spawnServer");
    return childProcess;
  }

  public pathToUri(filePath: string): string {
    let newPath = filePath.replace(/\\/g, '/');
    if (newPath[0] !== '/') {
      newPath = `/${newPath}`;
    }
    return encodeURI(`file://${newPath}`).replace(/[?#]/g, encodeURIComponent);
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



}

console.log("Starting");
const clientTest = new myClient();
console.log("instance created successfully");
console.log(clientTest.socket);
async function p(){
//var t = await clientTest.startServer('F:\semester 3\COL106 Data structure\p1\assign1');
console.log("server started successfully");
}
p();
