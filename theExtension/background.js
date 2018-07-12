chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(request.method=="showServerNotification"){
      var options ={
        type:"basic",
        title:"Ready for navigation",
        message:"Server started",
        iconUrl:"./iconNotification.png",
      };
      console.log("its here");
      chrome.notifications.create(options,function(){console.log("this is callback")});
    }else if(request.method=="openNewTab"){
      chrome.tabs.create({url:request.newLocation});
    }else if(request.method=="notValidClonePage"){
      var options ={
        type:"basic",
        title:"Invalid Page",
        message:"Open a gitHub repo page",
        iconUrl:"./infoIcon.png",
      };
      chrome.notifications.create(options,function(){console.log("this is callback")});
    } else if(request.method=="sentForCloning"){
      var options ={
        type:"basic",
        title:"Cloning Started",
        message:"Started cloning '"+request.repo+"' repo",
        iconUrl:"./infoIcon.png",
      };
      chrome.notifications.create(options,function(){console.log("this is callback")});
    }else if(request.method=="gitCloneResponse"){
      var options ={
        type:"basic",
        title:"Cloning Done",
        message:request.type+" repo",
        iconUrl:"./iconNotification.png",
      };
      chrome.notifications.create(options,function(){console.log("this is callback")});
    }
  });



chrome.browserAction.onClicked.addListener(function(tab) {
  // No tabs or host permissions needed!
  console.log(tab.id);
  chrome.tabs.sendMessage(tab.id,{method:"gitClone"});
  //console.log('Turning ' + tab.url + ' red!');
});
