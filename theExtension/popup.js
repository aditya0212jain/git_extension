/**
 * @file Manages the popup of the browserAction of the extension
 * @author Aditya Jain
 */

 /** @module popup */


/**
*Called when one of the popup buttons is clicked to send the request to background script("gitCloneRequestFromPopup")
*@function
*@param {string} type https/ssh
*/
function popupCloneFunction(type){
  console.log("in");
  chrome.runtime.sendMessage({method:"gitCloneRequestFromPopup",type:type});
}

/**
*Setting up the click listeners for the buttons in the popup
*/
document.addEventListener("DOMContentLoaded",function(event){
  console.log("in");
  document.getElementById('httpsClone').addEventListener("click",function(){popupCloneFunction('https')});
  document.getElementById('sshClone').addEventListener("click",function(){popupCloneFunction('ssh')});
})
