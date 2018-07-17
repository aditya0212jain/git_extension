chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(request);
    if(request.method=="showServerNotification"){
      var options ={
        type:"basic",
        title:"Ready for navigation",
        message:"Server started",
        iconUrl:"./iconNotification.png",
      };
      chrome.notifications.create(options,function(){console.log("this is callback")});
    }else if(request.method=="openNewTab"){
      chrome.tabs.create({url:request.newLocation});
    }else if(request.method=="notValidClonePage"){
      var message;
      if(request.url=="undefined"){
        message="Open a gitHub repo page";
      }else{
        message="First try going to "+request.url+" by clicking here";
      }
      var options ={
        type:"basic",
        title:"Invalid Page",
        message:message,
        iconUrl:"./infoIcon.png",
      };
      chrome.notifications.create(request.url,options,function(){console.log("this is callback")});
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
    }else if(request.method=="repoNotInServerWorking"){
      console.log("add the clone option");
    }else if(request.method=="repoNotInServerWorkingQuery"){
      var message;
      if(request.url=="undefined"){
        message="Open a gitHub repo page";
      }else{
        message="First try going to "+request.url+" by clicking here";
      }
      var options ={
        type:"basic",
        title:"Get this repo for navigation",
        message:message,
        iconUrl:"./infoIcon.png",
      };
      chrome.notifications.create(request.url,options,function(){console.log("this is callback")});
    }else if(request.method=="reloadToStart"){
      var options ={
        type:"basic",
        title:"Reload",
        message:"Reload page to start server",
        iconUrl:"./infoIcon.png",
      };
      chrome.notifications.create(options,function(){console.log("this is callback")});
    }else if(request.method=="serverNotRunning"){
      var options ={
        type:"basic",
        title:"Server Not Started",
        message:"Start the server first",
        iconUrl:"./errorIcon.png",
      };
      chrome.notifications.create(options,function(){console.log("this is callback")});
    }else if(request.method=="gitCloneRequestFromPopup"){
      chrome.tabs.query({active:true,windowType:"normal", currentWindow: true},function(tab){
        console.log(tab[0].id);
        chrome.tabs.sendMessage(tab[0].id,{method:"gitClone",type:request.type});
      });
    }
  });

chrome.notifications.onClicked.addListener(function(notificationId){
  if(notificationId!="undefined"){
    chrome.tabs.create({url: notificationId});
  }
})
