/**
 * @file Manages the onload events of the extension
 * @author Aditya Jain
 */

 /** @module onLoad */

/**
* the starting or entry point of the content script
*/
window.onload = function () {onloadFunc();};

/**
* the listener for messaging
* it receives the messages from the background scripts
*/
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("in");
    // request when gitClone button is pressed in the popup.js
    if(request.method=="gitClone"){
      //calling the function for cloning
      gitCloneFunction(request.type);
    }
  });

/**
*Function called after receiving the message in the content script
*@function
*@param {string} type https/ssh
*/
function gitCloneFunction(type){
  console.log("in");
  //the variable which will contain the info regarding the cloning
  var useType;
  //setting useType according to type
  if(type=='https'){
    useType = document.getElementsByClassName('https-clone-options')[0];
  }else{
    useType = document.getElementsByClassName('ssh-clone-options')[0];
  }

  if(useType!=undefined||useType!=null){
    var inputGroup = useType.getElementsByClassName('input-group');
    var pol = $(inputGroup).children();
    console.log($(pol[0]).attr('value'));
    //the url for the gitClone
    var url = $(pol[0]).attr('value');
    //the name of the repo which is being cloned
    var repo = $('strong[itemprop="name"]').find('a').html();
    var author = getAuthorRepoPage();
    //sending the request to the local server
    sendToServer({method:"gitClone",url:url,repo:repo,downloadType:type,author:author});
    //sending the message to the background to show the sentForCloning notification
    chrome.runtime.sendMessage({method:"sentForCloning",repo:repo,author:author},function(response){});
  }
  else{
    //if entered here means not the correct page for cloning
    var tyu= $('h1.public').find('span.author').find('a.url').html();
    var repo = $('strong[itemprop="name"]').find('a').html();
    //suggested url
    var urlForCloning;
    if(tyu==undefined||repo==undefined){
      urlForCloning = "undefined";
    }else{
      urlForCloning = "https://github.com/"+tyu+"/"+repo;
    }
    //sending the message to the background script with suggested url for cloning("undefined" if not existing)
    chrome.runtime.sendMessage({method:"notValidClonePage",url:urlForCloning}, function(response) {});
  }
}

/**
*This function is called when a new page is loaded
*@function
*/
function onloadFunc () {
  console.log("in");
  var type = getPageType();
  var typeObject;
  if(type=="blob"){
    typeObject = getBlobObject();
    //console.log(typeObject);
    sendToServer(typeObject);
    preparePage(typeObject);
  }
  else if (type=="pull"){
    typeObject = getPullObject();
    var viewType = getPullViewType();
    //console.log(typeObject);
    //if(viewType=='split'){
      // sendToServer(typeObject);
      // preparePage(typeObject);
      prepareExpanders(typeObject);
    // }else{
      sendToServer(typeObject);
      preparePage(typeObject);
    //   prepareExpanders(typeObject);
    // }
  }
  // sendToServer(typeObject);
  // preparePage(typeObject);
}

/**
*Preparing the expanders in the PRs
*@function
*@param {Object} obj typeObject , contains info regarding the page loaded
*/
function prepareExpanders(obj){
  console.log("in");
  //getting all the expanders
  var expanders = document.getElementsByClassName('diff-expander');
  for(i=0;i<expanders.length;i++){
    expanders[i].addEventListener("click",function(){
      //setTimeout used so that the content can be loaded before using the next functions
      setTimeout(function(){addSpans(obj.method,obj.repo,[obj.branchBase,obj.branchHead],obj.author);prepareExpanders(obj);},600);
    });
  }
}

/**
*Used for getting the type of page which is being used
*@function
*@return pull/blob/notValid
*/
function getPageType(){
  console.log("in");
  var url = document.URL;
  var RegexPull = /(.)*(github)(.)*(pull)(.)*(files)(.)*/g;
  var RegexBlob = /(.)*(github)(.)*(blob)(.)*/g;
  if(RegexPull.test(url)==true){
    return "pull";
  }
  else if (RegexBlob.test(url)==true){
      return "blob";
  }
  else{
    return "notValid";
  }
}

/**
*Used to get the typeObject for the blob page
*@function
*@return Object with method,repo,branch
*/
function getBlobObject(){
  var url = document.URL;
  url = url.split('/');
  var i = url.indexOf('blob');
  var authorName = url[i-2];

  var blobpath = document.getElementById('blob-path');
  var path = blobpath.textContent.split('/');
  var repoName = path[0].replace(/\r?\n|\r|\s/g,"");
  path.splice(0,1);
  var final = path.join('/');
  final = final.replace(/\r?\n|\r|\s/g,"");
  var regex = new RegExp('(blob\/)((.)*)\/'+final);
  var match = regex.exec(document.URL);
  var branch = match[2];
  var obj = {method : "blob" ,
  repo : repoName,
  author:authorName,
  branch : branch }
  return obj;
}

/**
*Used to get the typeObject for the pull page
*@function
*@return Object with method,repo,branchBase,branchHead
*/
function getPullObject(){
  var url = document.URL;
  url = url.split('/');
  var i = url.indexOf('pull');
  var repoName = url[i-1];
  var authorName = url[i-2];
  var branchBase = document.getElementsByClassName('base-ref')[0];
  var branchHead = document.getElementsByClassName('head-ref')[0];
  var obj = { method : "pull" , repo : repoName , branchBase : branchBase.textContent , branchHead : branchHead.textContent ,author:authorName};
  return obj;
}

/**
*Send the obj request to the local server
*@function
*/
function sendToServer(obj){
  console.log("in");
  var pReq = new XMLHttpRequest();
  //adding the listener as reqListener function
  pReq.addEventListener("load", reqListener);
  //request type POST and the server
  pReq.open("POST", "http://localhost:8080");
  pReq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  //if error occurs while sending the request
  //generally the server is not active
  pReq.onerror = function() {
    //show notification only if the request is of query or gitClone
    //otherwise it will show everytime when a page loads
    if(obj.method=="query"||obj.method=="gitClone"){
      chrome.runtime.sendMessage({method:"serverNotRunning"},function(response){});
    }
  }
  //sending after converting into string
  pReq.send(JSON.stringify(obj));
}

/**
*Called when a new page is loaded of either blob or pull type
*@function
*@param {Object} obj the typeObject for the page
*/
function preparePage(obj){
  console.log("in");
  if(obj.method=="blob"){
    //incase of blob only add the spans for navigation
    addSpans(obj.method,obj.repo,[obj.branch],obj.author);
  }else if (obj.method=="pull"){
    //for pull add all the other features
    //the below function adds the test buttons
    toggleSide();
    //now adding the sorting button
    placeSortButton(obj);
    //now adding the spans for navigation
    addClick(obj);
  }
}

/**
*For getting the type of pull view
*@function
*@return split/unified
*/
function getPullViewType(){
  console.log("in");
  var diffbar = document.getElementsByClassName('diffbar')[0];
  var uview = $(diffbar).find( "input[value='unified']" );
  var sview = $(diffbar).find("input[value='split']");
  if($(sview).attr('checked')=='checked'){
    return 'split';
  }else{
    return 'unified';
  }
}
