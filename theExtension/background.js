chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(request.clicked){
      console.log("yes it is in");
    }
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if(request.method=="gitClone"){
      console.log("gitClone");
    }
    if(request.method){
      var options ={
        type:"basic",
        title:"Ready for navigation",
        message:"Server started",
        iconUrl:"./iconNotification.png",
      };
      console.log("its here");
      chrome.notifications.create(options,function(){console.log("this is callback")});
    }else{
      chrome.tabs.create({url:request.newLocation});
    }
  });

console.log("it is background");
chrome.browserAction.onClicked.addListener(function(tab) {
  // No tabs or host permissions needed!
  console.log(tab.id);
  chrome.tabs.sendMessage(tab.id,{method:"gitClone"});
  //console.log('Turning ' + tab.url + ' red!');
});
