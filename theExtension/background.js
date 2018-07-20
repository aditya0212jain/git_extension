/**
 * @file Manages all the background execution of the extension
 * @author Aditya Jain
 */

 /** @module background */


/**
*the background script listener of the extension
*listens to messages sent by the content scripts and the also the message from popup.js
* it sends only one request and that is in the case of gitClone to the content scripts
*/
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    //console.log(request);
    console.log("in");
    //the below request is received when the server is started
    if(request.method=="showServerNotification"){
      var options ={
        type:"basic",
        title:"Ready for navigation",
        message:"Server started",
        iconUrl:"./iconNotification.png",
      };
      //method to create a notification
      chrome.notifications.create(options,function(){console.log("this is callback")});
    }
    // called when the result of the query is in different file
    else if(request.method=="openNewTab"){
      //method to create a new tab (can only be called from background scripts)
      chrome.tabs.create({url:request.newLocation});
    }
    //when the popup button is pressed on an invalid page
    else if(request.method=="notValidClonePage"){
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
    }
    //when the cloning request is sent to the local server
    else if(request.method=="sentForCloning"){
      var options ={
        type:"basic",
        title:"Cloning Started",
        message:"Started cloning '"+request.repo+"' repo",
        iconUrl:"./infoIcon.png",
      };
      chrome.notifications.create(options,function(){console.log("this is callback")});
    }
    //when cloning is done successfully , the same message is received from local server
    else if(request.method=="gitCloneResponse"){
      var options ={
        type:"basic",
        title:"Cloning Done",
        message:request.type+" repo",
        iconUrl:"./iconNotification.png",
      };
      chrome.notifications.create(options,function(){console.log("this is callback")});
    }
    //if repo is not in serverWorking but message is received when first time loading the page so
    //not showing the notification (show only when queried about it)
    else if(request.method=="repoNotInServerWorking"){
      console.log("add the clone option");
    }
    //now showing notification when the repo is not present and a query is made
    else if(request.method=="repoNotInServerWorkingQuery"){
      var message;
      console.log(request);
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
    }
    //when the repo is present in the working directory but not in the serverRepos and a query is Made
    //so tell the user to reload to enable navigation
    else if(request.method=="reloadToStart"){
      var options ={
        type:"basic",
        title:"Reload",
        message:"Reload page to start server",
        iconUrl:"./infoIcon.png",
      };
      chrome.notifications.create(options,function(){console.log("this is callback")});
    }
    //sent if local server is not active from the sendToServer function
    else if(request.method=="serverNotRunning"){
      var options ={
        type:"basic",
        title:"Server Not Started",
        message:"Start the server first",
        iconUrl:"./errorIcon.png",
      };
      chrome.notifications.create(options,function(){console.log("this is callback")});
    }
    //request is received from popup.js when button is clicked for gitClone
    //so send the content script of that tab the request to further proceed
    else if(request.method=="gitCloneRequestFromPopup"){
      chrome.tabs.query({active:true,windowType:"normal", currentWindow: true},function(tab){
        console.log(tab[0].id);
        chrome.tabs.sendMessage(tab[0].id,{method:"gitClone",type:request.type});
      });
    }
  });

  /**
  *Made for the listening the click on the notification in case of suggested gitClone page
  */
chrome.notifications.onClicked.addListener(function(notificationId){
  if(notificationId!="undefined"){
    chrome.tabs.create({url: notificationId});
  }
})
