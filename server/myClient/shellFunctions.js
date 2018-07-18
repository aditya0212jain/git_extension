"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const start = require("./start");
const os = require("os");
const shell = require('shelljs');

/**
*@file Contains the shell functions to be called for shell file executions
*@author Aditya Jain
*/
/**
*@module shellFunctions
*/


/**
*Copies the directory with the desired branch from the working directory into the serverRepos folder.
*By first creating the argShellBlob file it gives the arguments to the shell file
*@function
*@param {string} repo the name of the repo
*@param {string} branch the name of the branch
*/
function runShellBlob(repo, branch) {
    var platform = os.platform();
    if (platform == "linux" || platform == "darwin") {
        var text = '\'console.log("' + start.workingDirectory + '");console.log("' + start.serverDirectory + '");console.log("' + repo + '");console.log("' + branch + '");\'';
        var command = "echo " + text + " > " + "argShellBlob.js";
        shell.exec(command);
        shell.exec('chmod +x runShellBlobLinux.sh');
        shell.exec('./runShellBlobLinux.sh');
    }
    else if (platform == "win32") {
        var text = 'console.log("' + start.workingDirectory + '");console.log("' + start.serverDirectory + '");console.log("' + repo + '");console.log("' + branch + '");';
        var command = "echo " + text + " > " + "argShellBlob.js";
        //console.log(command);
        shell.exec(command);
        shell.exec('chmod +x runShellBlob.sh');
        shell.exec('sh runShellBlob.sh');
    }
}
exports.runShellBlob = runShellBlob;

/**
*Copies the directory with the desired branches from the working directory into the serverRepos folder.
*By first creating the argShellPull file it gives the arguments to the shell file
*@function
*@param {string} repo the name of the repo
*@param {string} branch1 the name of first branch
*@param {string} branch2 the name of second branch
*/
function runShellPull(repo, branch1, branch2) {
    var platform = os.platform();
    if (platform == "linux" || platform == "darwin") {
        var text = '\'console.log("' + start.workingDirectory + '");console.log("' + start.serverDirectory + '");console.log("' + repo + '");console.log("' + branch1 + '");' + 'console.log("' + branch2 + '");\'';
        var command = "echo " + text + " > " + "argShellPull.js";
        shell.exec(command);
        shell.exec('chmod +x runShellPullLinux.sh');
        shell.exec('./runShellPullLinux.sh');
    }
    else if (platform == "win32") {
        var text = 'console.log("' + start.workingDirectory + '");console.log("' + start.serverDirectory + '");console.log("' + repo + '");console.log("' + branch1 + '");' + 'console.log("' + branch2 + '");';
        var command = "echo " + text + " > " + "argShellPull.js";
        shell.exec(command);
        shell.exec('chmod +x runShellPull.sh');
        shell.exec('sh runShellPull.sh');
    }
}
exports.runShellPull = runShellPull;
