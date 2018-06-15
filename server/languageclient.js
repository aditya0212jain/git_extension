"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const jsonrpc = require("vscode-jsonrpc");
const events_1 = require("events");
const logger_1 = require("./logger");
__export(require("vscode-languageserver-protocol"));
// TypeScript wrapper around JSONRPC to implement Microsoft Language Server Protocol v3
// https://github.com/Microsoft/language-server-protocol/blob/master/protocol.md
class LanguageClientConnection extends events_1.EventEmitter {
    constructor(rpc, logger) {
        super();
        this._rpc = rpc;
        this._log = logger || new logger_1.NullLogger();
        this.setupLogging();
        rpc.listen();
        this.isConnected = true;
        this._rpc.onClose(() => {
            this.isConnected = false;
            this._log.warn('rpc.onClose', 'The RPC connection closed unexpectedly');
            this.emit('close');
        });
    }
    setupLogging() {
        this._rpc.onError((error) => this._log.error(['rpc.onError', error]));
        this._rpc.onUnhandledNotification((notification) => {
            if (notification.method != null && notification.params != null) {
                this._log.warn(`rpc.onUnhandledNotification ${notification.method}`, notification.params);
            }
            else {
                this._log.warn('rpc.onUnhandledNotification', notification);
            }
        });
        this._rpc.onNotification((...args) => this._log.debug('rpc.onNotification', args));
    }
    dispose() {
        this._rpc.dispose();
    }
    // Public: Initialize the language server with necessary {InitializeParams}.
    //
    // * `params` The {InitializeParams} containing processId, rootPath, options and
    //            server capabilities.
    //
    // Returns a {Promise} containing the {InitializeResult} with details of the server's
    // capabilities.
    initialize(params) {
        return this._sendRequest('initialize', params);
    }
    // Public: Send an `initialized` notification to the language server.
    initialized() {
        this._sendNotification('initialized', {});
    }
    // Public: Send a `shutdown` request to the language server.
    shutdown() {
        return this._sendRequest('shutdown');
    }
    // Public: Send an `exit` notification to the language server.
    exit() {
        this._sendNotification('exit');
    }
    // Public: Register a callback for a custom message.
    //
    // * `method`   A string containing the name of the message to listen for.
    // * `callback` The function to be called when the message is received.
    //              The payload from the message is passed to the function.
    onCustom(method, callback) {
        this._onNotification({ method }, callback);
    }
    // Public: Send a custom request
    //
    // * `method`   A string containing the name of the request message.
    // * `params`   The method's parameters
    sendCustomRequest(method, params) {
        return this._sendRequest(method, params);
    }
    // Public: Send a custom notification
    //
    // * `method`   A string containing the name of the notification message.
    // * `params`  The method's parameters
    sendCustomNotification(method, params) {
        this._sendNotification(method, params);
    }
    // Public: Register a callback for the `window/showMessage` message.
    //
    // * `callback` The function to be called when the `window/showMessage` message is
    //              received with {ShowMessageParams} being passed.
    onShowMessage(callback) {
        this._onNotification({ method: 'window/showMessage' }, callback);
    }
    // Public: Register a callback for the `window/showMessageRequest` message.
    //
    // * `callback` The function to be called when the `window/showMessageRequest` message is
    //              received with {ShowMessageRequestParam}' being passed.
    // Returns a {Promise} containing the {MessageActionItem}.
    onShowMessageRequest(callback) {
        this._onRequest({ method: 'window/showMessageRequest' }, callback);
    }
    // Public: Register a callback for the `window/logMessage` message.
    //
    // * `callback` The function to be called when the `window/logMessage` message is
    //              received with {LogMessageParams} being passed.
    onLogMessage(callback) {
        this._onNotification({ method: 'window/logMessage' }, callback);
    }
    // Public: Register a callback for the `telemetry/event` message.
    //
    // * `callback` The function to be called when the `telemetry/event` message is
    //              received with any parameters received being passed on.
    onTelemetryEvent(callback) {
        this._onNotification({ method: 'telemetry/event' }, callback);
    }
    // Public: Register a callback for the `workspace/applyEdit` message.
    //
    // * `callback` The function to be called when the `workspace/applyEdit` message is
    //              received with {ApplyWorkspaceEditParams} being passed.
    // Returns a {Promise} containing the {ApplyWorkspaceEditResponse}.
    onApplyEdit(callback) {
        this._onRequest({ method: 'workspace/applyEdit' }, callback);
    }
    // Public: Send a `workspace/didChangeConfiguration` notification.
    //
    // * `params` The {DidChangeConfigurationParams} containing the new configuration.
    didChangeConfiguration(params) {
        this._sendNotification('workspace/didChangeConfiguration', params);
    }
    // Public: Send a `textDocument/didOpen` notification.
    //
    // * `params` The {DidOpenTextDocumentParams} containing the opened text document details.
    didOpenTextDocument(params) {
        this._sendNotification('textDocument/didOpen', params);
    }
    // Public: Send a `textDocument/didChange` notification.
    //
    // * `params` The {DidChangeTextDocumentParams} containing the changed text document
    // details including the version number and actual text changes.
    didChangeTextDocument(params) {
        this._sendNotification('textDocument/didChange', params);
    }
    // Public: Send a `textDocument/didClose` notification.
    //
    // * `params` The {DidCloseTextDocumentParams} containing the opened text document details.
    didCloseTextDocument(params) {
        this._sendNotification('textDocument/didClose', params);
    }
    // Public: Send a `textDocument/willSave` notification.
    //
    // * `params` The {WillSaveTextDocumentParams} containing the to-be-saved text document
    // details and the reason for the save.
    willSaveTextDocument(params) {
        this._sendNotification('textDocument/willSave', params);
    }
    // Public: Send a `textDocument/willSaveWaitUntil` notification.
    //
    // * `params` The {WillSaveTextDocumentParams} containing the to-be-saved text document
    // details and the reason for the save.
    // Returns a {Promise} containing an {Array} of {TextEdit}s to be applied to the text
    // document before it is saved.
    willSaveWaitUntilTextDocument(params) {
        return this._sendRequest('textDocument/willSaveWaitUntil', params);
    }
    // Public: Send a `textDocument/didSave` notification.
    //
    // * `params` The {DidSaveTextDocumentParams} containing the saved text document details.
    didSaveTextDocument(params) {
        this._sendNotification('textDocument/didSave', params);
    }
    // Public: Send a `workspace/didChangeWatchedFiles` notification.
    //
    // * `params` The {DidChangeWatchedFilesParams} containing the array of {FileEvent}s that
    // have been observed upon the watched files.
    didChangeWatchedFiles(params) {
        this._sendNotification('workspace/didChangeWatchedFiles', params);
    }
    // Public: Register a callback for the `textDocument/publishDiagnostics` message.
    //
    // * `callback` The function to be called when the `textDocument/publishDiagnostics` message is
    //              received a {PublishDiagnosticsParams} containing new {Diagnostic} messages for a given uri.
    onPublishDiagnostics(callback) {
        this._onNotification({ method: 'textDocument/publishDiagnostics' }, callback);
    }
    // Public: Send a `textDocument/completion` request.
    //
    // * `params`            The {TextDocumentPositionParams} or {CompletionParams} for which
    //                       {CompletionItem}s are desired.
    // * `cancellationToken` The {CancellationToken} that is used to cancel this request if
    //                       necessary.
    // Returns a {Promise} containing either a {CompletionList} or an {Array} of {CompletionItem}s.
    completion(params, cancellationToken) {
        // Cancel prior request if necessary
        return this._sendRequest('textDocument/completion', params, cancellationToken);
    }
    // Public: Send a `completionItem/resolve` request.
    //
    // * `params` The {CompletionItem} for which a fully resolved {CompletionItem} is desired.
    // Returns a {Promise} containing a fully resolved {CompletionItem}.
    completionItemResolve(params) {
        return this._sendRequest('completionItem/resolve', params);
    }
    // Public: Send a `textDocument/hover` request.
    //
    // * `params` The {TextDocumentPositionParams} for which a {Hover} is desired.
    // Returns a {Promise} containing a {Hover}.
    hover(params) {
        return this._sendRequest('textDocument/hover', params);
    }
    // Public: Send a `textDocument/signatureHelp` request.
    //
    // * `params` The {TextDocumentPositionParams} for which a {SignatureHelp} is desired.
    // Returns a {Promise} containing a {SignatureHelp}.
    signatureHelp(params) {
        return this._sendRequest('textDocument/signatureHelp', params);
    }
    // Public: Send a `textDocument/definition` request.
    //
    // * `params` The {TextDocumentPositionParams} of a symbol for which one or more {Location}s
    // that define that symbol are required.
    // Returns a {Promise} containing either a single {Location} or an {Array} of many {Location}s.
    gotoDefinition(params) {
        return this._sendRequest('textDocument/definition', params);
    }
    // Public: Send a `textDocument/references` request.
    //
    // * `params` The {TextDocumentPositionParams} of a symbol for which all referring {Location}s
    // are desired.
    // Returns a {Promise} containing an {Array} of {Location}s that reference this symbol.
    findReferences(params) {
        return this._sendRequest('textDocument/references', params);
    }
    // Public: Send a `textDocument/documentHighlight` request.
    //
    // * `params` The {TextDocumentPositionParams} of a symbol for which all highlights are desired.
    // Returns a {Promise} containing an {Array} of {DocumentHighlight}s that can be used to
    // highlight this symbol.
    documentHighlight(params) {
        return this._sendRequest('textDocument/documentHighlight', params);
    }
    // Public: Send a `textDocument/documentSymbol` request.
    //
    // * `params`            The {DocumentSymbolParams} that identifies the document for which
    //                       symbols are desired.
    // * `cancellationToken` The {CancellationToken} that is used to cancel this request if
    //                       necessary.
    // Returns a {Promise} containing an {Array} of {SymbolInformation}s that can be used to
    // navigate this document.
    documentSymbol(params, cancellationToken) {
        return this._sendRequest('textDocument/documentSymbol', params);
    }
    // Public: Send a `workspace/symbol` request.
    //
    // * `params` The {WorkspaceSymbolParams} containing the query string to search the workspace for.
    // Returns a {Promise} containing an {Array} of {SymbolInformation}s that identify where the query
    // string occurs within the workspace.
    workspaceSymbol(params) {
        return this._sendRequest('workspace/symbol', params);
    }
    // Public: Send a `textDocument/codeAction` request.
    //
    // * `params` The {CodeActionParams} identifying the document, range and context for the code action.
    // Returns a {Promise} containing an {Array} of {Commands}s that can be performed against the given
    // documents range.
    codeAction(params) {
        return this._sendRequest('textDocument/codeAction', params);
    }
    // Public: Send a `textDocument/codeLens` request.
    //
    // * `params` The {CodeLensParams} identifying the document for which code lens commands are desired.
    // Returns a {Promise} containing an {Array} of {CodeLens}s that associate commands and data with
    // specified ranges within the document.
    codeLens(params) {
        return this._sendRequest('textDocument/codeLens', params);
    }
    // Public: Send a `codeLens/resolve` request.
    //
    // * `params` The {CodeLens} identifying the code lens to be resolved with full detail.
    // Returns a {Promise} containing the {CodeLens} fully resolved.
    codeLensResolve(params) {
        return this._sendRequest('codeLens/resolve', params);
    }
    // Public: Send a `textDocument/documentLink` request.
    //
    // * `params` The {DocumentLinkParams} identifying the document for which links should be identified.
    // Returns a {Promise} containing an {Array} of {DocumentLink}s relating uri's to specific ranges
    // within the document.
    documentLink(params) {
        return this._sendRequest('textDocument/documentLink', params);
    }
    // Public: Send a `documentLink/resolve` request.
    //
    // * `params` The {DocumentLink} identifying the document link to be resolved with full detail.
    // Returns a {Promise} containing the {DocumentLink} fully resolved.
    documentLinkResolve(params) {
        return this._sendRequest('documentLink/resolve', params);
    }
    // Public: Send a `textDocument/formatting` request.
    //
    // * `params` The {DocumentFormattingParams} identifying the document to be formatted as well as
    // additional formatting preferences.
    // Returns a {Promise} containing an {Array} of {TextEdit}s to be applied to the document to
    // correctly reformat it.
    documentFormatting(params) {
        return this._sendRequest('textDocument/formatting', params);
    }
    // Public: Send a `textDocument/rangeFormatting` request.
    //
    // * `params` The {DocumentRangeFormattingParams} identifying the document and range to be formatted
    // as well as additional formatting preferences.
    // Returns a {Promise} containing an {Array} of {TextEdit}s to be applied to the document to
    // correctly reformat it.
    documentRangeFormatting(params) {
        return this._sendRequest('textDocument/rangeFormatting', params);
    }
    // Public: Send a `textDocument/onTypeFormatting` request.
    //
    // * `params` The {DocumentOnTypeFormattingParams} identifying the document to be formatted,
    // the character that was typed and at what position as well as additional formatting preferences.
    // Returns a {Promise} containing an {Array} of {TextEdit}s to be applied to the document to
    // correctly reformat it.
    documentOnTypeFormatting(params) {
        return this._sendRequest('textDocument/onTypeFormatting', params);
    }
    // Public: Send a `textDocument/rename` request.
    //
    // * `params` The {RenameParams} identifying the document containing the symbol to be renamed,
    // as well as the position and new name.
    // Returns a {Promise} containing an {WorkspaceEdit} that contains a list of {TextEdit}s either
    // on the changes property (keyed by uri) or the documentChanges property containing
    // an {Array} of {TextDocumentEdit}s (preferred).
    rename(params) {
        return this._sendRequest('textDocument/rename', params);
    }
    // Public: Send a `workspace/executeCommand` request.
    //
    // * `params` The {ExecuteCommandParams} specifying the command and arguments
    // the language server should execute (these commands are usually from {CodeLens} or {CodeAction}
    // responses).
    // Returns a {Promise} containing anything.
    executeCommand(params) {
        return this._sendRequest('workspace/executeCommand', params);
    }
    _onRequest(type, callback) {
        this._rpc.onRequest(type.method, (value) => {
            this._log.debug(`rpc.onRequest ${type.method}`, value);
            return callback(value);
        });
    }
    _onNotification(type, callback) {
        // this._rpc.onNotification(type.method, (value) => {
        //   this._log.debug(`rpc.onNotification ${type.method}`, value);
        //   callback(value);
        // });
    }
    _sendNotification(method, args) {
        this._log.debug(`rpc.sendNotification ${method}`, args);
        this._rpc.sendNotification(method, args);
    }
    async _sendRequest(method, args, cancellationToken) {
        this._log.debug(`rpc.sendRequest ${method} sending`, args);
        try {
            //const start = performance.now();
            let result;
            if (cancellationToken) {
                result = await this._rpc.sendRequest(method, args, cancellationToken);
            }
            else {
                // If cancellationToken is null or undefined, don't add the third
                // argument otherwise vscode-jsonrpc will send an additional, null
                // message parameter to the request
                result = await this._rpc.sendRequest(method, args);
            }
            //const took = performance.now() - start;
            //this._log.debug(`rpc.sendRequest ${method} received (${Math.floor(took)}ms)`, result);
            return result;
        }
        catch (e) {
            const responseError = e;
            if (cancellationToken && responseError.code === jsonrpc.ErrorCodes.RequestCancelled) {
                this._log.debug(`rpc.sendRequest ${method} was cancelled`);
            }
            else {
                this._log.error(`rpc.sendRequest ${method} threw`, e);
            }
            throw e;
        }
    }
}
exports.LanguageClientConnection = LanguageClientConnection;
