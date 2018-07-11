function sendInfo(){
chrome.runtime.sendMessage({method:"gitClone",type:"https"});
}
