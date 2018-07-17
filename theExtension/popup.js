function popupCloneFunction(type){
  chrome.runtime.sendMessage({method:"gitCloneRequestFromPopup",type:type});
}

document.addEventListener("DOMContentLoaded",function(event){
  document.getElementById('httpsClone').addEventListener("click",function(){popupCloneFunction('https')});
  document.getElementById('sshClone').addEventListener("click",function(){popupCloneFunction('ssh')});
})
