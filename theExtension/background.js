chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
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
